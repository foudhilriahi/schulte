import { BottomNav } from "@/components/bottom-nav";
import { Providers } from "@/components/providers";
import { RealtimeProvider } from "@/components/realtime-provider";
import { ToastProvider } from "@/components/toast-provider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <RealtimeProvider />
      <div className="max-w-lg mx-auto bg-page min-h-screen relative">
        {children}
        <BottomNav />
      </div>
      <ToastProvider />
    </Providers>
  );
}
