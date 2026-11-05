import { ImageResponse } from "next/og";
import { OgFrame, OG_SIZE } from "@/components/og";
import { PROJECTS, projectBySlug } from "@/content/projects";
import { PROFILE } from "@/content/site";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Project case study";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug)!;
  return new ImageResponse(
    <OgFrame kicker={PROFILE.name} title={p.title} lines={[p.tagline, `${p.headline.figure}  ${p.headline.label}`]} />,
    size,
  );
}
