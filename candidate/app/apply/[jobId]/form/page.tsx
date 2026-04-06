"use client";

import { useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DeprecatedManualFormPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const router = useRouter();
  const { jobId } = use(params);

  useEffect(() => {
    toast.info("Manual apply form has moved. Please select a CV from your library.");
    router.replace(`/apply/${jobId}`);
  }, [jobId, router]);

  return null;
}
