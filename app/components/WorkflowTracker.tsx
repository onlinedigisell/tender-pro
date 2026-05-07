import { workflowStages, type TenderWorkflowStage } from "../../lib/intelligence";

export default function WorkflowTracker({ currentStage }: { currentStage: TenderWorkflowStage }) {
  const currentIndex = workflowStages.indexOf(currentStage);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-[760px] items-start">
        {workflowStages.map((stage, index) => {
          const done = index <= currentIndex && currentIndex !== -1;
          const active = index === currentIndex;

          return (
            <div key={stage} className="flex flex-1 items-start">
              <div className="min-w-0 flex-1">
                <div
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black ${
                    active
                      ? "border-blue-600 bg-blue-600 text-white"
                      : done
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {index + 1}
                </div>
                <p
                  className={`mt-2 px-1 text-center text-[11px] font-semibold leading-4 ${
                    active ? "text-blue-700" : done ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {stage}
                </p>
              </div>
              {index < workflowStages.length - 1 && (
                <div className={`mt-4 h-px w-6 ${done ? "bg-emerald-400" : "bg-slate-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
