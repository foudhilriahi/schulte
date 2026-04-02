import { Calendar } from "lucide-react";
import MatchGauge from "./MatchGauge";
import type { JobOffer } from "@/data/mockData";

interface JobCardProps {
  job: JobOffer;
  onClick?: () => void;
}

const JobCard = ({ job, onClick }: JobCardProps) => {
  const isBouarada = job.city === "Bouarada";

  return (
    <button
      onClick={onClick}
      className={`touch-target w-full rounded-2xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-md ${
        isBouarada ? "card-bouarada" : "card-zaghouan"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isBouarada
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary/10 text-secondary"
              }`}
            >
              {job.city}
            </span>
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
              {job.contractType}
            </span>
          </div>
          <h3 className="mb-2 text-base font-bold text-card-foreground">{job.title}</h3>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-lg bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Date limite : {new Date(job.deadline).toLocaleDateString("fr-TN")}</span>
          </div>
        </div>
        <div className="ml-3 shrink-0">
          <MatchGauge score={job.matchScore} />
        </div>
      </div>
    </button>
  );
};

export default JobCard;
