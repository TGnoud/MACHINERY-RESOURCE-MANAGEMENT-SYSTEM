import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";

import { Card, PagePad, PrimaryButton } from "../_components/ui";

const users = [
  {
    name: "Nguyễn Thị Lan",
    email: "lan.nguyen@gnoud.vn",
    role: "ADMIN",
    status: "Hoạt động",
    statusClass: "bg-emerald-50 text-emerald-700",
    lastLogin: "10 phút trước",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBtlVilBgsyrTfnnHYUXoUTTiJtG6b5gyPRyrv5d-1ZXIzacpdQbNdIVVwilOcg8uDnPsgVenEEvF9Nb9s1_r8yCDv7zTdBHSvXS0EqyPHl4SDJLeB57bZiBTj7sOwmwAnJE2MNOV6gYcKXEhajjGtpaoGXdseKHFR4Lj1cZ_AuSUJZbTYFWmD5sKV5ZxDN1HakWidfdIi7d5BytQ1glNtisfAUvgBqnNTvIyM3N4mWA8tfBeyywuJGMVbnNPQ2cuCPe9BsAwOoUDQ",
  },
  {
    name: "Trần Văn Hùng",
    email: "hung.tran@gnoud.vn",
    role: "DISPATCHER",
    status: "Hoạt động",
    statusClass: "bg-emerald-50 text-emerald-700",
    lastLogin: "Hôm qua, 14:30",
    initials: "TH",
  },
  {
    name: "Lê Hoàng",
    email: "hoang.le@gnoud.vn",
    role: "TECHNICIAN",
    status: "Vô hiệu",
    statusClass: "bg-red-50 text-red-700",
    lastLogin: "15/09/2023",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBPVN_6kpsVb7-IOPVUJL4jnZxXoaFiMfZaOMs6cRJUwb-o0S8MKtMvYIp8NkorfGZ2MjtQ7REYyVhBf3Z_7VtDgyTck4GIqOwA5OwtbgrWLyJ_VJcVmA0X8QahkObPs6HeBrdMDhKTE69ZcgoWAi9LRdvCj97TEBVEqeMZBQFf_7VOPWv5aRU10BrT0zApn9W1pkseqKgDA6ZBkR_nDe0Dtdvppj1AJdKYLE6N8Iq03FmFZnFbjHnRz0Hm0_z4QciquErMecn32Ow",
    disabled: true,
  },
];

export default function AccountsPage() {
  return (
    <PagePad>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Quản lý tài khoản
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Quản lý quyền truy cập và vai trò của nhân viên trong hệ thống.
            </p>
          </div>
          <PrimaryButton className="h-11 px-6 bg-sky-500 hover:bg-sky-600">
            <Plus className="size-4" />
            Thêm tài khoản
          </PrimaryButton>
        </div>

        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <select className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10">
                <option>Tất cả vai trò</option>
                <option>ADMIN</option>
                <option>DISPATCHER</option>
                <option>TECHNICIAN</option>
              </select>
              <select className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10">
                <option>Tất cả trạng thái</option>
                <option>Hoạt động</option>
                <option>Vô hiệu</option>
              </select>
            </div>
            <label className="relative block w-full md:w-80">
              <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                placeholder="Tìm theo tên/email..."
                type="text"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-indigo-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Người dùng</th>
                  <th className="px-5 py-4">Vai trò</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4">Lần đăng nhập cuối</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {users.map((user) => (
                  <tr
                    className={[
                      "transition hover:bg-slate-50",
                      user.disabled ? "opacity-65" : "",
                    ].join(" ")}
                    key={user.email}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <div
                            aria-label={user.name}
                            className={[
                              "size-10 rounded-full bg-cover bg-center",
                              user.disabled ? "grayscale" : "",
                            ].join(" ")}
                            role="img"
                            style={{ backgroundImage: `url(${user.avatar})` }}
                          />
                        ) : (
                          <div className="grid size-10 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-slate-600">
                            {user.initials}
                          </div>
                        )}
                        <div>
                          <p
                            className={[
                              "font-bold text-slate-950",
                              user.disabled ? "line-through" : "",
                            ].join(" ")}
                          >
                            {user.name}
                          </p>
                          <p className="text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded border border-slate-200 bg-indigo-50 px-2 py-1 text-xs font-bold text-slate-600">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${user.statusClass}`}
                      >
                        <span className="size-2 rounded-full bg-current" />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {user.lastLogin}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="inline-grid size-8 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-sky-700">
                        {user.disabled ? (
                          <RotateCcw className="size-4" />
                        ) : (
                          <Edit3 className="size-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 bg-indigo-50/40 px-5 py-4">
            <p className="text-sm text-slate-600">
              Hiển thị 1-3 của 24 tài khoản
            </p>
            <div className="flex gap-2">
              <button
                className="grid size-10 cursor-not-allowed place-items-center rounded border border-slate-200 bg-white text-slate-300"
                disabled
                type="button"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button className="grid size-10 place-items-center rounded border border-slate-200 bg-white text-slate-600">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </PagePad>
  );
}
