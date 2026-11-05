import type { Source } from "@/content/types";
import { sourceText, sourceUrl } from "@/content/site";

/** A citation to the exact file and line in a public repository. */
export function SourceLink({ source }: { source: Source }) {
  return (
    <a className="source" href={sourceUrl(source)} target="_blank" rel="noopener noreferrer">
      {sourceText(source)}
    </a>
  );
}
