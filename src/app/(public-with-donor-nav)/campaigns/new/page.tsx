import { redirect } from "next/navigation";

// Campaign creation lives in the donor portal so the sidebar stays visible.
export default function NewCampaignPage() {
  redirect("/donor/campaigns/new");
}
