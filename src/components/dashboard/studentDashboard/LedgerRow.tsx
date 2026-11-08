
const LedgerRow = ({ label, value, muted, strong }:any) => {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={`text-sm ${muted ? "text-slate-400" : "text-slate-500"}`}>{label}</span>
      <span
        className={`tabular-nums text-sm ${strong ? "font-semibold text-slate-900" : "text-slate-700"}`}
        style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
      >
        {value}
      </span>
    </div>
  );
}
export default LedgerRow;