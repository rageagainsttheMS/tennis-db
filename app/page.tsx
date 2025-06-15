import { getMatchTest } from "@/lib/actions/match.actions";



export default async function Home() {

  const result = await getMatchTest();
  console.log(JSON.stringify(result));

  return (
    <></>
  );
}
