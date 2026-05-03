import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import JobCard from "@/components/JobCard";
import JobCardSkeleton from "@/components/JobCardSkeleton";
import FilterChips from "@/components/FilterChips";
import { mockJobs } from "@/data/mockData";

const Index = () => {
  const [filter, setFilter] = useState("Tous");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const filtered = mockJobs.filter((job) => {
    if (filter === "Tous") return true;
    if (filter === "Bouarada" || filter === "Zaghouan") return job.city === filter;
    return job.contractType === filter;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <img src={logo} alt="Schulte & Co" className="h-8" />
          <div>
            <h1 className="text-sm font-semibold text-foreground">Schulte Tunisia</h1>
            <p className="text-[11px] text-muted-foreground">Portail Emploi</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-4">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Offres d'emploi</h2>
        <FilterChips active={filter} onSelect={setFilter} />

        <div className="mt-4 space-y-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)
            : filtered.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() => navigate(`/apply/${job.id}`)}
                />
              ))}
          {!loading && filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucune offre trouvée pour ce filtre.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
