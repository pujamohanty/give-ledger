import { Suspense } from "react";
import SubmitMilestoneForm from "./SubmitMilestoneForm";

export default function SubmitMilestonePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <SubmitMilestoneForm />
    </Suspense>
  );
}
