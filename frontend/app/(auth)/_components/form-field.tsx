"use client";

import type { ComponentType, InputHTMLAttributes } from "react";
import { useState } from "react";

import { AlertCircle, Eye, EyeOff } from "lucide-react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  icon?: ComponentType<{ className?: string }>;
};

export function FormField({
  label,
  error,
  icon: Icon,
  type,
  id,
  ...inputProps
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-500"
          />
        )}
        <input
          {...inputProps}
          id={id}
          type={inputType}
          aria-invalid={Boolean(error)}
          className={[
            "h-12 w-full rounded-lg border bg-white text-base text-slate-950 outline-none transition",
            Icon ? "pl-11" : "pl-4",
            isPassword ? "pr-12" : "pr-4",
            error
              ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-4 focus-visible:ring-red-500/10"
              : "border-slate-200 focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-500/15",
          ].join(" ")}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            className="absolute right-2.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1"
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="size-5" />
            ) : (
              <Eye aria-hidden="true" className="size-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle aria-hidden="true" className="size-4" />
          {error}
        </p>
      )}
    </div>
  );
}
