"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail, Shield, User, ChevronDown, Users } from "lucide-react";
import { useForm } from "react-hook-form";

import { ApiError, authApi, storeAuthSession } from "../../../lib/api";
import { AuthShell } from "../_components/auth-shell";
import { FormField } from "../_components/form-field";
import {
  registerSchema,
  type RegisterFormValues,
} from "../_components/schemas";
import { SubmitButton } from "../_components/submit-button";

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "DISPATCHER",
      acceptTerms: false,
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setSuccess("");
    setIsSubmitting(true);

    try {
      const auth = await authApi.register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: values.role,
      });

      storeAuthSession(auth);
      router.push("/dashboard");
    } catch (error) {
      setSuccess(
        error instanceof ApiError
          ? error.message
          : "Không thể tạo tài khoản. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell variant="register">
      <div className="mx-auto w-full max-w-[448px]">
        <div className="mb-9 lg:hidden">
          <div className="flex items-center gap-3">
            <span className="block size-10 rounded-lg bg-sky-500 shadow-lg shadow-sky-500/30" />
            <span className="text-3xl font-bold tracking-tight text-slate-950">
              GnoudCRM
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Tạo tài khoản mới
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Bắt đầu hành trình quản trị thông minh ngay hôm nay.
          </p>
        </div>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <FormField
            label="Họ và tên"
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Nguyễn Văn A"
            icon={User}
            error={errors.fullName?.message}
            {...register("fullName")}
          />

          <FormField
            label="Email"
            id="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            placeholder="email@example.com"
            icon={Mail}
            error={errors.email?.message}
            {...register("email")}
          />

          <FormField
            label="Mật khẩu"
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Tối thiểu 8 ký tự"
            icon={Lock}
            error={errors.password?.message}
            {...register("password")}
          />

          <FormField
            label="Xác nhận mật khẩu"
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu"
            icon={Shield}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <div className="space-y-1.5">
            <label htmlFor="role" className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="size-4 text-slate-400" />
              Bạn đăng ký với vai trò là gì?
            </label>
            <div className="relative mt-2">
              <select
                id="role"
                className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 cursor-pointer"
                {...register("role")}
              >
                <option value="DISPATCHER">Điều phối viên (Dispatcher)</option>
                <option value="TECHNICIAN">Kỹ thuật viên (Technician)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
            </div>
            {errors.role?.message && (
              <p role="alert" className="text-sm text-red-600">
                {errors.role.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <input
                id="acceptTerms"
                type="checkbox"
                className="mt-0.5 size-4 rounded border-slate-300 text-sky-500 accent-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                {...register("acceptTerms")}
              />
              <div className="leading-5">
                <label htmlFor="acceptTerms" className="cursor-pointer select-none">
                  Tôi đồng ý với{" "}
                </label>
                <a className="font-medium text-sky-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded px-0.5" href="#">
                  Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a className="font-medium text-sky-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded px-0.5" href="#">
                  Chính sách bảo mật
                </a>
                .
              </div>
            </div>
            {errors.acceptTerms?.message && (
              <p role="alert" className="text-sm text-red-600">
                {errors.acceptTerms.message}
              </p>
            )}
          </div>

          {success && (
            <p aria-live="polite" className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
              {success}
            </p>
          )}

          <SubmitButton loading={isSubmitting} type="submit">
            <span>Tạo tài khoản</span>
            <ArrowRight aria-hidden="true" className="size-4" />
          </SubmitButton>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Đã có tài khoản?{" "}
          <Link
            className="font-bold text-sky-600 transition hover:text-sky-700"
            href="/login"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
