import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import ProjectDetailClient from "./ProjectDetailClient";

export async function generateStaticParams() {
  return ["1", "2", "3", "4", "5", "6"].map((id) => ({ id }));
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />
      <ProjectDetailClient projectId={id} />
    </div>
  );
}
