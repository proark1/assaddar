import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1120px] px-6 md:px-10 ${className}`}>
      {children}
    </div>
  );
}

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`py-20 md:py-28 ${className}`}>
      {children}
    </section>
  );
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-copper">
      {children}
    </span>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  withArrow = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  withArrow?: boolean;
}) {
  const base =
    "group inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-150 hover:-translate-y-0.5";
  const styles =
    variant === "primary"
      ? "bg-copper px-5 py-3 text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.25)] hover:bg-copper-hi hover:shadow-[0_6px_18px_rgba(166,110,47,0.32)]"
      : "border border-strong px-5 py-3 text-ink hover:border-copper";
  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
      {withArrow && (
        <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}
