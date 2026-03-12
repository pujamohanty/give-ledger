import { Suspense } from "react";
import NewCampaignForm from "./NewCampaignForm";

export default function NewCampaignPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <NewCampaignForm />
    </Suspense>
  );
}
