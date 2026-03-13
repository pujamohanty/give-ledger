import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DisbursementsClient from "./DisbursementsClient";

export default async function AdminDisbursementsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/login");

  const disbursements = await prisma.disbursement.findMany({
    include: {
      blockchainRecord: true,
      milestone: {
        include: {
          evidenceFiles: true,
          outputMarkers: true,
          project: {
            include: {
              ngo: { select: { orgName: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = disbursements.map((d) => ({
    id: d.id,
    ngoName: d.milestone.project.ngo.orgName,
    projectTitle: d.milestone.project.title,
    milestoneName: d.milestone.name,
    requestedAmount: d.requestedAmount,
    approvedAmount: d.approvedAmount,
    status: d.status,
    txHash: d.blockchainRecord?.txHash ?? d.txHash,
    createdAt: d.createdAt,
    narrative: d.milestone.completionNarrative,
    evidenceFiles: d.milestone.evidenceFiles.map((f) => ({
      fileName: f.fileName,
      url: f.url,
    })),
    outputMarkers: d.milestone.outputMarkers.map((om) => ({
      label: om.label,
      value: om.value,
      unit: om.unit,
    })),
  }));

  return <DisbursementsClient initialDisbursements={data} />;
}
