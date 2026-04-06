"use client";

import { useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DeprecatedUploadApplyPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const router = useRouter();
  const { jobId } = use(params);

  useEffect(() => {
    toast.info("Upload during apply is deprecated. Upload CV from profile first.");
    router.replace(`/apply/${jobId}`);
  }, [jobId, router]);

  return null;
}
