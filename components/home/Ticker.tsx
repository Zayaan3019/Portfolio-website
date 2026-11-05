/* A market-data tape of results. Duplicated once so the CSS loop is seamless. */

const TAPE: { sym: string; px: string; note: string; up?: boolean }[] = [
  { sym: "AMZN-ML-26", px: "175 / 90,000", note: "top 0.2%", up: true },
  { sym: "AMEX-CODESTREET", px: "6 / 11,500", note: "finalist", up: true },
  { sym: "CODEFORCES", px: "1423", note: "specialist", up: true },
  { sym: "KV-CACHE-DEV", px: "5.96e-8", note: "vs full pass" },
  { sym: "ER-MACRO-F0.5", px: "0.989", note: "12.5M records", up: true },
  { sym: "DEEPLOB-P99", px: "4.04 ms", note: "CPU, ONNX" },
  { sym: "POSIX-CASES", px: "4,111", note: "pjdfstest", up: true },
  { sym: "SAI-2026", px: "PAPER", note: "sole author", up: true },
  { sym: "EVAL-GATE", px: "10,000", note: "paired resamples" },
  { sym: "SYSLENS-CPU", px: "−41%", note: "agent overhead" },
  { sym: "VIT-CIFAR10", px: "83.68%", note: "from scratch" },
  { sym: "IITM-CGPA", px: "8.46", note: "out of 10", up: true },
];

function Run({ hidden }: { hidden?: boolean }) {
  return (
    <ul className="tape-run" aria-hidden={hidden || undefined}>
      {TAPE.map((t) => (
        <li key={t.sym}>
          <span className="tape-sym">{t.sym}</span>
          <span className="tape-px">{t.px}</span>
          <span className={t.up ? "tape-note up" : "tape-note"}>
            {t.up ? "▲" : "●"} {t.note}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Ticker() {
  return (
    <div className="tape" role="region" aria-label="Selected results">
      <div className="tape-track">
        <Run />
        <Run hidden />
      </div>
    </div>
  );
}
