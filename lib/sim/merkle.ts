/**
 * Chunk-level delta sync with a Merkle tree, the core of Distributed File Sync.
 *
 * A file is cut into chunks, each chunk is hashed with SHA-256, and the hashes are
 * folded pairwise into a tree. Equal roots mean equal files, decided with 32 bytes.
 * When the roots differ, peers compare leaf hashes and transfer only the chunks
 * whose hashes differ.
 *
 * Fixed-size chunking has a known weakness: insert one byte near the start and every
 * later chunk boundary shifts, so every chunk "changes". Content-defined chunking
 * (boundaries chosen by a rolling hash of the content itself) re-synchronises after
 * the edit. It is included here as an extension, not as part of the original system.
 */

import { mulberry32 } from "./rng";

export type Chunking = "fixed" | "content-defined";

export interface Chunk {
  start: number;
  end: number; // exclusive
  hash: string; // hex SHA-256
}

export interface MerkleTree {
  levels: string[][]; // levels[0] = leaf hashes, last level = [root]
  root: string;
}

const HASH_BYTES = 32;

async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const buf = await globalThis.crypto.subtle.digest("SHA-256", data as BufferSource);
  return new Uint8Array(buf);
}

const toHex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");

function fromHex(h: string): Uint8Array {
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(2 * i, 2 * i + 2), 16);
  return out;
}

/** Boundaries for fixed-size chunks. */
export function fixedBoundaries(len: number, size: number): number[] {
  const cuts: number[] = [];
  for (let i = size; i < len; i += size) cuts.push(i);
  return cuts;
}

/**
 * Content-defined boundaries using a gear-style rolling hash: cut where the low bits
 * of the hash are zero, with minimum and maximum chunk lengths around the target.
 */
export function contentDefinedBoundaries(data: Uint8Array, target: number): number[] {
  const bits = Math.max(1, Math.round(Math.log2(target)));
  const shift = 32 - bits; // test the high bits, which depend on the last 32 bytes
  const min = Math.max(2, Math.floor(target / 4));
  const max = target * 4;
  const cuts: number[] = [];
  let h = 0;
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    h = ((h << 1) + GEAR[data[i]]) >>> 0;
    const len = i + 1 - last;
    if ((len >= min && h >>> shift === 0) || len >= max) {
      if (i + 1 < data.length) cuts.push(i + 1);
      last = i + 1;
      // No reset: the shift forgets old bytes, so cuts depend on content, not on the previous cut.
    }
  }
  return cuts;
}

/**
 * 256 fixed pseudo-random 32-bit values for the gear hash. They must be genuinely
 * random-looking: an xorshift table has linear low bits and never triggers a cut.
 */
const GEAR: Uint32Array = (() => {
  const rnd = mulberry32(0xc0ffee);
  const g = new Uint32Array(256);
  for (let i = 0; i < 256; i++) g[i] = Math.floor(rnd() * 4294967296) >>> 0;
  return g;
})();

export async function chunkAndHash(data: Uint8Array, chunking: Chunking, size: number): Promise<Chunk[]> {
  const cuts = chunking === "fixed" ? fixedBoundaries(data.length, size) : contentDefinedBoundaries(data, size);
  const edges = [0, ...cuts, data.length];
  const chunks: Chunk[] = [];
  for (let i = 0; i + 1 < edges.length; i++) {
    const [start, end] = [edges[i], edges[i + 1]];
    if (end <= start && data.length > 0) continue;
    chunks.push({ start, end, hash: toHex(await sha256(data.subarray(start, end))) });
  }
  return chunks;
}

export async function buildTree(leaves: string[]): Promise<MerkleTree> {
  if (leaves.length === 0) {
    const empty = toHex(await sha256(new Uint8Array()));
    return { levels: [[empty]], root: empty };
  }
  const levels: string[][] = [leaves];
  while (levels[levels.length - 1].length > 1) {
    const prev = levels[levels.length - 1];
    const next: string[] = [];
    for (let i = 0; i < prev.length; i += 2) {
      if (i + 1 === prev.length) {
        next.push(prev[i]); // odd node is promoted unchanged
      } else {
        const joined = new Uint8Array(2 * HASH_BYTES);
        joined.set(fromHex(prev[i]), 0);
        joined.set(fromHex(prev[i + 1]), HASH_BYTES);
        next.push(toHex(await sha256(joined)));
      }
    }
    levels.push(next);
  }
  return { levels, root: levels[levels.length - 1][0] };
}

export interface SyncPlan {
  local: Chunk[];
  remote: Chunk[];
  localTree: MerkleTree;
  remoteTree: MerkleTree;
  identical: boolean;
  /** Indices of local chunks the remote does not already hold (matched by hash). */
  missing: number[];
  bytesFullCopy: number;
  bytesHashes: number;
  bytesChunks: number;
}

/**
 * Plan the transfer from local to remote. Chunks are matched by hash, not position,
 * so a chunk that merely moved is not re-sent.
 */
export async function planSync(local: Uint8Array, remote: Uint8Array, chunking: Chunking, size: number): Promise<SyncPlan> {
  const [lc, rc] = await Promise.all([chunkAndHash(local, chunking, size), chunkAndHash(remote, chunking, size)]);
  const [lt, rt] = await Promise.all([buildTree(lc.map((c) => c.hash)), buildTree(rc.map((c) => c.hash))]);
  const identical = lt.root === rt.root;
  const have = new Set(rc.map((c) => c.hash));
  const missing = identical ? [] : lc.flatMap((c, i) => (have.has(c.hash) ? [] : [i]));
  return {
    local: lc,
    remote: rc,
    localTree: lt,
    remoteTree: rt,
    identical,
    missing,
    bytesFullCopy: local.length,
    bytesHashes: identical ? HASH_BYTES : HASH_BYTES + lc.length * HASH_BYTES,
    bytesChunks: missing.reduce((s, i) => s + (lc[i].end - lc[i].start), 0),
  };
}

/** Apply a plan: rebuild the local file from remote-held chunks plus the transferred ones. */
export function reconstruct(local: Uint8Array, remote: Uint8Array, plan: SyncPlan): Uint8Array {
  const byHash = new Map<string, Uint8Array>();
  for (const c of plan.remote) byHash.set(c.hash, remote.subarray(c.start, c.end));
  const sent = new Set(plan.missing);
  const parts = plan.local.map((c, i) => (sent.has(i) ? local.subarray(c.start, c.end) : byHash.get(c.hash)!));
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
