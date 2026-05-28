import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
  remember: z.boolean(),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Vui lòng nhập họ và tên."),
    email: z.string().trim().email("Email không hợp lệ."),
    password: z.string().min(8, "Mật khẩu cần tối thiểu 8 ký tự."),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu."),
    acceptTerms: z.boolean().refine((value) => value, {
      message: "Bạn cần đồng ý điều khoản và chính sách bảo mật.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ."),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Mật khẩu cần tối thiểu 8 ký tự."),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
