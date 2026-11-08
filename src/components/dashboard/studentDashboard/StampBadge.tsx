
const TONES = {
  due: "border-rose-400 text-rose-600",
  unpaid: "border-amber-400 text-amber-600",
};

export default function StampBadge({ label, tone = "due" }: { label: string; tone?: "due" | "unpaid" }) {
  return (
    <div
      className={`select-none rounded-full border-2 border-dashed px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] -rotate-6 ${TONES[tone]}`}
      style={{ fontFamily: "ui-serif, Georgia, serif" }}
    >
      {label}
    </div>
  );
}