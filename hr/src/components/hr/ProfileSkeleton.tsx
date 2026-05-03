const ProfileSkeleton = () => (
  <div className="flex h-full w-full flex-col border-l border-border bg-card shadow-modal animate-slideIn">
    <div className="h-[38px] w-full bg-card2 border-b border-border load-pulse" />
    <div className="flex h-[54px] items-center justify-between border-b border-border px-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-border load-pulse" />
        <div className="space-y-1.5">
          <div className="h-3 w-32 rounded bg-border load-pulse" style={{ animationDelay: '75ms' }} />
          <div className="h-2 w-20 rounded bg-border load-pulse" style={{ animationDelay: '150ms' }} />
        </div>
      </div>
    </div>
    <div className="grid flex-1 grid-cols-1 lg:grid-cols-2">
      <div className="space-y-5 border-r border-border p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-2 w-16 rounded bg-border load-pulse" />
            <div className="h-8 w-full rounded bg-border load-pulse" style={{ animationDelay: `${i * 75}ms` }} />
          </div>
        ))}
      </div>
      <div className="space-y-5 p-4">
        <div className="h-32 w-full rounded bg-border load-pulse" style={{ animationDelay: '300ms' }} />
        <div className="h-48 w-full rounded bg-border load-pulse" style={{ animationDelay: '375ms' }} />
      </div>
    </div>
  </div>
);

export default ProfileSkeleton;
