import { ImageResponse } from "next/og";
import { OgFrame, OG_SIZE } from "@/components/og";
import { PROFILE } from "@/content/site";

export const alt = `${PROFILE.name}: ML and software engineer`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <OgFrame
        kicker="ML and software engineer, IIT Madras"
        title={PROFILE.name}
        lines={[
          "GPT from first principles: KV-cache exact to 5.96e-8",
          "0.989 F0.5 resolving 12.5M records",
          "Live market maker with 4.04 ms p99 inference",
        ]}
      />
    ),
    size,
  );
}
