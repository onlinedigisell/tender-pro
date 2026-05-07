export default function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-teal-400 to-blue-600 text-sm font-black tracking-tight text-white shadow-sm">
        TP
      </div>
      {!compact && (
        <div>
          <p className="text-base font-bold leading-5 tracking-tight text-slate-950">Tender Pro</p>
          <p className="text-xs font-medium text-slate-500">Tender intelligence platform</p>
        </div>
      )}
    </div>
  );
}
