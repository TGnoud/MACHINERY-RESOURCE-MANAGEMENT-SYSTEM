"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  Download,
  Eye,
  Plus,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Truck,
  User,
  Calendar,
  MapPin,
  FileText,
  X,
  Printer,
} from "lucide-react";

import { Card, PagePad } from "../_components/ui";
import {
  getStoredUser,
  assignmentApi,
  type AssignmentItem,
  type MachineryItem,
} from "@/lib/api";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Chờ xử lý",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  ACTIVE: {
    label: "Đang hoạt động",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  COMPLETED: {
    label: "Hoàn thành",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

const MACHINERY_STATUS_MAP: Record<string, { label: string; className: string }> = {
  AVAILABLE: {
    label: "Sẵn sàng",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  RENTED: {
    label: "Đang thuê",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  MAINTENANCE: {
    label: "Bảo trì",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

const getCategoryImage = (item: any) => {
  if (!item) return "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=200";
  if (item.imageUrl) return item.imageUrl;
  const catName = (item.category?.name || "").toLowerCase();
  if (catName.includes("xúc") || catName.includes("cuốc") || catName.includes("đào")) {
    return "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?auto=format&fit=crop&q=80&w=200";
  }
  if (catName.includes("cẩu") || catName.includes("nâng")) {
    return "https://images.unsplash.com/photo-1542362567-b07eac79094d?auto=format&fit=crop&q=80&w=200";
  }
  if (catName.includes("ủi") || catName.includes("lu")) {
    return "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=200";
  }
  return "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=200";
};

// Global failed url cache
const failedUrls = new Set<string>();

const ImageWithFallback = ({
  item,
  machineries,
  getCategoryImage,
  className = "size-10 rounded object-cover border border-slate-200/60 shadow-sm bg-slate-100",
}: {
  item: any;
  machineries: any[];
  getCategoryImage: (item: any) => string;
  className?: string;
}) => {
  const initialSrc = getCategoryImage(item);
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const currentSrc = getCategoryImage(item);
    if (failedUrls.has(currentSrc)) {
      triggerFallback(currentSrc);
    } else {
      setImgSrc(currentSrc);
      setFailed(false);
    }
  }, [item, getCategoryImage]);

  const triggerFallback = (failedSrc: string) => {
    failedUrls.add(failedSrc);
    setFailed(true);

    if (!item) return;
    const categoryName = item.category?.name;
    // Find another machinery in the list with the same category that has a different imageUrl that has not failed
    const sibling = machineries.find(
      (m) =>
        m &&
        m._id !== item._id &&
        m.category?.name === categoryName &&
        m.imageUrl &&
        m.imageUrl !== failedSrc &&
        !failedUrls.has(m.imageUrl)
    );

    if (sibling && sibling.imageUrl) {
      console.log("Fallback for " + item.name + " -> sibling " + sibling.name + ": " + sibling.imageUrl);
      setImgSrc(sibling.imageUrl);
    } else {
      // Fallback to Unsplash category image
      const catName = (categoryName || "").toLowerCase();
      let fallbackUrl = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=200";
      if (catName.includes("xúc") || catName.includes("cuốc") || catName.includes("đào")) {
        fallbackUrl = "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?auto=format&fit=crop&q=80&w=200";
      } else if (catName.includes("cẩu") || catName.includes("nâng")) {
        fallbackUrl = "https://images.unsplash.com/photo-1542362567-b07eac79094d?auto=format&fit=crop&q=80&w=200";
      } else if (catName.includes("ủi") || catName.includes("lu")) {
        fallbackUrl = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=200";
      }
      setImgSrc(fallbackUrl);
    }
  };

  const handleError = () => {
    if (failed) return;
    triggerFallback(imgSrc);
  };

  return (
    <img
      src={imgSrc}
      alt={item?.name || "Thiết bị"}
      onError={handleError}
      className={className}
    />
  );
};

export default function AssignmentsPage() {
  const [user] = useState(() => getStoredUser());
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters & Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [jumpPage, setJumpPage] = useState("");
  
  // Voucher Detail Modal State
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null);
  const [tempStatus, setTempStatus] = useState<string>("");
  const [tempEndDate, setTempEndDate] = useState<string | undefined>(undefined);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    if (selectedAssignment) {
      setTempStatus(selectedAssignment.status);
      setTempEndDate(selectedAssignment.endDate);
    } else {
      setTempStatus("");
      setTempEndDate(undefined);
    }
  }, [selectedAssignment]);

  useEffect(() => {
    setJumpPage(currentPage.toString());
  }, [currentPage]);

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
      const res = await assignmentApi.getAll({
        page: currentPage,
        limit: 10,
        ...(activeFilter ? { status: activeFilter } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(fromDate ? { startDate: fromDate } : {}),
        ...(toDate ? { endDate: toDate } : {}),
        sort: "dispatchPriority",
        order: "asc",
      });
      setAssignments(res.data);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải dữ liệu phân bổ.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilter, debouncedSearch, fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownloadCSV = () => {
    const headers = [
      "Mã phiếu",
      "Thiết bị",
      "Số serial",
      "Người điều phối",
      "Điểm đến",
      "Ngày bắt đầu",
      "Ngày kết thúc",
      "Trạng thái",
    ];

    const rows = assignments.map((item) => {
      const statusLabel = STATUS_MAP[item.status]?.label || item.status;
      const startDateStr = item.startDate ? new Date(item.startDate).toLocaleDateString("vi-VN") : "";
      const endDateStr = item.endDate ? new Date(item.endDate).toLocaleDateString("vi-VN") : "Đang diễn ra";

      return [
        `"ASG-${item._id.slice(-6).toUpperCase()}"`,
        `"${(item.machinery?.name || "").replace(/"/g, '""')}"`,
        `"${(item.machinery?.serialNumber || "").replace(/"/g, '""')}"`,
        `"${(item.dispatcher?.fullName || "").replace(/"/g, '""')}"`,
        `"${(item.destination || "").replace(/"/g, '""')}"`,
        `"${startDateStr}"`,
        `"${endDateStr}"`,
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
    link.setAttribute("download", `lich_trinh_dieu_phoi_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startIndex = (currentPage - 1) * 10 + 1;
  const endIndex = Math.min(currentPage * 10, total);

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

        {/* Filter Card */}
        <Card className="mb-6 p-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_200px_160px_160px_auto] lg:items-end">
            <label className="space-y-1.5">
              <span className="text-sm font-bold text-slate-600">Tìm kiếm</span>
              <span className="relative block">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition"
                  placeholder="Nhập thiết bị, điểm đến..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </span>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-bold text-slate-600">Trạng thái</span>
              <select
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition"
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="COMPLETED">Hoàn thành</option>
              </select>
            </label>
            
            <label className="space-y-1.5">
              <span className="text-sm font-bold text-slate-600">Từ ngày</span>
              <input
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition"
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-bold text-slate-600">Đến ngày</span>
              <input
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition"
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </label>

            <div className="flex gap-2">
              <button
                className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                title="Tải xuống"
                type="button"
                onClick={handleDownloadCSV}
              >
                <Download className="size-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Error state */}
        {error && (
          <Card className="flex flex-col items-center gap-4 px-5 py-12 text-center mb-6">
            <p className="text-sm text-red-600">{error}</p>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-800"
              onClick={fetchData}
              type="button"
            >
              Thử lại
            </button>
          </Card>
        )}

        {/* Data Table */}
        {!error && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-4">Mã phiếu</th>
                    <th className="px-4 py-4">Thiết bị</th>
                    <th className="px-4 py-4">Người điều phối</th>
                    <th className="px-4 py-4">Điểm đến</th>
                    <th className="px-4 py-4">Ngày bắt đầu</th>
                    <th className="px-4 py-4">Ngày kết thúc</th>
                    <th className="px-4 py-4">Trạng thái</th>
                    <th className="px-4 py-4 text-right">Xem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 8 }).map((_, j) => (
                            <td className="px-4 py-4" key={j}>
                              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : assignments.map((item) => {
                        const statusInfo = STATUS_MAP[item.status] ?? {
                          label: item.status,
                          className: "bg-slate-50 text-slate-700 border-slate-200",
                        };

                        return (
                          <tr className="transition hover:bg-slate-50" key={item._id}>
                            <td className="px-4 py-4">
                              <button
                                className="font-bold text-sky-700 hover:text-sky-800 outline-none"
                                onClick={() => setSelectedAssignment(item)}
                              >
                                ASG-{item._id.slice(-6).toUpperCase()}
                              </button>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <ImageWithFallback
                                  item={item.machinery}
                                  machineries={assignments.map((a) => a.machinery).filter(Boolean)}
                                  getCategoryImage={getCategoryImage}
                                  className="size-10 rounded object-cover border border-slate-200/60 shadow-sm bg-slate-100 animate-fade-in"
                                />
                                <div>
                                  <p className="font-bold text-slate-950">
                                    {item.machinery?.name || "Thiết bị đã xóa"}
                                  </p>
                                  <p className="mt-0.5 text-xs text-slate-500">
                                    Số serial: {item.machinery?.serialNumber || "—"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-slate-700">
                              {item.dispatcher?.fullName || "—"}
                            </td>
                            <td className="max-w-[220px] truncate px-4 py-4 text-slate-700" title={item.destination}>
                              {item.destination}
                            </td>
                            <td className="px-4 py-4 text-slate-700">
                              {item.startDate ? new Date(item.startDate).toLocaleDateString("vi-VN") : "—"}
                            </td>
                            <td className="px-4 py-4 text-slate-700">
                              {item.endDate ? new Date(item.endDate).toLocaleDateString("vi-VN") : "Đang diễn ra"}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold whitespace-nowrap ${statusInfo.className}`}
                              >
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <button
                                className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-sky-700 outline-none ml-auto"
                                onClick={() => setSelectedAssignment(item)}
                                type="button"
                              >
                                <Eye className="size-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                  {/* Empty state */}
                  {!loading && assignments.length === 0 && (
                    <tr>
                      <td
                        className="px-4 py-12 text-center text-sm text-slate-500"
                        colSpan={8}
                      >
                        Không tìm thấy lệnh điều phối nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination block aligned with Machinery */}
            {!error && !loading && assignments.length > 0 && (
              <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  Hiển thị {startIndex} đến {endIndex} trong số {total} kết quả
                </p>
                
                <div className="flex flex-wrap items-center gap-4">
                  {/* Page range buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className="grid size-9 place-items-center rounded border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                      type="button"
                      title="Trang trước"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    
                    {(() => {
                      const pages: (number | string)[] = [];
                      const maxVisible = 5;
                      
                      if (totalPages <= maxVisible) {
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        pages.push(1);
                        const start = Math.max(2, currentPage - 1);
                        const end = Math.min(totalPages - 1, currentPage + 1);
                        
                        if (start > 2) {
                          pages.push("...");
                        }
                        for (let i = start; i <= end; i++) {
                          pages.push(i);
                        }
                        if (end < totalPages - 1) {
                          pages.push("...");
                        }
                        pages.push(totalPages);
                      }
                      
                      return pages;
                    })().map((page, idx) => (
                      page === "..." ? (
                        <span className="grid size-9 place-items-center text-sm font-semibold text-slate-400" key={`dots-${idx}`}>
                          ...
                        </span>
                      ) : (
                        <button
                          className={[
                            "grid size-9 place-items-center rounded text-sm font-semibold border transition-all duration-200",
                            page === currentPage
                              ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
                          ].join(" ")}
                          key={`page-${page}`}
                          onClick={() => setCurrentPage(page as number)}
                          type="button"
                        >
                          {page}
                        </button>
                      )
                    ))}
                    
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      className="grid size-9 place-items-center rounded border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                      type="button"
                      title="Trang sau"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>

                  {/* Jump to page input */}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>Đi đến:</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={jumpPage}
                      onChange={(e) => setJumpPage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const page = parseInt(jumpPage);
                          if (page >= 1 && page <= totalPages) {
                            setCurrentPage(page);
                          }
                        }
                      }}
                      className="h-9 w-12 rounded border border-slate-200 bg-white text-center outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-sm font-semibold"
                    />
                    <span>/ {totalPages}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* STUNNING VOUCHER DETAIL MODAL */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2 text-sky-700">
                <FileText className="size-5" />
                <span className="font-bold text-sm tracking-wide uppercase">
                  Phiếu điều phối thiết bị
                </span>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="grid size-8 place-items-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body - Voucher Format */}
            <div className="overflow-y-auto p-6 flex-1 space-y-6">
              
              {/* Decorative Voucher Banner */}
              <div className="border-2 border-dashed border-sky-200 rounded-2xl bg-sky-50/50 p-5 flex flex-col items-center text-center">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-wide uppercase">
                  LỆNH ĐIỀU ĐỘNG THIẾT BỊ
                </h3>
                <p className="text-xs font-bold text-sky-700 mt-1 uppercase">
                  MÃ SỐ PHIẾU: ASG-{selectedAssignment._id.slice(-6).toUpperCase()}
                </p>
                <p className="text-[10px] text-slate-400 mt-2">
                  Ngày lập phiếu: {new Date(selectedAssignment.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>

              {/* Grid: 2 columns */}
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* Column 1: Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Thông tin điều động
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex gap-3 text-sm">
                      <MapPin className="size-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-400">Điểm đến công trình</p>
                        <p className="font-semibold text-slate-900 mt-0.5">{selectedAssignment.destination}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 text-sm">
                      <Truck className="size-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-400">Trạng thái vận chuyển</p>
                        {user?.role === "ADMIN" &&
                        selectedAssignment.status !== "COMPLETED" &&
                        selectedAssignment.machinery?.status !== "MAINTENANCE" ? (
                          <div className="relative mt-1 block">
                            <select
                              value={tempStatus}
                              onChange={(e) => {
                                const newStatus = e.target.value;
                                setTempStatus(newStatus);
                                if (newStatus === "ACTIVE") {
                                  setTempEndDate(undefined);
                                } else if (newStatus === "COMPLETED") {
                                  setTempEndDate(new Date().toISOString());
                                }
                              }}
                              className="h-8 rounded-lg border border-slate-200 bg-white px-2 pr-7 text-xs font-bold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 appearance-none cursor-pointer"
                            >
                              <option value="PENDING" disabled={selectedAssignment.status !== "PENDING"}>
                                Chờ xử lý
                              </option>
                              <option value="ACTIVE">Đang hoạt động</option>
                              <option value="COMPLETED">Hoàn thành</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
                          </div>
                        ) : (
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold mt-1 ${
                              STATUS_MAP[selectedAssignment.status]?.className
                            }`}
                          >
                            {STATUS_MAP[selectedAssignment.status]?.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 text-sm">
                      <Calendar className="size-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-400">Ngày bắt đầu</p>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          {new Date(selectedAssignment.startDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 text-sm">
                      <Calendar className="size-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-400">Ngày kết thúc dự kiến</p>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          {tempEndDate
                            ? new Date(tempEndDate).toLocaleDateString("vi-VN")
                            : "Đang diễn ra"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 text-sm">
                      <User className="size-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-400">Người lập phiếu</p>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          {selectedAssignment.dispatcher?.fullName || "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {selectedAssignment.dispatcher?.email || ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Equipment details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Thông tin thiết bị
                  </h4>
                  
                  {selectedAssignment.machinery ? (
                    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50 p-4 space-y-3">
                      <ImageWithFallback
                        item={selectedAssignment.machinery}
                        machineries={assignments.map((a) => a.machinery).filter(Boolean)}
                        getCategoryImage={getCategoryImage}
                        className="h-28 w-full rounded-xl object-cover border border-slate-200 shadow-sm bg-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {selectedAssignment.machinery.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Số serial: {selectedAssignment.machinery.serialNumber}
                        </p>
                        <p className="text-xs text-slate-500">
                          Hãng sản xuất: {selectedAssignment.machinery.manufacturer || "—"}
                        </p>
                        <div className="mt-3">
                          <p className="mb-1 text-xs font-bold text-slate-400">
                            Trạng thái hiện tại của thiết bị
                          </p>
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                              MACHINERY_STATUS_MAP[selectedAssignment.machinery.status]?.className ??
                              "border-slate-200 bg-slate-50 text-slate-700"
                            }`}
                          >
                            {MACHINERY_STATUS_MAP[selectedAssignment.machinery.status]?.label ??
                              selectedAssignment.machinery.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Short specs list */}
                      {Object.entries(selectedAssignment.machinery.specs || {}).length > 0 && (
                        <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px]">
                          {Object.entries(selectedAssignment.machinery.specs || {}).slice(0, 4).map(([k, v]) => (
                            <div key={k} className="bg-white rounded px-2 py-1 border border-slate-200/40">
                              <span className="text-slate-400 font-medium block truncate">{k}</span>
                              <span className="text-slate-800 font-bold block truncate">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 italic p-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                      Thông tin thiết bị đã được xóa khỏi hệ thống.
                    </div>
                  )}
                </div>

              </div>

              {/* Notes and Instructions */}
              {selectedAssignment.notes && (
                <div className="border-t border-slate-100 pt-5">
                  <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100/80">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ghi chú & Hướng dẫn điều phối</p>
                    <p className="text-sm text-slate-700 mt-1.5 whitespace-pre-line leading-relaxed">{selectedAssignment.notes}</p>
                  </div>
                </div>
              )}

            </div>

             {/* Modal Footer */}
             <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end gap-2 shrink-0">
               <button
                 onClick={() => setSelectedAssignment(null)}
                 className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
               >
                 Đóng
               </button>

               {user?.role === "ADMIN" &&
                selectedAssignment.status !== "COMPLETED" &&
                selectedAssignment.machinery?.status !== "MAINTENANCE" && (
                 <button
                   disabled={savingStatus || (tempStatus === selectedAssignment.status && tempEndDate === selectedAssignment.endDate)}
                   onClick={async () => {
                     setSavingStatus(true);
                     try {
                       const payload: Record<string, any> = {
                         status: tempStatus,
                       };
                       if (tempStatus === "ACTIVE") {
                         payload.endDate = null;
                       } else if (tempStatus === "COMPLETED") {
                         payload.endDate = tempEndDate || new Date().toISOString();
                       }
                       const updated = await assignmentApi.update(selectedAssignment._id, payload);
                       setSelectedAssignment(updated);
                       fetchData();
                     } catch (err) {
                       alert("Lỗi khi lưu trạng thái: " + (err instanceof Error ? err.message : String(err)));
                     } finally {
                       setSavingStatus(false);
                     }
                   }}
                   className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                 >
                   {savingStatus ? (
                     <Loader2 className="size-4 animate-spin" />
                   ) : (
                     "Lưu"
                   )}
                 </button>
               )}

               <button
                 onClick={() => {
                   window.print();
                 }}
                 className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-4 py-2 text-sm font-bold text-white hover:bg-sky-800 transition"
               >
                 <Printer className="size-4" />
                 In phiếu
               </button>
             </div>

          </div>
        </div>
      )}
    </PagePad>
  );
}
