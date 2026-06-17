type Props = {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export function LogoutButton({ className, style, children }: Props) {
  return (
    <form action="/logout" method="POST" style={{ display: "inline" }}>
      <button
        type="submit"
        className={className}
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          font: "inherit",
          ...style,
        }}
      >
        {children ?? "ออกจากระบบ"}
      </button>
    </form>
  );
}
