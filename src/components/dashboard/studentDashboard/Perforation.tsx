
export default function Perforation() {
  return (
    <div className="relative my-4 h-0 border-t-2 border-dashed border-slate-200" aria-hidden="true">
      <span className="absolute -left-6 -top-3 h-6 w-6 rounded-full bg-slate-100" />
      <span className="absolute -right-6 -top-3 h-6 w-6 rounded-full bg-slate-100" />
    </div>
  );
}