import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import ProjectsClient from "./ProjectsClient";

export default async function ProjectsPage() {
  const session = await auth();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />
      <ProjectsClient />
    </div>
  );
}
