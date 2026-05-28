"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bolt, Download, Factory, TrendingUp, Wrench, Zap } from "lucide-react";

import {
  ActivityTimeline,
  Card,
  MetricCard,
  PagePad,
  SecondaryButton,
} from "../_components/ui";
import {
  ApiError,
  dashboardApi,
  type DashboardActivity,
  type DashboardCostPoint,
  type DashboardMaintenanceRow,
  type DashboardStats,
  getStoredUser,
} from "@/lib/api";

const emptyStats: DashboardStats = {
  total: 0,
  available: 0,
  rented: 0,
  maintenance: 0,
  availabilityRate: 0,
  rentedRate: 0,
  maintenanceRate: 0,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [costHistory, setCostHistory] = useState<DashboardCostPoint[]>([]);
  const [maintenanceRows, setMaintenanceRows] = useState<
    DashboardMaintenanceRow[]
  >([]);
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [user] = useState(() => getStoredUser());

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [
          statsResult,
          costHistoryResult,
          maintenanceResult,
          activitiesResult,
        ] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getCostHistory(),
          dashboardApi.getRecentMaintenance(),
          dashboardApi.getRecentActivities(),
        ]);

        setStats(statsResult);
        setCostHistory(costHistoryResult);
        setMaintenanceRows(maintenanceResult);
        setActivities(activitiesResult);
      } catch (error) {
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Không thể tải dữ liệu dashboard.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const maxCost = useMemo(
    () => Math.max(...costHistory.map((item) => item.totalCost), 1),
    [costHistory],
  );
  const donutGradient = `conic-gradient(#22c55e 0 ${stats.availabilityRate}%, #f59e0b ${stats.availabilityRate}% ${stats.availabilityRate + stats.rentedRate}%, #ef4444 ${stats.availabilityRate + stats.rentedRate}% 100%)`;

  function handleExportReport() {
    const today = new Date().toISOString().slice(0, 10);
    const rows = [
      ["GnoudCRM Dashboard Report"],
      ["Generated at", new Date().toLocaleString("vi-VN")],
      [],
      ["Overview"],
      ["Metric", "Value"],
      ["Total equipment", stats.total],
      ["Available", stats.available],
      ["Rented", stats.rented],
      ["Maintenance", stats.maintenance],
      ["Availability rate", `${stats.availabilityRate}%`],
      ["Rented rate", `${stats.rentedRate}%`],
      ["Maintenance rate", `${stats.maintenanceRate}%`],
      [],
      ["Maintenance cost history"],
      ["Month", "Year", "Total cost"],
      ...costHistory.map((item) => [item.label, item.year, item.totalCost]),
      [],
      ["Recent maintenance"],
      ["ID", "Equipment", "Date", "Priority", "Status"],
      ...maintenanceRows.map((row) => [
        row.id,
        row.equipment,
        row.date,
        row.level,
        row.status,
      ]),
      [],
      ["Recent activities"],
      ["Title", "Content", "Time", "Type"],
      ...activities.map((activity) => [
        activity.title,
        activity.body,
        activity.time,
        activity.tone,
      ]),
    ];

    const csv = rows.map(toCsvRow).join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `gnoudcrm-dashboard-${today}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <PagePad>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                user?.role === "ADMIN"
                  ? "border-sky-200 bg-sky-50 text-sky-700"
                  : user?.role === "DISPATCHER"
                    ? "border-purple-200 bg-purple-50 text-purple-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {user?.role ?? "USER"}
            </span>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Chào mừng trở lại, {user?.fullName ?? "Người dùng"}
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Tổng quan hoạt động hệ thống ngày hôm nay.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SecondaryButton disabled={isLoading} onClick={handleExportReport}>
              <Download aria-hidden="true" className="size-4" />
              Xuất báo cáo
            </SecondaryButton>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            <MetricSkeleton count={4} />
          ) : (
            <>
              <MetricCard
                icon={Factory}
                label="Tổng thiết bị"
                note={
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <TrendingUp aria-hidden="true" className="size-4" />
                    Telemetry thời gian thực
                  </span>
                }
                value={String(stats.total)}
              />
              <MetricCard
                icon={Bolt}
                label="Sẵn sàng"
                note={
                  <span className="text-slate-500">
                    <span className="tabular-nums">
                      {stats.availabilityRate}%
                    </span>{" "}
                    tổng số
                  </span>
                }
                tone="green"
                value={String(stats.available)}
              />
              <MetricCard
                icon={Zap}
                label="Đang sử dụng"
                note={
                  <span className="text-slate-500">
                    <span className="tabular-nums">{stats.rentedRate}%</span>{" "}
                    tổng số
                  </span>
                }
                tone="amber"
                value={String(stats.rented)}
              />
              <MetricCard
                icon={Wrench}
                label="Đang bảo trì"
                note={
                  <span className="text-red-600">
                    Cần chú ý{" "}
                    <span className="tabular-nums">{stats.maintenance}</span>{" "}
                    thiết bị
                  </span>
                }
                tone="red"
                value={String(stats.maintenance)}
              />
            </>
          )}
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <Card className="p-5">
            <h2 className="text-2xl font-bold text-slate-950">
              Tỷ lệ trạng thái thiết bị
            </h2>
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <>
                <div className="flex min-h-64 items-center justify-center">
                  <div
                    className="grid size-48 place-items-center rounded-full"
                    style={{ background: donutGradient }}
                  >
                    <div className="grid size-32 place-items-center rounded-full bg-white shadow-inner">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-slate-950 tabular-nums">
                          {stats.total}
                        </p>
                        <p className="text-sm font-bold text-slate-500">Tổng</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-slate-600">
                  <Legend
                    color="bg-emerald-500"
                    label={`Sẵn sàng (${stats.available})`}
                  />
                  <Legend
                    color="bg-amber-500"
                    label={`Đang dùng (${stats.rented})`}
                  />
                  <Legend
                    color="bg-red-500"
                    label={`Bảo trì (${stats.maintenance})`}
                  />
                </div>
              </>
            )}
          </Card>

          <Card className="p-5 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-950">
                Chi phí bảo trì (6 tháng)
              </h2>
              <span className="rounded-lg border border-slate-200 bg-indigo-50 px-3 py-1 text-sm font-semibold text-slate-600 tabular-nums">
                {new Date().getFullYear()}
              </span>
            </div>
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <div className="relative flex min-h-64 items-end gap-5 border-b border-slate-200 px-4 pt-8">
                <div className="pointer-events-none absolute inset-x-4 top-8 flex h-[calc(100%-2rem)] flex-col justify-between">
                  <span className="border-t border-dashed border-slate-200" />
                  <span className="border-t border-dashed border-slate-200" />
                  <span className="border-t border-dashed border-slate-200" />
                  <span className="border-t border-dashed border-slate-200" />
                </div>
                {costHistory.map((item, index) => {
                  const height = Math.max(
                    8,
                    Math.round((item.totalCost / maxCost) * 190),
                  );

                  return (
                    <div
                      className="relative z-10 flex flex-1 flex-col items-center gap-2"
                      key={`${item.year}-${item.month}`}
                    >
                      <div
                        className={[
                          "w-full rounded-t bg-sky-200 transition hover:bg-sky-400",
                          index === costHistory.length - 1
                            ? "bg-sky-700 shadow-lg shadow-sky-500/20"
                            : "",
                        ].join(" ")}
                        style={{ height: `${height}px` }}
                        title={`${item.totalCost.toLocaleString("vi-VN")} ₫`}
                      />
                      <span
                        className={[
                          "text-xs font-bold tabular-nums",
                          index === costHistory.length - 1
                            ? "text-sky-700"
                            : "text-slate-500",
                        ].join(" ")}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="overflow-hidden lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <h2 className="text-2xl font-bold text-slate-950">
                Phiếu bảo trì gần đây
              </h2>
              <Link
                className="rounded px-1 text-sm font-bold text-sky-700 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                href="/maintenance"
              >
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
                  {isLoading ? (
                    <TableSkeleton />
                  ) : (
                    maintenanceRows.map((row) => (
                      <tr className="hover:bg-slate-50" key={row.id}>
                        <td className="px-4 py-4 font-bold text-slate-950 tabular-nums">
                          {row.id}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {row.equipment}
                        </td>
                        <td className="px-4 py-4 text-slate-600 tabular-nums">
                          {row.date}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded px-2 py-1 text-xs font-semibold ${priorityClass(row.level)}`}
                          >
                            {row.level}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={`size-2 rounded-full ${statusDotClass(row.status)}`}
                            />
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
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
              {isLoading ? (
                <TimelineSkeleton />
              ) : activities.length > 0 ? (
                <ActivityTimeline items={activities} />
              ) : (
                <p className="text-sm text-slate-500">
                  Chưa có hoạt động gần đây.
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

function MetricSkeleton({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => (
    <Card className="p-4" key={index}>
      <div className="h-5 w-28 animate-pulse rounded bg-slate-100" />
      <div className="mt-6 h-10 w-20 animate-pulse rounded bg-slate-100" />
      <div className="mt-4 h-4 w-36 animate-pulse rounded bg-slate-100" />
    </Card>
  ));
}

function ChartSkeleton() {
  return (
    <div className="flex min-h-64 items-end gap-4 px-4 pb-4">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          className="flex-1 animate-pulse rounded-t bg-slate-100"
          key={index}
          style={{ height: `${80 + index * 18}px` }}
        />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return Array.from({ length: 4 }, (_, index) => (
    <tr key={index}>
      {Array.from({ length: 5 }, (_, cellIndex) => (
        <td className="px-4 py-4" key={cellIndex}>
          <div className="h-4 animate-pulse rounded bg-slate-100" />
        </td>
      ))}
    </tr>
  ));
}

function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div className="space-y-2" key={index}>
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function priorityClass(level: string) {
  if (level === "Khẩn cấp") {
    return "bg-red-50 text-red-600";
  }

  if (level === "Cao") {
    return "bg-amber-50 text-amber-600";
  }

  return "bg-indigo-50 text-indigo-600";
}

function statusDotClass(status: string) {
  return status === "Hoàn thành" ? "bg-emerald-500" : "bg-amber-500";
}

function toCsvRow(values: unknown[]) {
  return values.map(escapeCsvValue).join(",");
}

function escapeCsvValue(value: unknown) {
  const text = String(value ?? "");

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}
