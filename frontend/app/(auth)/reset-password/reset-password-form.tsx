"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Lock, Shield } from "lucide-react";
import { useForm } from "react-hook-form";

import { ApiError, authApi } from "../../../lib/api";
import { FormField } from "../_components/form-field";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../_components/schemas";
import { SubmitButton } from "../_components/submit-button";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    setMessage("");
    setIsSubmitting(true);

    try {
      await authApi.resetPassword({
        token,
        password: values.password,
      });
      setIsSuccess(true);
      setMessage("Mật khẩu đã được cập nhật. Bạn có thể đăng nhập lại.");
      window.setTimeout(() => router.push("/login"), 1200);
    } catch (error) {
      setIsSuccess(false);
      setMessage(
        error instanceof ApiError
          ? error.message
          : "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          Liên kết không hợp lệ
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Token đặt lại mật khẩu bị thiếu. Vui lòng yêu cầu gửi lại hướng dẫn
          khôi phục.
        </p>
        <Link
          className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition hover:text-sky-600"
          href="/forgot-password"
        >
          <ArrowLeft className="size-4" />
          Quay lại quên mật khẩu
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
      <div className="mb-7">
        <div className="mb-6 grid size-14 place-items-center rounded-xl bg-sky-50">
          <Lock className="size-7 text-sky-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Đặt lại mật khẩu
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Nhập mật khẩu mới cho tài khoản của bạn.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label="Mật khẩu mới"
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Tối thiểu 8 ký tự"
          icon={Lock}
          error={errors.password?.message}
          {...register("password")}
        />

        <FormField
          label="Xác nhận mật khẩu mới"
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu mới"
          icon={Shield}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {message && (
          <p
            aria-live="polite"
            className={[
              "rounded-lg border px-4 py-3 text-sm",
              isSuccess
                ? "border-emerald-100 bg-emerald-50 text-emerald-800"
                : "border-red-100 bg-red-50 text-red-700",
            ].join(" ")}
          >
            {isSuccess && <CheckCircle2 className="mr-2 inline size-4" />}
            {message}
          </p>
        )}

        <SubmitButton loading={isSubmitting} type="submit">
          Cập nhật mật khẩu
        </SubmitButton>
      </form>

      <div className="mt-8 border-t border-slate-200 pt-6 text-center">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition hover:text-sky-600"
          href="/login"
        >
          <ArrowLeft className="size-4" />
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
