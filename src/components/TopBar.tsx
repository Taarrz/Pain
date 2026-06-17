type Props = {
  subtitle?: string;
  right?: React.ReactNode;
};

export function TopBar({ subtitle, right }: Props) {
  return (
    <header
      className="sticky top-0 z-50 flex items-center gap-3.5 px-5 py-3.5"
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #dce5ef",
        boxShadow: "0 1px 3px rgba(26,43,66,.06), 0 4px 16px rgba(26,43,66,.06)",
      }}
    >
      <div
        className="grid place-items-center text-white font-bold text-base shrink-0 rounded-[10px]"
        style={{
          width: 38,
          height: 38,
          background: "#1f6fb2",
        }}
        aria-hidden
      >
        AI
      </div>
      <div className="min-w-0 flex-1">
        <h1
          className="text-base sm:text-[17px] font-semibold tracking-tight truncate"
          style={{ color: "#1a2b42" }}
        >
          AI Pain Diary
        </h1>
        {subtitle && (
          <div
            className="text-xs font-normal truncate"
            style={{ color: "#8da0b5" }}
          >
            {subtitle}
          </div>
        )}
      </div>
      {right && <div className="ml-auto shrink-0">{right}</div>}
    </header>
  );
}
