import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Loader2 } from "lucide-react";

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  children: ReactNode;
};

export function SubmitButton({
  loading,
  children,
  className = "",
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        "flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2",
        className,
      ].join(" ")}
    >
      {loading && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
