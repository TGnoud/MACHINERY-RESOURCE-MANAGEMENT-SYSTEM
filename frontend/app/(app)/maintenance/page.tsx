import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

import {
  Card,
  PagePad,
  SecondaryButton,
} from "../_components/ui";

const emptyImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAq539ogYhRoBmUYZqXY8phqkiwhxlKyYfihT4VKem7Pce2T1mrvPIzGHyqgu-0qIm2ZHZ0Z5qWvsomnjbhYsLzGqpqKZQyHxtPWfuBy9JncWXQ3qUm59D6Ot0ETVBIalLQZBWEzggwnq41K1SLn8-wvug2TQCon1iaJZGrV-G8Oy783RelUdD9N7Vmjxj1rTTUGT0oxRnxQFGUE-zflra2bRovBrgza03gxKRU6fxAQmy-hYmtxOMHot5ICzhGc1GMu7iwAApaxmM";

export default function MaintenancePage() {
  return (
    <PagePad>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <nav className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
              <span>Dashboard</span>
              <ChevronRight className="size-4" />
              <span className="font-bold text-slate-950">Nhật ký bảo trì</span>
            </nav>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Nhật ký bảo trì
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <SecondaryButton>
              <Filter className="size-4" />
              Bộ lọc
            </SecondaryButton>
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-sky-800"
              href="/maintenance/new"
            >
              <Plus className="size-4" />
              Tạo phiếu bảo trì
            </Link>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden p-4">
            <div className="absolute right-0 top-0 size-24 rounded-bl-full bg-indigo-50" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Tổng chi phí (Tháng)
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  125.4M ₫
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-full bg-red-100 text-red-600">
                <WalletCards className="size-5" />
              </span>
            </div>
            <p className="relative mt-5 inline-flex items-center gap-1 text-sm text-red-600">
              <TrendingUp className="size-4" />
              +12% so với tháng trước
            </p>
          </Card>

          <Card className="relative overflow-hidden p-4">
            <div className="absolute right-0 top-0 size-24 rounded-bl-full bg-indigo-50" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Hoàn thành
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  42 <span className="text-sm font-medium text-slate-500">phiếu</span>
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-full bg-sky-50 text-sky-700">
                <CheckCircle2 className="size-5" />
              </span>
            </div>
            <p className="relative mt-5 inline-flex items-center gap-1 text-sm text-emerald-600">
              <CheckCircle2 className="size-4" />
              Đạt chỉ tiêu SLA
            </p>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-slate-950">
              Danh sách phiếu bảo trì gần đây
            </h2>
            <label className="relative block w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-9 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                placeholder="Tìm theo mã, thiết bị..."
                type="text"
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-indigo-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-4">Mã phiếu</th>
                  <th className="px-4 py-4">Thiết bị</th>
                  <th className="px-4 py-4">Kỹ thuật viên</th>
                  <th className="px-4 py-4">Mô tả</th>
                  <th className="px-4 py-4 text-right">Chi phí</th>
                  <th className="px-4 py-4">Ngày hoàn thành</th>
                  <th className="px-4 py-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-16 text-center" colSpan={7}>
                    <div className="mx-auto flex max-w-lg flex-col items-center">
                      <div
                        className="mb-5 size-48 rounded-2xl bg-cover bg-center"
                        style={{ backgroundImage: `url(${emptyImage})` }}
                      />
                      <h3 className="text-2xl font-bold text-slate-950">
                        Không tìm thấy dữ liệu
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        Hiện tại không có phiếu bảo trì nào khớp với bộ lọc của
                        bạn. Vui lòng thử tìm kiếm khác hoặc thêm phiếu mới.
                      </p>
                      <SecondaryButton className="mt-6 text-sky-700">
                        Xóa bộ lọc
                      </SecondaryButton>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 bg-indigo-50/50 px-5 py-4">
            <span className="text-sm text-slate-600">Hiển thị 0 trên 0 kết quả</span>
            <div className="flex gap-2">
              <button
                className="grid size-10 cursor-not-allowed place-items-center rounded border border-slate-200 bg-white text-slate-300"
                disabled
                type="button"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                className="grid size-10 cursor-not-allowed place-items-center rounded border border-slate-200 bg-white text-slate-300"
                disabled
                type="button"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </PagePad>
  );
}
