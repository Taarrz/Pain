export function Spinner({ label }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 p-8 text-zinc-500"
    >
      <span
        aria-hidden
        className="inline-block w-8 h-8 rounded-full border-4 border-zinc-200 border-t-zinc-600 animate-spin"
      />
      <span className="text-sm">{label ?? "กำลังโหลด..."}</span>
    </div>
  );
}
