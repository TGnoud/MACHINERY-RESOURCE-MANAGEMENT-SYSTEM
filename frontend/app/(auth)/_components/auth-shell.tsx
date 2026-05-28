import type { ReactNode } from "react";

import { Factory, Square } from "lucide-react";

type AuthShellProps = {
  children: ReactNode;
  variant: "login" | "register" | "forgot";
};

const visualImages = {
  login:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDib15EUfvML0MGYwYQ4vDqdqHFiiH2cQxMEh6GyO9nDbFDEI4ES8A66AW5KvUicaJ0gABVabnHk3gyflKhbGAqQ5qZoJPzZHeCAUBxokVQZ886XUSardydmwAR70B_jXKzxPmv7NpcAAs_vjvOMBTIXyb80T7eydA63bMelSL_GE88PkldgxO5NzdUsBAmh4G0WJcroYs6lQWDU9emuB9Hf7N3qdFa8oxCp1uu6QNYoV_Xu9jZ8x2lSEKMYSAOknLBvAb6LSuC57I",
  register:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD04pi2xmq26MueQ5u02TCk0EOHxVRZq8CRwRFwzxZvJ_4QoWrPvP6oyXJrpmJiVP6YvHO-q3UNZWlqu9mp_-S7Fy-cKGV52Q-VWlpnKnHgjyQiio4jYMEiJ4EvomVR2gxml_uj6dGtDuDs8NrhM-7QenYIEiOHe6MrvSA9Cj0UUG0Kp9o7l8XPf5RUs7Hgm3OphQzgwEKf2YDN-lQKQbeWQPwcWpyCQ5MwoYLjJV_749aCj0A3qJ87iiwkJT5MYrIp75ptUHoy22o",
  forgot:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD04pi2xmq26MueQ5u02TCk0EOHxVRZq8CRwRFwzxZvJ_4QoWrPvP6oyXJrpmJiVP6YvHO-q3UNZWlqu9mp_-S7Fy-cKGV52Q-VWlpnKnHgjyQiio4jYMEiJ4EvomVR2gxml_uj6dGtDuDs8NrhM-7QenYIEiOHe6MrvSA9Cj0UUG0Kp9o7l8XPf5RUs7Hgm3OphQzgwEKf2YDN-lQKQbeWQPwcWpyCQ5MwoYLjJV_749aCj0A3qJ87iiwkJT5MYrIp75ptUHoy22o",
};

const panelCopy = {
  login: {
    title: "Hệ thống quản lý thiết bị, điều phối và bảo trì máy móc",
    body: "Industrial Intelligence",
  },
  register: {
    title: "Hệ thống quản lý thiết bị, điều phối và bảo trì máy móc",
    body: "Giải pháp tối ưu cho doanh nghiệp công nghiệp hiện đại. Quản lý vòng đời máy móc, tối ưu hóa lịch trình bảo trì và nâng cao hiệu suất vận hành.",
  },
  forgot: {
    title: "GnoudCRM",
    body: "Hệ thống quản lý tài nguyên và máy móc công nghiệp thông minh. Giải pháp tối ưu cho vận hành và bảo trì thiết bị quy mô lớn.",
  },
};

export function AuthShell({ children, variant }: AuthShellProps) {
  const copy = panelCopy[variant];
  const showCompactHero = variant === "forgot";
  const showRegisterLogo = variant === "register";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-slate-950 text-white lg:flex">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${visualImages[variant]})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.94),rgba(8,47,73,0.78))]" />
        <div className="absolute inset-0 auth-dot-grid opacity-35" />

        <div
          className={
            showCompactHero
              ? "relative z-10 flex w-full flex-col items-center justify-center px-20 text-center"
              : "relative z-10 flex min-h-screen w-full flex-col justify-between px-12 py-12"
          }
        >
          {showCompactHero ? (
            <CompactBrandPanel title={copy.title} body={copy.body} />
          ) : (
            <WideBrandPanel
              title={copy.title}
              body={copy.body}
              showLogo={showRegisterLogo}
            />
          )}
        </div>
      </aside>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-[560px]">{children}</div>
      </section>
    </main>
  );
}

function WideBrandPanel({
  title,
  body,
  showLogo,
}: {
  title: string;
  body: string;
  showLogo: boolean;
}) {
  return (
    <>
      <div>
        {showLogo ? (
          <div className="mb-12 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-sky-500 shadow-lg shadow-sky-500/30">
              <Square className="size-4 fill-white text-white" />
            </span>
            <span className="text-4xl font-bold tracking-tight">GnoudCRM</span>
          </div>
        ) : (
          <h1 className="text-4xl font-bold tracking-tight">GnoudCRM</h1>
        )}

        <h2 className="mt-5 max-w-[520px] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {title}
        </h2>
        {showLogo && (
          <p className="mt-7 max-w-[520px] text-lg leading-7 text-slate-300">
            {body}
          </p>
        )}
      </div>

      {showLogo ? (
        <div className="mb-12 aspect-video w-full max-w-[480px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-2xl">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${visualImages.register})` }}
          />
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 text-sm font-semibold text-slate-200">
          <Factory className="size-5 text-sky-300" />
          {body}
        </div>
      )}

      {showLogo && (
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
          © 2024 Gnoud Technology Solutions
        </p>
      )}
    </>
  );
}

function CompactBrandPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="max-w-[640px]">
      <div className="mx-auto mb-10 grid size-24 place-items-center rounded-3xl border border-white/20 bg-white/10 shadow-2xl">
        <Factory className="size-11 text-sky-300" />
      </div>
      <h1 className="text-5xl font-extrabold tracking-tight">{title}</h1>
      <p className="mx-auto mt-7 max-w-[620px] text-2xl leading-9 text-slate-300">
        {body}
      </p>
      <div className="mt-12 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-2xl">
        <div
          className="h-full w-full bg-cover bg-center opacity-60 grayscale"
          style={{ backgroundImage: `url(${visualImages.forgot})` }}
        />
      </div>
    </div>
  );
}
