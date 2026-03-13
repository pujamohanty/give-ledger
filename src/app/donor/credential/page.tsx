import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Redirect authenticated donor to their personal credential page
export default async function DonorCredentialRedirect() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  redirect(`/credential/${session.user.id}`);
}
