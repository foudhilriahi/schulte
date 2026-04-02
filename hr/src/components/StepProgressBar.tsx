interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

const StepProgressBar = ({ currentStep, totalSteps, labels }: StepProgressBarProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {labels.map((label, index) => (
          <div key={label} className="flex flex-1 flex-col items-center">
            <div className="relative flex w-full items-center justify-center">
              {index > 0 && (
                <div
                  className={`absolute right-1/2 h-0.5 w-full ${
                    index <= currentStep ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
              <div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  index < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index === currentStep
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "border-2 border-border bg-card text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
            </div>
            <span className="mt-1.5 text-[10px] font-medium text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepProgressBar;
