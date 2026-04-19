import { clsx } from "clsx";

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={clsx("data-panel rounded-[28px] p-5", className)}>{children}</section>;
}

export function PageIntro({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-primary-strong md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-soft">{description}</p>
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-soft">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1 text-xl font-black tracking-tight text-primary-strong">{title}</h2>
        {description ? <p className="mt-1 max-w-3xl text-sm text-text-soft">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-surface px-4 py-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-soft">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-primary-strong">{value}</p>
      {hint ? <p className="mt-2 text-sm text-text-soft">{hint}</p> : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "accent" | "success" | "danger";
}) {
  const toneClass =
    tone === "accent"
      ? "bg-accent-soft text-amber-900 border-amber-200"
      : tone === "success"
        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
        : tone === "danger"
          ? "bg-rose-50 text-rose-800 border-rose-200"
          : "bg-surface-muted text-primary-strong border-border";

  return <span className={clsx("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", toneClass)}>{children}</span>;
}
