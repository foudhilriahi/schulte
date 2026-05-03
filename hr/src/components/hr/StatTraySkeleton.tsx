const StatTraySkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-border bg-card">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className={`p-4 ${i !== 4 ? 'border-r border-border' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 rounded bg-border load-pulse" style={{ animationDelay: `${i * 75}ms` }} />
        </div>
        <div className="mt-2 h-7 w-12 rounded bg-border load-pulse" style={{ animationDelay: `${i * 75 + 75}ms` }} />
        <div className="mt-1 h-2 w-16 rounded bg-border load-pulse" style={{ animationDelay: `${i * 75 + 150}ms` }} />
      </div>
    ))}
  </div>
);

export default StatTraySkeleton;
