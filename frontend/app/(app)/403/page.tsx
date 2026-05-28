import Link from "next/link";
import { ArrowLeft, Ban, Info, LifeBuoy } from "lucide-react";

import { Card, PagePad } from "../_components/ui";

export default function ForbiddenPage() {
  return (
    <PagePad>
      <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden">
        <div className="absolute left-1/4 top-1/4 -z-10 size-96 rounded-full bg-red-100/60 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 size-[500px] rounded-full bg-slate-200/70 blur-3xl" />

        <div className="w-full max-w-3xl">
          <Card className="flex flex-col items-center gap-8 bg-white/75 p-8 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur md:flex-row md:p-10">
            <div className="relative shrink-0">
              <div className="relative z-10 grid size-44 place-items-center rounded-full border-4 border-white bg-red-50 shadow-sm">
                <Ban className="size-24 text-red-600" strokeWidth={1.8} />
              </div>
              <span className="absolute inset-0 rounded-full border border-red-200 scale-110" />
              <span className="absolute inset-0 rounded-full border border-dashed border-slate-200 scale-125" />
            </div>

            <div className="text-center md:text-left">
              <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-red-700">
                Lỗi hệ thống
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
                403 - Không có quyền truy cập
              </h1>
              <p className="mt-4 max-w-md text-lg leading-8 text-slate-600">
                Bạn không có quyền truy cập trang này. Khu vực này yêu cầu cấp
                độ bảo mật cao hơn trong hệ thống quản lý máy móc. Vui lòng
                liên hệ quản trị viên nếu cần hỗ trợ.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-sky-500 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600"
                  href="/dashboard"
                >
                  <ArrowLeft className="size-4" />
                  Quay lại Dashboard
                </Link>
                <a
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  href="mailto:support@gnoudcrm.vn"
                >
                  <LifeBuoy className="size-4" />
                  Liên hệ Hỗ trợ
                </a>
              </div>
            </div>
          </Card>

          <Card className="mt-6 flex items-start gap-4 p-5 opacity-75">
            <Info className="mt-0.5 size-5 text-slate-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Technical Reference
              </h2>
              <p className="mt-1 font-mono text-xs text-slate-500">
                ERR_FORBIDDEN_RESOURCE | ID: GCRM-403-8A9B2
              </p>
            </div>
          </Card>
        </div>
      </div>
    </PagePad>
  );
}
