"use client";

import { useEffect } from "react";
import { use } from "react";
import { toast } from "sonner";
import { useRouterWithLoader } from "@/hooks/use-router-with-loader";

export default function DeprecatedUploadApplyPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const router = useRouterWithLoader();
  const { jobId } = use(params);

  useEffect(() => {
    toast.info("Upload during apply is deprecated. Upload CV from profile first.");
    router.replace(`/apply/${jobId}`);
  }, [jobId, router]);

  return null;
}
