import { AuthShell } from "../_components/auth-shell";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell variant="forgot">
      <ResetPasswordForm token={params.token ?? ""} />
    </AuthShell>
  );
}
