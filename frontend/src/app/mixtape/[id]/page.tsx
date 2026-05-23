import CassettePlayerPage from "./CassettePlayerPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Mixtape #${id} — retrowave`,
    description: "Listen to this mixtape on retrowave",
    openGraph: {
      title: `Mixtape #${id} — retrowave`,
      description: "Listen to this mixtape on retrowave",
      type: "music.playlist",
    },
  };
}

export default async function MixtapePage({ params }: PageProps) {
  const { id } = await params;
  return <CassettePlayerPage id={id} />;
}
