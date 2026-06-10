"use client";

import { useEffect } from "react";
import { use } from "react";
import { toast } from "sonner";
import { useRouterWithLoader } from "@/hooks/use-router-with-loader";
import { messages } from "@/lib/messages";

export default function DeprecatedUploadApplyPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const router = useRouterWithLoader();
  const { jobId } = use(params);

  useEffect(() => {
    toast.info(messages.apply.movedToLibrary);
    router.replace(`/apply/${jobId}`);
  }, [jobId, router]);

  return null;
}
