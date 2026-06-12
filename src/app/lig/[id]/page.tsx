import { ComingSoon } from "@/components/placeholder/ComingSoon";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ComingSoon kind="league" value={id} />;
}
