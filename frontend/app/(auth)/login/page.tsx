"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Mail, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";

import { ApiError, authApi, storeAuthSession } from "../../../lib/api";
import { AuthShell } from "../_components/auth-shell";
import { FormField } from "../_components/form-field";
import { loginSchema, type LoginFormValues } from "../_components/schemas";
import { SubmitButton } from "../_components/submit-button";

const mockUsers: Record<
  string,
  { fullName: string; role: "ADMIN" | "DISPATCHER" | "TECHNICIAN" }
> = {
  "admin@gnoudcrm.vn": { fullName: "Nguyễn Văn A", role: "ADMIN" },
  "dispatcher@gnoudcrm.vn": { fullName: "Trần Thị B", role: "DISPATCHER" },
  "tech@gnoudcrm.vn": { fullName: "Phạm Văn C", role: "TECHNICIAN" },
  "technician@gnoudcrm.vn": { fullName: "Phạm Văn C", role: "TECHNICIAN" },
};

export default function LoginPage() {
  const router = useRouter();
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

  async function onSubmit(values: LoginFormValues) {
    setNotice("");
    setIsSubmitting(true);

    try {
      // 1. Thử gọi API thật để kiểm tra Auth Backend
      const auth = await authApi.login({
        email: values.email,
        password: values.password,
      });

      storeAuthSession(auth);
      router.push("/dashboard");
    } catch (error) {
      // 2. Nếu lỗi do API offline hoặc lỗi mạng (không phải ApiError 401/403/400)
      // thì chúng ta tự động kích hoạt chế độ offline mock làm fallback cho tiện lợi.
      const emailKey = values.email.toLowerCase().trim();
      const isNetworkOrOfflineError = !(error instanceof ApiError);

      if (isNetworkOrOfflineError && mockUsers[emailKey]) {
        console.warn("Backend API offline. Kích hoạt Mock Session dự phòng...");
        const mockUser = mockUsers[emailKey];
        const auth = {
          user: {
            id: "mock-" + mockUser.role.toLowerCase(),
            fullName: mockUser.fullName,
            email: emailKey,
            role: mockUser.role,
            status: "ACTIVE" as const,
          },
          tokens: {
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
            expiresIn: 3600,
          },
        };

        await new Promise((resolve) => setTimeout(resolve, 300));
        storeAuthSession(auth);
        router.push("/dashboard");
        setIsSubmitting(false);
        return;
      }

      setNotice(
        error instanceof ApiError
          ? error.message
          : "Không thể kết nối đến máy chủ backend. Vui lòng kiểm tra cổng PORT hoặc CORS.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
            <p aria-live="polite" className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
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
