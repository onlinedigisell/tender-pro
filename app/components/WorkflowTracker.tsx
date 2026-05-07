import { workflowStages, type TenderWorkflowStage } from "../../lib/intelligence";

export default function WorkflowTracker({ currentStage }: { currentStage: TenderWorkflowStage }) {
  const currentIndex = workflowStages.indexOf(currentStage);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const progress = Math.round(((safeIndex + 1) / workflowStages.length) * 100);
  const nextStage = workflowStages[Math.min(safeIndex + 1, workflowStages.length - 1)];

  return (
    <div className="min-w-0">
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 sm:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              Workflow Stage
            </p>
            <p className="mt-1 break-words text-sm font-black text-blue-700">{currentStage}</p>
          </div>
          <span className="shrink-0 rounded-md bg-white px-2 py-1 text-xs font-black text-slate-700">
            {safeIndex + 1}/{workflowStages.length}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
        </div>
        {nextStage !== currentStage && (
          <p className="mt-2 text-xs font-semibold text-slate-500">Next: {nextStage}</p>
        )}
      </div>

      <div className="hidden overflow-x-auto pb-1 sm:block">
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
    </div>
  );
}
