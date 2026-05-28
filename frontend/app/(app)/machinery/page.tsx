"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  Download,
  Eye,
  Filter,
  Plus,
  Search,
  Loader2,
} from "lucide-react";

import { Card, PagePad } from "../_components/ui";
import {
  getStoredUser,
  machineryApi,
  type MachineryItem,
  type MachineryStatus as MachineryStatusType,
} from "@/lib/api";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  AVAILABLE: {
    label: "Sẵn sàng",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  RENTED: {
    label: "Đang thuê",
    className: "bg-sky-50 text-sky-700 border-sky-200",
  },
  MAINTENANCE: {
    label: "Bảo trì",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

const FILTERS: { label: string; value: MachineryStatusType | "" }[] = [
  { label: "Tất cả", value: "" },
  { label: "Sẵn sàng", value: "AVAILABLE" },
  { label: "Đang thuê", value: "RENTED" },
  { label: "Bảo trì", value: "MAINTENANCE" },
];

export default function MachineryPage() {
  const [user] = useState(() => getStoredUser());
  const [machineries, setMachineries] = useState<MachineryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeFilter, setActiveFilter] = useState<MachineryStatusType | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await machineryApi.getAll({
        page: currentPage,
        limit: 10,
        ...(activeFilter ? { status: activeFilter } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        sort: sortBy,
        order: sortOrder,
      });
      setMachineries(res.data);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilter, debouncedSearch, sortBy, sortOrder]);

  const handleDownloadCSV = () => {
    const headers = [
      "Tên thiết bị",
      "Số serial",
      "Danh mục",
      "Hãng sản xuất",
      "Năm mua",
      "Giờ hoạt động",
      "Tiêu hao nhiên liệu (L/h)",
      "Vị trí",
      "Trạng thái",
    ];

    const rows = machineries.map((item) => {
      const statusLabel =
        item.status === "AVAILABLE"
          ? "Sẵn sàng"
          : item.status === "RENTED"
          ? "Đang thuê"
          : item.status === "MAINTENANCE"
          ? "Bảo trì"
          : item.status;

      return [
        `"${(item.name || "").replace(/"/g, '""')}"`,
        `"${(item.serialNumber || "").replace(/"/g, '""')}"`,
        `"${(item.category?.name || "").replace(/"/g, '""')}"`,
        `"${(item.manufacturer || "").replace(/"/g, '""')}"`,
        item.purchaseYear !== undefined && item.purchaseYear !== null ? String(item.purchaseYear) : "",
        String(item.operatingHours || 0),
        String(item.fuelConsumption || 0),
        `"${(item.location || "").replace(/"/g, '""')}"`,
        `"${statusLabel}"`,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `danh_sach_thiet_bi_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (value: MachineryStatusType | "") => {
    setActiveFilter(value);
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * 10 + 1;
  const endIndex = Math.min(currentPage * 10, total);

  return (
    <PagePad>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Quản lý thiết bị
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Danh sách máy móc và trạng thái vận hành hiện tại.
            </p>
          </div>
          {user?.role === "ADMIN" && (
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-sky-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-800"
              href="/machinery/new"
            >
              <Plus className="size-4" />
              Thêm thiết bị
            </Link>
          )}
        </div>

        <Card className="overflow-hidden">
          {/* Search bar */}
          <div className="border-b border-slate-200 bg-white px-5 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo tên hoặc số serial..."
                type="text"
                value={searchTerm}
              />
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <button
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-semibold transition",
                    activeFilter === filter.value
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                  key={filter.value}
                  onClick={() => handleFilterChange(filter.value)}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowSortPanel(!showSortPanel)}
                className={[
                  "grid size-10 place-items-center rounded-lg border transition",
                  showSortPanel
                    ? "border-sky-500 bg-sky-50 text-sky-700 font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                <Filter className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleDownloadCSV}
                className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              >
                <Download className="size-4" />
              </button>
            </div>
          </div>

          {/* Sort options panel */}
          {showSortPanel && (
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50/50 px-5 py-3 text-sm">
              <span className="font-semibold text-slate-500">Sắp xếp theo:</span>
              {[
                { label: "Ngày tạo", field: "createdAt" },
                { label: "Giờ hoạt động", field: "operatingHours" },
                { label: "Năm mua", field: "purchaseYear" },
                { label: "Tiêu hao", field: "fuelConsumption" },
              ].map((option) => {
                const isSelected = sortBy === option.field;
                return (
                  <button
                    key={option.field}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortBy(option.field);
                        setSortOrder("desc");
                      }
                      setCurrentPage(1);
                    }}
                    className={[
                      "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition border",
                      isSelected
                        ? "bg-sky-50 border-sky-200 text-sky-700"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {option.label}
                    {isSelected && (
                      <span className="text-[10px]">
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center gap-4 px-5 py-12 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-800"
                onClick={fetchData}
                type="button"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Data table */}
          {!error && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-4">#</th>
                    <th className="px-4 py-4">Tên thiết bị</th>
                    <th className="px-4 py-4">Số serial</th>
                    <th className="px-4 py-4">Danh mục</th>
                    <th className="px-4 py-4">Hãng sản xuất</th>
                    <th className="px-4 py-4">Năm mua</th>
                    <th className="px-4 py-4">Vị trí</th>
                    <th className="px-4 py-4">Trạng thái</th>
                    <th className="px-4 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 9 }).map((_, j) => (
                            <td className="px-4 py-4" key={j}>
                              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : machineries.map((item, index) => {
                        const statusInfo = STATUS_MAP[item.status] ?? {
                          label: item.status,
                          className: "bg-slate-50 text-slate-700 border-slate-200",
                        };

                        return (
                          <tr
                            className="transition hover:bg-slate-50"
                            key={item._id}
                          >
                            <td className="px-4 py-4">
                              <div className="grid size-12 place-items-center rounded-lg bg-sky-50 text-sky-700">
                                {startIndex + index}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <Link
                                className="font-bold text-slate-950 transition hover:text-sky-700"
                                href={`/machinery/${item._id}`}
                              >
                                {item.name}
                              </Link>
                              <p className="mt-1 text-xs text-slate-500">
                                Mã: {item.serialNumber}
                              </p>
                            </td>
                            <td className="px-4 py-4 font-semibold text-slate-700">
                              {item.serialNumber}
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {item.category?.name ?? "—"}
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {item.manufacturer ?? "—"}
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {item.purchaseYear ?? "—"}
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {item.location ?? "—"}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusInfo.className}`}
                              >
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex justify-end gap-1 text-slate-500">
                                <Link
                                  className="grid size-8 place-items-center rounded-md transition hover:bg-slate-100 hover:text-sky-700"
                                  href={`/machinery/${item._id}`}
                                >
                                  <Eye className="size-4" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                  {/* Empty state */}
                  {!loading && machineries.length === 0 && (
                    <tr>
                      <td
                        className="px-4 py-12 text-center text-sm text-slate-500"
                        colSpan={9}
                      >
                        Không tìm thấy thiết bị nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!error && !loading && machineries.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Hiển thị {startIndex} đến {endIndex} trong số {total} kết quả
              </p>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      className={[
                        "grid size-9 place-items-center rounded text-sm font-semibold",
                        page === currentPage
                          ? "bg-sky-500 text-white"
                          : "text-slate-600 hover:bg-white",
                      ].join(" ")}
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      type="button"
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </PagePad>
  );
}
