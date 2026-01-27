import { getCurrentUser } from "@/lib/serverAuth";
import CreateJobForm from "./CreateJobForm";

export default async function CreateJobPage() {
  const user = await getCurrentUser();

  console.log("SERVER USER:", user);

  return (
    <CreateJobForm user={JSON.parse(JSON.stringify(user))} />
  );
}
