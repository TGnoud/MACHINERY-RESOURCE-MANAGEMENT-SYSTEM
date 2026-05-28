"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Mail, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";

import { AuthShell } from "../_components/auth-shell";
import { FormField } from "../_components/form-field";
import { loginSchema, type LoginFormValues } from "../_components/schemas";
import { SubmitButton } from "../_components/submit-button";

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  async function onSubmit() {
    setNotice("");
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSubmitting(false);
    setNotice("Demo FE: form hợp lệ, backend đăng nhập sẽ được kết nối ở bước sau.");
  }

  return (
    <AuthShell variant="login">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Đăng nhập
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Truy cập vào hệ thống điều phối của bạn.
          </p>
        </div>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <FormField
            label="Email"
            id="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            placeholder="Ví dụ: admin@gnoudcrm.vn"
            icon={Mail}
            error={errors.email?.message}
            {...register("email")}
          />

          <FormField
            label="Mật khẩu"
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            icon={ShieldCheck}
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                className="size-4 rounded border-slate-300 text-sky-500 accent-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                {...register("remember")}
              />
              Ghi nhớ đăng nhập
            </label>
            <Link
              className="text-sm font-semibold text-sky-700 transition hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded"
              href="/forgot-password"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {notice && (
            <p aria-live="polite" className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
              {notice}
            </p>
          )}

          <SubmitButton loading={isSubmitting} type="submit">
            <span>Đăng nhập</span>
            <LogIn aria-hidden="true" className="size-4" />
          </SubmitButton>
        </form>

        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
          Chưa có tài khoản?{" "}
          <Link
            className="font-bold text-sky-700 transition hover:text-sky-600"
            href="/register"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
