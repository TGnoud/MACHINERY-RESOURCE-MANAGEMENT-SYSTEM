"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Bolt,
  Download,
  Factory,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";

import {
  ActivityTimeline,
  Card,
  MetricCard,
  PagePad,
  SecondaryButton,
} from "../_components/ui";
import { getStoredUser } from "@/lib/api";

const maintenanceRows = [
  {
    id: "MT-2023-089",
    equipment: "Máy xúc Komatsu PC200",
    date: "24/10/2023",
    level: "Khẩn cấp",
    levelClass: "bg-red-50 text-red-600",
    status: "Đang xử lý",
    statusDot: "bg-amber-500",
  },
  {
    id: "MT-2023-088",
    equipment: "Cần cẩu tháp Liebherr",
    date: "22/10/2023",
    level: "Cao",
    levelClass: "bg-amber-50 text-amber-600",
    status: "Hoàn thành",
    statusDot: "bg-emerald-500",
  },
  {
    id: "MT-2023-087",
    equipment: "Máy phát điện Cummins",
    date: "20/10/2023",
    level: "Thường",
    levelClass: "bg-indigo-50 text-indigo-600",
    status: "Hoàn thành",
    statusDot: "bg-emerald-500",
  },
  {
    id: "MT-2023-086",
    equipment: "Xe tải Isuzu QKR",
    date: "19/10/2023",
    level: "Thường",
    levelClass: "bg-indigo-50 text-indigo-600",
    status: "Hoàn thành",
    statusDot: "bg-emerald-500",
  },
];

const activities = [
  {
    title: "Tạo phiếu bảo trì mới",
    body: "Trần Văn B đã tạo phiếu MT-2023-089 cho Máy xúc Komatsu.",
    time: "10 phút trước",
    tone: "sky" as const,
  },
  {
    title: "Cập nhật trạng thái",
    body: "Thiết bị Cần cẩu tháp Liebherr chuyển sang trạng thái Sẵn sàng.",
    time: "2 giờ trước",
    tone: "green" as const,
  },
  {
    title: "Đăng nhập hệ thống",
    body: "Nguyễn Văn A (Admin) đăng nhập từ IP 192.168.1.45.",
    time: "08:00 AM",
    tone: "slate" as const,
  },
  {
    title: "Cảnh báo nhiên liệu",
    body: "Xe tải Isuzu QKR mức nhiên liệu dưới 15%.",
    time: "Hôm qua",
    tone: "amber" as const,
  },
];

const moreActivities = [
  {
    title: "Bàn giao thiết bị",
    body: "Lê Văn C đã bàn giao Máy phát điện Cummins cho đội công trình số 2.",
    time: "3 giờ trước",
    tone: "sky" as const,
  },
  {
    title: "Hoàn thành bảo trì",
    body: "Phiếu bảo trì MT-2023-087 cho Máy phát điện Cummins đã hoàn thành.",
    time: "4 giờ trước",
    tone: "green" as const,
  },
  {
    title: "Cập nhật tài khoản",
    body: "Admin đã cập nhật quyền hạn cho tài khoản Kỹ thuật viên Nguyễn Văn B.",
    time: "5 giờ trước",
    tone: "slate" as const,
  },
  {
    title: "Cảnh báo quá nhiệt",
    body: "Thiết bị Máy xúc Komatsu phát hiện cảnh báo nhiệt độ động cơ vượt ngưỡng.",
    time: "Hôm qua",
    tone: "amber" as const,
  },
];

export default function DashboardPage() {
  const [activitiesList, setActivitiesList] = useState(activities);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  async function handleLoadMore() {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    // Giả lập độ trễ mạng 600ms
    await new Promise((resolve) => setTimeout(resolve, 600));
    setActivitiesList((prev) => [...prev, ...moreActivities]);
    setHasMore(false);
    setIsLoadingMore(false);
  }

  return (
    <PagePad>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
              user?.role === "ADMIN" ? "border-sky-200 bg-sky-50 text-sky-700" :
              user?.role === "DISPATCHER" ? "border-purple-200 bg-purple-50 text-purple-700" :
              "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}>
              {user?.role ?? "ADMIN"}
            </span>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Chào mừng trở lại, {user?.fullName ?? "Nguyễn Văn A"}
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Tổng quan hoạt động hệ thống ngày hôm nay.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SecondaryButton>
              <Download aria-hidden="true" className="size-4" />
              Xuất báo cáo
            </SecondaryButton>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Factory}
            label="Tổng thiết bị"
            note={
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <TrendingUp aria-hidden="true" className="size-4" />
                <span className="tabular-nums">+5%</span> so với tháng trước
              </span>
            }
            value="120"
          />
          <MetricCard
            icon={Bolt}
            label="Sẵn sàng"
            note={<span className="text-slate-500"><span className="tabular-nums">70.8%</span> tổng số</span>}
            tone="green"
            value="85"
          />
          <MetricCard
            icon={Zap}
            label="Đang sử dụng"
            note={<span className="text-slate-500"><span className="tabular-nums">20.8%</span> tổng số</span>}
            tone="amber"
            value="25"
          />
          <MetricCard
            icon={Wrench}
            label="Đang bảo trì"
            note={<span className="text-red-600">Cần chú ý <span className="tabular-nums">2</span> thiết bị</span>}
            tone="red"
            value="10"
          />
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <Card className="p-5">
            <h2 className="text-2xl font-bold text-slate-950">
              Tỷ lệ trạng thái thiết bị
            </h2>
            <div className="flex min-h-64 items-center justify-center">
              <div className="grid size-48 place-items-center rounded-full bg-[conic-gradient(#22c55e_0_70.8%,#f59e0b_70.8%_91.6%,#ef4444_91.6%_100%)]">
                <div className="grid size-32 place-items-center rounded-full bg-white shadow-inner">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-950 tabular-nums">120</p>
                    <p className="text-sm font-bold text-slate-500">Tổng</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-slate-600">
              <Legend color="bg-emerald-500" label="Sẵn sàng (85)" />
              <Legend color="bg-amber-500" label="Đang dùng (25)" />
              <Legend color="bg-red-500" label="Bảo trì (10)" />
            </div>
          </Card>

          <Card className="p-5 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-950">
                Chi phí bảo trì (6 tháng)
              </h2>
              <span className="rounded-lg border border-slate-200 bg-indigo-50 px-3 py-1 text-sm font-semibold text-slate-600 tabular-nums">
                2023
              </span>
            </div>
            <div className="relative flex min-h-64 items-end gap-5 border-b border-slate-200 px-4 pt-8">
              <div className="pointer-events-none absolute inset-x-4 top-8 flex h-[calc(100%-2rem)] flex-col justify-between">
                <span className="border-t border-dashed border-slate-200" />
                <span className="border-t border-dashed border-slate-200" />
                <span className="border-t border-dashed border-slate-200" />
                <span className="border-t border-dashed border-slate-200" />
              </div>
              {[40, 60, 30, 80, 50, 90].map((height, index) => (
                <div
                  className="relative z-10 flex flex-1 flex-col items-center gap-2"
                  key={height + index}
                >
                  <div
                    className={[
                      "w-full rounded-t bg-sky-200 transition hover:bg-sky-400",
                      index === 5 ? "bg-sky-700 shadow-lg shadow-sky-500/20" : "",
                    ].join(" ")}
                    style={{ height: `${height * 2}px` }}
                  />
                  <span
                    className={[
                      "text-xs font-bold tabular-nums",
                      index === 5 ? "text-sky-700" : "text-slate-500",
                    ].join(" ")}
                  >
                    T{index + 7}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="overflow-hidden lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <h2 className="text-2xl font-bold text-slate-950">
                Phiếu bảo trì gần đây
              </h2>
              <Link className="text-sm font-bold text-sky-700 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded px-1" href="/maintenance">
                Xem tất cả
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead className="bg-indigo-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-4">Mã phiếu</th>
                    <th className="px-4 py-4">Thiết bị</th>
                    <th className="px-4 py-4">Ngày tạo</th>
                    <th className="px-4 py-4">Mức độ</th>
                    <th className="px-4 py-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {maintenanceRows.map((row) => (
                    <tr className="hover:bg-slate-50" key={row.id}>
                      <td className="px-4 py-4 font-bold text-slate-950 tabular-nums">
                        {row.id}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {row.equipment}
                      </td>
                      <td className="px-4 py-4 text-slate-600 tabular-nums">{row.date}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold ${row.levelClass}`}
                        >
                          {row.level}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full ${row.statusDot}`}
                          />
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-2xl font-bold text-slate-950">
                Hoạt động gần đây
              </h2>
            </div>
            <div className="p-5">
              <ActivityTimeline items={activitiesList} />
              {hasMore ? (
                <button
                  disabled={isLoadingMore}
                  onClick={handleLoadMore}
                  className="mt-5 flex h-10 w-full items-center justify-center rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoadingMore ? "Đang tải…" : "Tải thêm"}
                </button>
              ) : (
                <p className="mt-5 text-center text-xs font-semibold text-slate-400">
                  Đã hiển thị toàn bộ hoạt động gần đây.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </PagePad>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums">
      <span className={`size-3 rounded-full ${color}`} />
      {label}
    </span>
  );
}
