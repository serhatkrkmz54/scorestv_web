import { ComingSoon } from "@/components/placeholder/ComingSoon";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ComingSoon kind="team" value={slug} />;
}
