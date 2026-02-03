import TradespersonProfileDetail from "../../components/TradespersonProfileDetail"



export default async function TradespersonProfilePage({ params }) {
  const { id } = await params;
  return <TradespersonProfileDetail profileId={id} />;
}
