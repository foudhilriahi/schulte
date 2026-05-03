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
      className={`touch-target w-full rounded-md border border-border bg-card p-4 text-left transition-[transform,border-color,box-shadow] duration-[220ms] ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-[3px] hover:border-[var(--border2)] hover:shadow-hover ${
        isBouarada ? "card-bouarada" : "card-zaghouan"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`rounded-full border-[1.5px] px-2.5 py-1 text-[11px] font-semibold ${
                isBouarada
                  ? "bg-boul border-[var(--bou-b)] text-primary"
                  : "bg-zagl border-[var(--zag-b)] text-ok"
              }`}
            >
              {job.city}
            </span>
            <span className="rounded-full border-[1.5px] border-border bg-card2 px-2.5 py-1 text-[11px] font-semibold text-ink3">
              {job.contractType}
            </span>
          </div>
          <h3 className="mb-2 text-[17px] font-semibold tracking-[-0.02em] text-ink">{job.title}</h3>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-sm border border-border bg-card2 px-[9px] py-1 text-[11px] font-normal text-ink3"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-ink4">
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
