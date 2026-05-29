"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Filter,
  Loader2,
  Plus,
  Search,
  WalletCards,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Card, PagePad } from "../_components/ui";
import {
  getStoredUser,
  maintenanceApi,
  type MaintenanceItem,
  type MaintenancePriority,
  type MaintenanceStats,
  type MaintenanceStatus,
  type MaintenanceType,
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

const STATUS_OPTIONS: { label: string; value: MaintenanceStatus | "" }[] = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Lên lịch", value: "PENDING" },
  { label: "Đang làm", value: "IN_PROGRESS" },
  { label: "Hoàn thành", value: "COMPLETED" },
];

const TYPE_LABELS: Record<MaintenanceType, string> = {
  ROUTINE: "Bảo trì định kỳ",
  EMERGENCY: "Bảo trì khẩn cấp",
  INSPECTION: "Kiểm tra an toàn",
  REPLACEMENT: "Thay thế linh kiện",
};

const TYPE_OPTIONS: { label: string; value: MaintenanceType | "" }[] = [
  { label: "Tất cả loại", value: "" },
  { label: TYPE_LABELS.ROUTINE, value: "ROUTINE" },
  { label: TYPE_LABELS.EMERGENCY, value: "EMERGENCY" },
  { label: TYPE_LABELS.INSPECTION, value: "INSPECTION" },
  { label: TYPE_LABELS.REPLACEMENT, value: "REPLACEMENT" },
];

const PRIORITY_LABELS: Record<MaintenancePriority, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  CRITICAL: "Khẩn cấp",
};

const PRIORITY_OPTIONS: { label: string; value: MaintenancePriority | "" }[] = [
  { label: "Tất cả ưu tiên", value: "" },
  { label: "Thấp", value: "LOW" },
  { label: "Trung bình", value: "MEDIUM" },
  { label: "Cao", value: "HIGH" },
  { label: "Khẩn cấp", value: "CRITICAL" },
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
  const [activeType, setActiveType] = useState<MaintenanceType | "">("");
  const [activePriority, setActivePriority] = useState<MaintenancePriority | "">("");
  const [minCost, setMinCost] = useState("");
  const [maxCost, setMaxCost] = useState("");
  const [debouncedMinCost, setDebouncedMinCost] = useState("");
  const [debouncedMaxCost, setDebouncedMaxCost] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [jumpPage, setJumpPage] = useState("1");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const canEditStatus = user?.role === "ADMIN" || user?.role === "TECHNICIAN";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedMinCost(minCost);
      setDebouncedMaxCost(maxCost);
      setCurrentPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [minCost, maxCost]);

  useEffect(() => {
    setJumpPage(String(currentPage));
  }, [currentPage]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const parsedMinCost = Number(debouncedMinCost);
      const parsedMaxCost = Number(debouncedMaxCost);
      const [listRes, statsRes] = await Promise.all([
        maintenanceApi.getAll({
          page: currentPage,
          limit: 10,
          ...(activeStatus ? { status: activeStatus } : {}),
          ...(activeType ? { type: activeType } : {}),
          ...(activePriority ? { priority: activePriority } : {}),
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
          ...(debouncedMinCost && Number.isFinite(parsedMinCost)
            ? { minCost: parsedMinCost }
            : {}),
          ...(debouncedMaxCost && Number.isFinite(parsedMaxCost)
            ? { maxCost: parsedMaxCost }
            : {}),
          sort: "statusPriority",
          order: "asc",
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
  }, [
    activePriority,
    activeStatus,
    activeType,
    currentPage,
    debouncedMaxCost,
    debouncedMinCost,
    debouncedSearch,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleStatusChange(id: string, status: MaintenanceStatus) {
    setUpdatingId(id);
    setError(null);

    try {
      await maintenanceApi.update(id, { status });
      await fetchData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể cập nhật trạng thái.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function handleDownloadCSV() {
    const headers = [
      "Ma phieu",
      "Thiet bi",
      "Serial",
      "Ky thuat vien",
      "Loai",
      "Uu tien",
      "Chi phi",
      "Ngay tao",
      "Trang thai",
    ];
    const escapeCsv = (value: unknown) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };
    const rows = logs.map((log) => [
      `MT-${log._id.slice(-6).toUpperCase()}`,
      log.machinery?.name ?? "",
      log.machinery?.serialNumber ?? "",
      log.technician?.fullName ?? "",
      TYPE_LABELS[log.type] ?? log.type,
      PRIORITY_LABELS[log.priority] ?? log.priority,
      log.cost,
      new Date(log.createdAt).toLocaleDateString("vi-VN"),
      STATUS_META[log.status]?.label ?? log.status,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `maintenance-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetFilters() {
    setActiveStatus("");
    setActiveType("");
    setActivePriority("");
    setMinCost("");
    setMaxCost("");
    setCurrentPage(1);
  }

  const startIndex = total === 0 ? 0 : (currentPage - 1) * 10 + 1;
  const endIndex = Math.min(currentPage * 10, total);

  return (
    <PagePad>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Nhật ký bảo trì
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Theo dõi chi phí, tiến độ và trạng thái bảo trì thiết bị.
            </p>
          </div>
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
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm theo máy, serial, mô tả..."
                type="text"
                value={searchTerm}
              />
            </label>
            <button
              aria-label="Bộ lọc"
              className={[
                "grid size-10 place-items-center rounded-lg border transition",
                showFilters
                  ? "border-sky-500 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              ].join(" ")}
              onClick={() => setShowFilters((value) => !value)}
              type="button"
            >
              <Filter className="size-4" />
            </button>
            <button
              aria-label="Download CSV"
              className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              onClick={handleDownloadCSV}
              title="Download CSV"
              type="button"
            >
              <Download className="size-4" />
            </button>
          </div>

          {showFilters ? (
            <div className="grid gap-3 border-b border-slate-200 bg-slate-50/70 px-5 py-4 md:grid-cols-2 xl:grid-cols-[180px_210px_190px_150px_150px_auto]">
              <FilterSelect
                label="Trạng thái"
                onChange={(value) => {
                  setActiveStatus(value as MaintenanceStatus | "");
                  setCurrentPage(1);
                }}
                options={STATUS_OPTIONS}
                value={activeStatus}
              />
              <FilterSelect
                label="Loại"
                onChange={(value) => {
                  setActiveType(value as MaintenanceType | "");
                  setCurrentPage(1);
                }}
                options={TYPE_OPTIONS}
                value={activeType}
              />
              <FilterSelect
                label="Ưu tiên"
                onChange={(value) => {
                  setActivePriority(value as MaintenancePriority | "");
                  setCurrentPage(1);
                }}
                options={PRIORITY_OPTIONS}
                value={activePriority}
              />
              <NumberFilter
                label="Chi phí từ"
                onChange={setMinCost}
                value={minCost}
              />
              <NumberFilter
                label="Chi phí đến"
                onChange={setMaxCost}
                value={maxCost}
              />
              <button
                className="h-10 self-end rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={resetFilters}
                type="button"
              >
                Xóa lọc
              </button>
            </div>
          ) : null}

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
              <table className="w-full min-w-[1120px] text-left">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-4">Mã phiếu</th>
                    <th className="px-4 py-4">Thiết bị</th>
                    <th className="px-4 py-4">Kỹ thuật viên</th>
                    <th className="min-w-[170px] px-4 py-4">Loại</th>
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
                            <td className="min-w-[170px] px-4 py-4 font-medium text-slate-700">
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
                              {canEditStatus && log.status !== "COMPLETED" ? (
                                <select
                                  className={`h-9 rounded-full border px-3 text-xs font-bold outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:opacity-60 ${statusMeta.className}`}
                                  disabled={updatingId === log._id}
                                  onChange={(event) =>
                                    handleStatusChange(
                                      log._id,
                                      event.target.value as MaintenanceStatus,
                                    )
                                  }
                                  value={log.status}
                                >
                                  <option value="PENDING">Lên lịch</option>
                                  <option value="IN_PROGRESS">Đang làm</option>
                                  <option value="COMPLETED">Hoàn thành</option>
                                </select>
                              ) : (
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusMeta.className}`}
                                >
                                  {statusMeta.label}
                                </span>
                              )}
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

          {!error && !loading && logs.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Hiển thị {startIndex} đến {endIndex} trong số {total} kết quả
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  <button
                    className="grid size-9 place-items-center rounded border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    title="Trang trước"
                    type="button"
                  >
                    <ChevronLeft className="size-4" />
                  </button>

                  {getVisiblePages(currentPage, totalPages).map((page, index) =>
                    page === "..." ? (
                      <span
                        className="grid size-9 place-items-center text-sm font-semibold text-slate-400"
                        key={`dots-${index}`}
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        className={[
                          "grid size-9 place-items-center rounded border text-sm font-semibold transition",
                          page === currentPage
                            ? "border-sky-500 bg-sky-500 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                        ].join(" ")}
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        type="button"
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    className="grid size-9 place-items-center rounded border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    title="Trang sau"
                    type="button"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>Đi đến:</span>
                  <input
                    className="h-9 w-12 rounded border border-slate-200 bg-white text-center text-sm font-semibold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10"
                    max={totalPages}
                    min={1}
                    onChange={(event) => setJumpPage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        const page = Number(jumpPage);
                        if (Number.isInteger(page) && page >= 1 && page <= totalPages) {
                          setCurrentPage(page);
                        }
                      }
                    }}
                    type="number"
                    value={jumpPage}
                  />
                  <span>/ {totalPages}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </PagePad>
  );
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages: (number | "...")[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let page = 1; page <= totalPages; page++) {
      pages.push(page);
    }
    return pages;
  }

  pages.push(1);
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    pages.push("...");
  }

  for (let page = start; page <= end; page++) {
    pages.push(page);
  }

  if (end < totalPages - 1) {
    pages.push("...");
  }

  pages.push(totalPages);
  return pages;
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberFilter({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
        min={0}
        onChange={(event) => onChange(event.target.value)}
        placeholder="0"
        type="number"
        value={value}
      />
    </label>
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
