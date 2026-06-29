export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function CountUp({
  to,
  suffix = "",
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  return (
    <span>
      {to}
      {suffix}
    </span>
  );
}
