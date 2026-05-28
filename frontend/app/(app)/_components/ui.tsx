import type { ButtonHTMLAttributes, ComponentType, ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
}) {
  return (
    <button
      {...props}
      className={[
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2",
        props.disabled ? "cursor-not-allowed opacity-60" : "",
        className,
      ].join(" ")}
      type={props.type ?? "button"}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
}) {
  return (
    <button
      {...props}
      className={[
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
        props.disabled ? "cursor-not-allowed opacity-60" : "",
        className,
      ].join(" ")}
      type={props.type ?? "button"}
    >
      {children}
    </button>
  );
}

export function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "sky",
}: {
  label: string;
  value: string;
  note: ReactNode;
  icon: ComponentType<{ className?: string }>;
  tone?: "sky" | "green" | "amber" | "red";
}) {
  const toneClass = {
    sky: "bg-sky-50 text-sky-700",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  }[tone];

  return (
    <Card className="relative overflow-hidden p-4">
      <div className="absolute right-0 top-0 p-4 opacity-10">
        <Icon aria-hidden="true" className="size-16" />
      </div>
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-4 text-4xl font-bold tracking-tight text-slate-950 tabular-nums">
            {value}
          </p>
        </div>
        <span className={`grid size-10 place-items-center rounded-lg ${toneClass}`}>
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </div>
      <div className="relative z-10 mt-3 text-sm font-semibold">{note}</div>
    </Card>
  );
}

export function ActivityTimeline({
  items,
}: {
  items: Array<{
    title: string;
    body: string;
    time: string;
    tone: "sky" | "green" | "slate" | "amber";
  }>;
}) {
  const border = {
    sky: "border-sky-600",
    green: "border-emerald-500",
    slate: "border-slate-500",
    amber: "border-amber-500",
  };

  return (
    <div className="relative ml-3 space-y-6 border-l-2 border-slate-200 pb-2">
      {items.map((item) => (
        <div className="relative pl-6" key={`${item.title}-${item.time}`}>
          <span
            className={[
              "absolute -left-[9px] top-1 size-4 rounded-full border-2 bg-white",
              border[item.tone],
            ].join(" ")}
          />
          <div className="mb-1 flex items-start justify-between gap-3">
            <h4 className="text-sm font-bold text-slate-950">{item.title}</h4>
            <span className="shrink-0 text-xs font-semibold text-slate-500">
              {item.time}
            </span>
          </div>
          <p className="text-sm leading-6 text-slate-600">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

export function PagePad({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-6 pb-24 sm:px-6 md:px-8 md:pb-8">
      {children}
    </div>
  );
}
