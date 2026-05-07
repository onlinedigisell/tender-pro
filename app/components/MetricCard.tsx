export default function MetricCard({
  label,
  value,
  detail,
  tone = "blue",
}: {
  label: string;
  value: string | number;
  detail?: string;
  tone?: "blue" | "emerald" | "amber" | "rose" | "slate";
}) {
  const tones = {
    blue: "from-blue-50 to-white border-blue-100 text-blue-700",
    emerald: "from-emerald-50 to-white border-emerald-100 text-emerald-700",
    amber: "from-amber-50 to-white border-amber-100 text-amber-700",
    rose: "from-rose-50 to-white border-rose-100 text-rose-700",
    slate: "from-slate-50 to-white border-slate-200 text-slate-700",
  };

  return (
    <div className={`rounded-lg border bg-gradient-to-br p-5 shadow-sm ${tones[tone]}`}>
      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{value}</p>
      {detail && <p className="mt-2 text-sm font-medium leading-5 text-slate-600">{detail}</p>}
    </div>
  );
}
