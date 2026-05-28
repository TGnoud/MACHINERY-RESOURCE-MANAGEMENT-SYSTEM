"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";

import { ApiError, authApi } from "../../../lib/api";
import { AuthShell } from "../_components/auth-shell";
import { FormField } from "../_components/form-field";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../_components/schemas";
import { SubmitButton } from "../_components/submit-button";

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const result = await authApi.forgotPassword(values.email);
      setSentEmail(values.email);
      setResetUrl(result.resetUrl);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Không thể gửi yêu cầu khôi phục. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRetry() {
    reset({ email: sentEmail });
    setSentEmail("");
    setResetUrl("");
    setErrorMessage("");
  }

  return (
    <AuthShell variant="forgot">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        {sentEmail ? (
          <div className="py-4 text-center">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-50">
              <CheckCircle2 className="size-10 text-emerald-500" />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
              Đã gửi yêu cầu!
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Vui lòng kiểm tra hộp thư đến tại{" "}
              <span className="font-semibold text-slate-950">{sentEmail}</span>{" "}
              để tiếp tục khôi phục mật khẩu.
            </p>
            {resetUrl && (
              <Link
                className="mt-6 inline-flex rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800 transition hover:bg-sky-100"
                href={resetUrl}
              >
                Mở liên kết đặt lại mật khẩu
              </Link>
            )}
            <button
              className="mt-8 text-sm font-semibold text-sky-700 transition hover:text-sky-600"
              type="button"
              onClick={handleRetry}
            >
              Gửi lại email nếu bạn chưa nhận được
            </button>
          </div>
        ) : (
          <>
            <div className="mb-9">
              <div className="mb-6 grid size-14 place-items-center rounded-xl bg-sky-50">
                <LockKeyhole className="size-7 text-sky-500" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Quên mật khẩu
              </h1>
              <p className="mt-3 text-lg leading-7 text-slate-600">
                Nhập email tài khoản của bạn. Hệ thống sẽ gửi hướng dẫn khôi
                phục mật khẩu.
              </p>
            </div>

            <form className="space-y-7" onSubmit={handleSubmit(onSubmit)}>
              <FormField
                label="Email"
                id="email"
                type="email"
                placeholder="example@company.com"
                icon={Mail}
                error={errors.email?.message}
                {...register("email")}
              />

              {errorMessage && (
                <p aria-live="polite" className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </p>
              )}

              <SubmitButton className="h-16 text-base" loading={isSubmitting} type="submit">
                <span>Gửi hướng dẫn khôi phục</span>
                <ArrowRight className="size-5" />
              </SubmitButton>

              <div className="text-center">
                <Link
                  className="inline-flex items-center gap-2 text-base font-medium text-sky-800 transition hover:text-sky-600"
                  href="/login"
                >
                  <ArrowLeft className="size-4" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          </>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between px-5 text-sm font-semibold text-slate-500">
        <span>© 2024 GnoudCRM</span>
        <div className="flex gap-8">
          <a className="transition hover:text-sky-700" href="#">
            Trợ giúp
          </a>
          <a className="transition hover:text-sky-700" href="#">
            Bảo mật
          </a>
        </div>
      </div>
    </AuthShell>
  );
}
