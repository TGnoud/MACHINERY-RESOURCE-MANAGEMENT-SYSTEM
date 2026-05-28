"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Forklift,
  Plus,
  RefreshCw,
  Search,
  TowerControl,
  Truck,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

import { Card, PagePad } from "../_components/ui";
import { getStoredUser } from "@/lib/api";

const assignmentRows = [
  {
    id: "DP-2023-0891",
    equipment: "Cẩu tháp Liebherr 112 EC-H",
    code: "EQ-CT-04",
    dispatcher: "Nguyễn Văn An",
    destination: "Dự án VSIP mở rộng, Bình Dương",
    startDate: "15/10/2023",
    endDate: "20/12/2023",
    status: "Đang hoạt động",
    statusClass: "bg-sky-50 text-sky-700 border-sky-200",
    icon: TowerControl,
  },
  {
    id: "DP-2023-0892",
    equipment: "Xe nâng Komatsu 3 Tấn",
    code: "EQ-XN-12",
    dispatcher: "Trần Thị Bé",
    destination: "Kho trung chuyển Cát Lái, Q2",
    startDate: "18/10/2023",
    endDate: "25/10/2023",
    status: "Đang di chuyển",
    statusClass: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Forklift,
  },
  {
    id: "DP-2023-0885",
    equipment: "Xe tải Hino 15 Tấn",
    code: "EQ-XT-08",
    dispatcher: "Lê Hoàng Nam",
    destination: "Công trường hầm Thủ Thiêm",
    startDate: "01/10/2023",
    endDate: "10/10/2023",
    status: "Hoàn thành",
    statusClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Truck,
  },
  {
    id: "DP-2023-0895",
    equipment: "Máy xúc lật Volvo L120",
    code: "EQ-MX-02",
    dispatcher: "Phạm Văn Cường",
    destination: "Mỏ đá Kiên Giang",
    startDate: "22/10/2023",
    endDate: "Chưa xác định",
    status: "Đang xử lý",
    statusClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: UserCog,
  },
];

export default function AssignmentsPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <PagePad>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Phân bổ & Điều phối
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Quản lý và theo dõi các lệnh điều động thiết bị công nghiệp.
            </p>
          </div>
          {user?.role !== "TECHNICIAN" && (
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-sky-700 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-sky-800"
              href="/assignments/new"
            >
              <Plus className="size-4" />
              Tạo phiếu điều phối
            </Link>
          )}
        </div>

        <Card className="mb-6 p-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_200px_160px_160px_auto] lg:items-end">
            <label className="space-y-1.5">
              <span className="text-sm font-bold text-slate-600">Tìm kiếm</span>
              <span className="relative block">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                  placeholder="Nhập mã phiếu, thiết bị..."
                  type="text"
                />
              </span>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-bold text-slate-600">Trạng thái</span>
              <select className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10">
                <option>Tất cả trạng thái</option>
                <option>Đang hoạt động</option>
                <option>Đang di chuyển</option>
                <option>Hoàn thành</option>
              </select>
            </label>
            <DateField label="Từ ngày" />
            <DateField label="Đến ngày" />
            <div className="flex gap-2">
              <IconAction title="Làm mới">
                <RefreshCw className="size-4" />
              </IconAction>
              <IconAction title="Xuất dữ liệu">
                <Download className="size-4" />
              </IconAction>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-indigo-50 text-sm font-bold text-slate-600">
                <tr>
                  <th className="px-4 py-5">Mã phiếu</th>
                  <th className="px-4 py-5">Thiết bị</th>
                  <th className="px-4 py-5">Người điều phối</th>
                  <th className="px-4 py-5">Điểm đến</th>
                  <th className="px-4 py-5">Ngày bắt đầu</th>
                  <th className="px-4 py-5">Ngày kết thúc</th>
                  <th className="px-4 py-5">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {assignmentRows.map((row) => {
                  const Icon = row.icon;
                  return (
                    <tr className="transition hover:bg-slate-50" key={row.id}>
                      <td className="px-4 py-5 font-bold text-sky-700">
                        {row.id}
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 place-items-center rounded bg-indigo-50 text-sky-700">
                            <Icon className="size-5" />
                          </span>
                          <div>
                            <p className="font-bold text-slate-950">
                              {row.equipment}
                            </p>
                            <p className="mt-1 text-slate-500">Mã: {row.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-slate-700">
                        {row.dispatcher}
                      </td>
                      <td className="max-w-[220px] truncate px-4 py-5 text-slate-700">
                        {row.destination}
                      </td>
                      <td className="px-4 py-5 text-slate-700">{row.startDate}</td>
                      <td className="px-4 py-5 text-slate-700">{row.endDate}</td>
                      <td className="px-4 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${row.statusClass}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Hiển thị từ 1 đến 4 trong số 45 kết quả
            </p>
            <div className="flex items-center gap-1">
              <PageButton>
                <ChevronLeft className="size-4" />
              </PageButton>
              {["1", "2", "3", "...", "8"].map((page, index) => (
                <PageButton active={index === 0} key={page + index}>
                  {page}
                </PageButton>
              ))}
              <PageButton>
                <ChevronRight className="size-4" />
              </PageButton>
            </div>
          </div>
        </Card>
      </div>
    </PagePad>
  );
}

function DateField({ label }: { label: string }) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <input
        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
        type="date"
      />
    </label>
  );
}

function IconAction({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}

function PageButton({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={[
        "grid size-9 place-items-center rounded border border-slate-200 text-sm font-semibold",
        active ? "border-sky-600 bg-sky-50 text-sky-700" : "bg-white text-slate-600",
      ].join(" ")}
      type="button"
    >
      {children}
    </button>
  );
}
