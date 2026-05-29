"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Loader2,
  Plus,
  Search,
  WalletCards,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Card, PagePad, SecondaryButton } from "../_components/ui";
import {
  getStoredUser,
  maintenanceApi,
  type MaintenanceItem,
  type MaintenanceStats,
  type MaintenanceStatus,
} from "@/lib/api";

const STATUS_META: Record<MaintenanceStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Lên lịch",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  IN_PROGRESS: {
    label: "Đang làm",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  COMPLETED: {
    label: "Hoàn thành",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

const TYPE_LABELS: Record<string, string> = {
  ROUTINE: "Định kỳ",
  EMERGENCY: "Khẩn cấp",
  INSPECTION: "Kiểm tra",
  REPLACEMENT: "Thay thế",
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  CRITICAL: "Khẩn cấp",
};

const FILTERS: { label: string; value: MaintenanceStatus | "" }[] = [
  { label: "Tất cả", value: "" },
  { label: "Lên lịch", value: "PENDING" },
  { label: "Đang làm", value: "IN_PROGRESS" },
  { label: "Hoàn thành", value: "COMPLETED" },
];

const currencyFormatter = new Intl.NumberFormat("vi-VN");

export default function MaintenancePage() {
  const [user] = useState(() => getStoredUser());
  const [logs, setLogs] = useState<MaintenanceItem[]>([]);
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeStatus, setActiveStatus] = useState<MaintenanceStatus | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [listRes, statsRes] = await Promise.all([
        maintenanceApi.getAll({
          page: currentPage,
          limit: 10,
          ...(activeStatus ? { status: activeStatus } : {}),
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
          sort: "createdAt",
          order: "desc",
        }),
        maintenanceApi.getStats(),
      ]);

      setLogs(listRes.data);
      setTotal(listRes.total);
      setTotalPages(Math.max(1, listRes.totalPages));
      setStats(statsRes);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải dữ liệu bảo trì.",
      );
    } finally {
      setLoading(false);
    }
  }, [activeStatus, currentPage, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const startIndex = total === 0 ? 0 : (currentPage - 1) * 10 + 1;
  const endIndex = Math.min(currentPage * 10, total);

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
            {user?.role !== "DISPATCHER" && (
              <Link
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-sky-800"
                href="/maintenance/new"
              >
                <Plus className="size-4" />
                Tạo phiếu bảo trì
              </Link>
            )}
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={WalletCards}
            label="Chi phí tháng"
            value={`${currencyFormatter.format(stats?.monthlyCost ?? 0)} đ`}
            tone="red"
          />
          <StatCard
            icon={CheckCircle2}
            label="Hoàn thành"
            value={`${stats?.completed ?? 0} phiếu`}
            tone="emerald"
          />
          <StatCard
            icon={Clock3}
            label="Đang xử lý"
            value={`${stats?.inProgress ?? 0} phiếu`}
            tone="sky"
          />
          <StatCard
            icon={Wrench}
            label="Chờ bảo trì"
            value={`${stats?.pending ?? 0} phiếu`}
            tone="amber"
          />
        </div>

        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <button
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-semibold transition",
                    activeStatus === filter.value
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                  key={filter.value}
                  onClick={() => {
                    setActiveStatus(filter.value);
                    setCurrentPage(1);
                  }}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <label className="relative block w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm theo máy, serial, mô tả..."
                type="text"
                value={searchTerm}
              />
            </label>
          </div>

          {error ? (
            <div className="flex flex-col items-center gap-4 px-5 py-12 text-center">
              <p className="text-sm font-semibold text-red-600">{error}</p>
              <button
                className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-800"
                onClick={fetchData}
                type="button"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-4">Mã phiếu</th>
                    <th className="px-4 py-4">Thiết bị</th>
                    <th className="px-4 py-4">Kỹ thuật viên</th>
                    <th className="px-4 py-4">Loại</th>
                    <th className="px-4 py-4">Ưu tiên</th>
                    <th className="px-4 py-4 text-right">Chi phí</th>
                    <th className="px-4 py-4">Ngày tạo</th>
                    <th className="px-4 py-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {loading
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index}>
                          {Array.from({ length: 8 }).map((__, cellIndex) => (
                            <td className="px-4 py-4" key={cellIndex}>
                              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : logs.map((log) => {
                        const statusMeta = STATUS_META[log.status];

                        return (
                          <tr className="transition hover:bg-slate-50" key={log._id}>
                            <td className="px-4 py-4 font-bold text-slate-950">
                              MT-{log._id.slice(-6).toUpperCase()}
                            </td>
                            <td className="px-4 py-4">
                              <Link
                                className="font-bold text-slate-950 transition hover:text-sky-700"
                                href={
                                  log.machinery?._id
                                    ? `/machinery/${log.machinery._id}`
                                    : "/maintenance"
                                }
                              >
                                {log.machinery?.name ?? "Thiết bị không xác định"}
                              </Link>
                              <p className="mt-1 text-xs text-slate-500">
                                {log.machinery?.serialNumber ?? "Không có serial"}
                              </p>
                            </td>
                            <td className="px-4 py-4 font-semibold text-slate-700">
                              {log.technician?.fullName ?? "Chưa phân công"}
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {TYPE_LABELS[log.type] ?? log.type}
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {PRIORITY_LABELS[log.priority] ?? log.priority}
                            </td>
                            <td className="px-4 py-4 text-right font-bold tabular-nums text-slate-800">
                              {currencyFormatter.format(log.cost)} đ
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {new Date(log.createdAt).toLocaleDateString("vi-VN")}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusMeta.className}`}
                              >
                                {statusMeta.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}

                  {!loading && logs.length === 0 && (
                    <tr>
                      <td className="px-4 py-12 text-center text-sm text-slate-500" colSpan={8}>
                        Không có phiếu bảo trì phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!error && !loading && (
            <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-600">
                Hiển thị {startIndex} đến {endIndex} trong số {total} kết quả
              </span>
              <div className="flex gap-2">
                <button
                  className="grid size-10 place-items-center rounded border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  type="button"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="grid h-10 min-w-20 place-items-center rounded border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
                  {currentPage}/{totalPages}
                </span>
                <button
                  className="grid size-10 place-items-center rounded border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  type="button"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </PagePad>
  );
}

function StatCard({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: typeof WalletCards;
  label: string;
  tone: "red" | "emerald" | "sky" | "amber";
  value: string;
}) {
  const toneClass = {
    red: "bg-red-100 text-red-600",
    emerald: "bg-emerald-100 text-emerald-700",
    sky: "bg-sky-100 text-sky-700",
    amber: "bg-amber-100 text-amber-700",
  }[tone];

  return (
    <Card className="relative overflow-hidden p-4">
      <div className="absolute right-0 top-0 size-24 rounded-bl-full bg-indigo-50" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <span className={`grid size-10 shrink-0 place-items-center rounded-full ${toneClass}`}>
          <Icon className="size-5" />
        </span>
      </div>
    </Card>
  );
}
