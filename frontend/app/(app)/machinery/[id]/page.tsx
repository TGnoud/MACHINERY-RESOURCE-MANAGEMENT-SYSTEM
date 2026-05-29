"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  Edit3,
  Fuel,
  Loader2,
  Timer,
  Trash2,
  Truck,
  Wrench,
} from "lucide-react";

import {
  Card,
  PagePad,
  PrimaryButton,
  SecondaryButton,
} from "../../_components/ui";
import {
  getStoredUser,
  machineryApi,
  type MaintenanceItem,
  type MachineryItem,
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

const MAINTENANCE_STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Lên lịch",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  IN_PROGRESS: {
    label: "Đang bảo trì",
    className: "bg-sky-50 text-sky-700 border-sky-200",
  },
  COMPLETED: {
    label: "Hoàn thành",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

export default function MachineryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user] = useState(() => getStoredUser());
  const [machinery, setMachinery] = useState<MachineryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "maintenance" | "assignments">("overview");

  const [imgSrc, setImgSrc] = useState<string>("");

  useEffect(() => {
    if (machinery) {
      setImgSrc(getCategoryImage(machinery));
    }
  }, [machinery]);

  const handleImageError = () => {
    if (!machinery) return;
    const catName = (machinery.category?.name || "").toLowerCase();
    let fallbackUrl = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600";
    if (catName.includes("xúc") || catName.includes("cuốc") || catName.includes("đào")) {
      fallbackUrl = "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?auto=format&fit=crop&q=80&w=600";
    } else if (catName.includes("cẩu") || catName.includes("nâng")) {
      fallbackUrl = "https://images.unsplash.com/photo-1542362567-b07eac79094d?auto=format&fit=crop&q=80&w=600";
    } else if (catName.includes("ủi") || catName.includes("lu")) {
      fallbackUrl = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600";
    }
    setImgSrc(fallbackUrl);
  };

  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceItem[]>([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  useEffect(() => {
    async function fetchMachinery() {
      setLoading(true);
      setError(null);
      try {
        const data = await machineryApi.getById(id);
        setMachinery(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Không thể tải thông tin thiết bị.",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchMachinery();
  }, [id]);

  useEffect(() => {
    async function fetchMaintenance() {
      setLoadingMaintenance(true);
      try {
        const data = await machineryApi.getMaintenance(id);
        setMaintenanceLogs(data);
      } catch (err) {
        console.error("Failed to fetch maintenance logs:", err);
      } finally {
        setLoadingMaintenance(false);
      }
    }

    fetchMaintenance();
  }, [id]);

  useEffect(() => {
    if (activeTab === "assignments") {
      async function fetchAssignments() {
        setLoadingAssignments(true);
        try {
          const data = await machineryApi.getAssignments(id);
          setAssignments(data);
        } catch (err) {
          console.error("Failed to fetch assignments:", err);
        } finally {
          setLoadingAssignments(false);
        }
      }
      fetchAssignments();
    }
  }, [activeTab, id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await machineryApi.remove(id);
      router.push("/machinery");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể xóa thiết bị.",
      );
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getCategoryImage = (item: MachineryItem) => {
    if (item.imageUrl) return item.imageUrl;
    const catName = (item.category?.name || "").toLowerCase();
    if (catName.includes("xúc") || catName.includes("cuốc") || catName.includes("đào")) {
      return "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?auto=format&fit=crop&q=80&w=600";
    }
    if (catName.includes("cẩu") || catName.includes("nâng")) {
      return "https://images.unsplash.com/photo-1542362567-b07eac79094d?auto=format&fit=crop&q=80&w=600";
    }
    if (catName.includes("ủi") || catName.includes("lu")) {
      return "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600";
    }
    return "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600";
  };

  // Loading state
  if (loading) {
    return (
      <PagePad>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-sky-700" />
        </div>
      </PagePad>
    );
  }

  // Error state
  if (error || !machinery) {
    return (
      <PagePad>
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
            <p className="text-lg font-semibold text-red-600">
              {error ?? "Không tìm thấy thiết bị."}
            </p>
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-800"
              href="/machinery"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </PagePad>
    );
  }

  const statusInfo = STATUS_MAP[machinery.status] ?? {
    label: machinery.status,
    className: "bg-slate-50 text-slate-700 border-slate-200",
  };

  const basicInfo = [
    ["Thương hiệu", machinery.manufacturer ?? "—"],
    ["Model", machinery.name],
    ["Năm sản xuất", machinery.purchaseYear?.toString() ?? "—"],
    ["Danh mục", machinery.category?.name ?? "—"],
  ];

  const specsEntries = Object.entries(machinery.specs ?? {});
  const latestMaintenance = maintenanceLogs[0];
  const latestMaintenanceStatus = latestMaintenance
    ? MAINTENANCE_STATUS_MAP[latestMaintenance.status]
    : null;

  return (
    <PagePad>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Chi tiết thiết bị
            </h1>
            <p className="mt-2 text-slate-600">
              {machinery.name} • {machinery.serialNumber}
              <span
                className={`ml-3 inline-flex rounded-full border px-3 py-0.5 text-xs font-bold whitespace-nowrap ${statusInfo.className}`}
              >
                {statusInfo.label}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            {user?.role === "ADMIN" && (
              <>
                <SecondaryButton onClick={() => router.push(`/machinery/${id}/edit`)}>
                  <Edit3 className="size-4" />
                  Sửa
                </SecondaryButton>
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
                  onClick={() => setShowDeleteConfirm(true)}
                  type="button"
                >
                  <Trash2 className="size-4" />
                  Xóa
                </button>
              </>
            )}
            {user?.role !== "TECHNICIAN" && (
              <PrimaryButton className="h-11 px-6" onClick={() => router.push(`/assignments/new?machineryId=${id}`)}>
                <Truck className="size-4" />
                Điều phối
              </PrimaryButton>
            )}
          </div>
        </div>

        {/* Delete confirmation dialog */}
        {showDeleteConfirm && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="mb-3 text-sm font-semibold text-red-800">
              Bạn có chắc chắn muốn xóa thiết bị &ldquo;{machinery.name}&rdquo;?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                disabled={deleting}
                onClick={handleDelete}
                type="button"
              >
                {deleting && <Loader2 className="size-4 animate-spin" />}
                Xác nhận xóa
              </button>
              <button
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(false)}
                type="button"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8 flex gap-8 overflow-x-auto border-b border-slate-200">
          {[
            { id: "overview", label: "Tổng quan" },
            { id: "specs", label: "Thông số kỹ thuật" },
            { id: "maintenance", label: "Lịch sử bảo trì" },
            { id: "assignments", label: "Lịch sử điều phối" },
          ].map((tab) => (
            <button
              className={[
                "shrink-0 border-b-2 py-4 text-sm font-bold transition-all duration-200",
                activeTab === tab.id
                  ? "border-sky-700 text-sky-700"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300",
              ].join(" ")}
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column - Basic info card */}
            <Card className="overflow-hidden rounded-3xl shadow-sm">
              <div className="h-56 overflow-hidden bg-slate-200">
                <img
                  src={imgSrc}
                  onError={handleImageError}
                  alt={machinery.name}
                  className="h-full w-full object-cover transition-all duration-300 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h2 className="mb-4 text-xl font-bold text-slate-950">
                  Thông tin cơ bản
                </h2>
                <div className="divide-y divide-slate-100">
                  {basicInfo.map(([label, value]) => (
                    <div
                      className="flex justify-between gap-4 py-3 text-sm"
                      key={label}
                    >
                      <span className="text-slate-500">{label}</span>
                      <span className="font-bold text-slate-950">{value}</span>
                    </div>
                  ))}
                  {machinery.location && (
                    <div className="flex justify-between gap-4 py-3 text-sm">
                      <span className="text-slate-500">Vị trí</span>
                      <span className="font-bold text-slate-950">
                        {machinery.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Right column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Quick stats */}
              <div className="grid gap-6 sm:grid-cols-2">
                <QuickStat
                  icon={Timer}
                  label="Số giờ hoạt động"
                  suffix="giờ"
                  tone="sky"
                  value={machinery.operatingHours.toLocaleString("vi-VN")}
                />
                <QuickStat
                  icon={Fuel}
                  label="Mức tiêu hao (TB)"
                  suffix="L/h"
                  tone="amber"
                  value={machinery.fuelConsumption.toString()}
                />
              </div>

              <Card className="rounded-3xl p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Wrench className="size-5 text-sky-700" />
                      <h2 className="text-xl font-bold text-slate-950">
                        Trạng thái bảo trì
                      </h2>
                    </div>
                    {loadingMaintenance ? (
                      <p className="text-sm text-slate-500">Đang tải lịch sử bảo trì...</p>
                    ) : latestMaintenance ? (
                      <>
                        <p className="text-sm leading-6 text-slate-600">
                          {latestMaintenance.description}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          Cập nhật:{" "}
                          {new Date(latestMaintenance.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Thiết bị này chưa có lịch sử bảo trì.
                      </p>
                    )}
                  </div>
                  {latestMaintenanceStatus ? (
                    <span
                      className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-bold whitespace-nowrap ${latestMaintenanceStatus.className}`}
                    >
                      {latestMaintenanceStatus.label}
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      Chưa có phiếu mở
                    </span>
                  )}
                </div>
              </Card>

              {/* Specs card */}
              <Card className="rounded-3xl p-6">
                <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-950">
                    Tóm tắt thông số
                  </h2>
                  <button
                    onClick={() => setActiveTab("specs")}
                    className="inline-flex items-center gap-1 text-sm font-bold text-sky-700 hover:text-sky-800 transition"
                    type="button"
                  >
                    Xem tất cả
                    <ChevronRight className="size-4" />
                  </button>
                </div>
                {specsEntries.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-3">
                    {specsEntries.slice(0, 6).map(([label, value], index) => (
                      <div
                        className={[
                          "rounded-xl border border-slate-100 bg-slate-50 p-4",
                          index === Math.min(specsEntries.length, 6) - 1 &&
                          Math.min(specsEntries.length, 6) % 3 !== 0
                            ? "sm:col-span-2"
                            : "",
                        ].join(" ")}
                        key={label}
                      >
                        <p className="text-sm text-slate-500">{label}</p>
                        <p className="mt-1 text-sm font-bold text-slate-950">
                          {String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Chưa có thông số kỹ thuật.
                  </p>
                )}
              </Card>
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <Card className="rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950 mb-6">Chi tiết thông số kỹ thuật</h2>
            {specsEntries.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {specsEntries.map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-5 shadow-sm transition hover:shadow-md">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="mt-2 text-lg font-bold text-slate-800">{String(value)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">Thiết bị này hiện chưa được cấu hình thông số kỹ thuật.</p>
            )}
          </Card>
        )}

        {activeTab === "maintenance" && (
          <div>
            {loadingMaintenance ? (
              <div className="flex justify-center py-12">
                <Loader2 className="size-8 animate-spin text-sky-700" />
              </div>
            ) : maintenanceLogs.length > 0 ? (
              <Card className="rounded-3xl overflow-hidden shadow-sm border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Ngày bảo trì</th>
                        <th className="px-6 py-4">Kỹ thuật viên</th>
                        <th className="px-6 py-4">Loại bảo trì</th>
                        <th className="px-6 py-4">Độ ưu tiên</th>
                        <th className="px-6 py-4">Trạng thái</th>
                        <th className="px-6 py-4">Chi phí</th>
                        <th className="px-6 py-4">Mô tả</th>
                        <th className="px-6 py-4">Phụ tùng thay thế</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {maintenanceLogs.map((log) => {
                        const priorityColors = 
                          log.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200 font-bold' :
                          log.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold' :
                          'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
                          
                        const statusColors = 
                          log.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' :
                          log.status === 'IN_PROGRESS' ? 'bg-sky-50 text-sky-700 border-sky-200 font-bold' :
                          'bg-amber-50 text-amber-700 border-amber-200 font-bold';

                        return (
                          <tr key={log._id} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                              {new Date(log.createdAt).toLocaleDateString('vi-VN')}
                              {log.completedAt ? ` - ${new Date(log.completedAt).toLocaleDateString('vi-VN')}` : ''}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-semibold">
                              {log.technician?.fullName || '—'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                              {{
                                ROUTINE: 'Định kỳ',
                                EMERGENCY: 'Khẩn cấp',
                                INSPECTION: 'Kiểm tra',
                                REPLACEMENT: 'Thay thế',
                              }[log.type] ?? log.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs whitespace-nowrap ${priorityColors}`}>
                                {log.priority === 'HIGH' ? 'Khẩn cấp' : log.priority === 'MEDIUM' ? 'Trung bình' : 'Thấp'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs whitespace-nowrap ${statusColors}`}>
                                {log.status === 'COMPLETED' ? 'Hoàn thành' : log.status === 'IN_PROGRESS' ? 'Đang làm' : 'Lên lịch'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800 tabular-nums">
                              {log.cost !== undefined ? `${log.cost.toLocaleString('vi-VN')} ₫` : '0 ₫'}
                            </td>
                            <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={log.description}>
                              {log.description || '—'}
                            </td>
                            <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={log.spareParts?.map((part) => part.name).join(', ')}>
                              {log.spareParts && log.spareParts.length > 0 ? log.spareParts.map((part) => part.name).join(', ') : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-slate-500">Thiết bị này chưa có lịch sử ghi nhận bảo trì.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "assignments" && (
          <div>
            {loadingAssignments ? (
              <div className="flex justify-center py-12">
                <Loader2 className="size-8 animate-spin text-sky-700" />
              </div>
            ) : assignments.length > 0 ? (
              <Card className="rounded-3xl overflow-hidden shadow-sm border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Địa điểm đến (Dự án)</th>
                        <th className="px-6 py-4">Người điều phối</th>
                        <th className="px-6 py-4">Ngày bắt đầu</th>
                        <th className="px-6 py-4">Ngày kết thúc</th>
                        <th className="px-6 py-4">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {assignments.map((asg: any) => {
                        const statusColors = 
                          asg.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700 border-slate-200 font-semibold' :
                          asg.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' :
                          'bg-amber-50 text-amber-700 border-amber-200 font-bold';

                        return (
                          <tr key={asg._id || asg.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                              {asg.destination || '—'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-semibold">
                              {asg.dispatcher?.fullName || asg.dispatcherName || '—'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                              {asg.startDate ? new Date(asg.startDate).toLocaleDateString('vi-VN') : '—'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                              {asg.endDate ? new Date(asg.endDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex rounded-full border px-3 py-0.5 text-xs whitespace-nowrap ${statusColors}`}>
                                {asg.status === 'COMPLETED' ? 'Đã hoàn thành' : asg.status === 'ACTIVE' ? 'Đang hoạt động' : 'Lên lịch'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-slate-500">Thiết bị này chưa có lịch sử điều phối công trình.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PagePad>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  suffix,
  tone,
}: {
  icon: typeof Timer;
  label: string;
  value: string;
  suffix: string;
  tone: "sky" | "amber";
}) {
  return (
    <Card className="rounded-3xl p-6">
      <div className="flex items-start gap-4">
        <span
          className={[
            "grid size-12 place-items-center rounded-xl",
            tone === "sky"
              ? "bg-sky-50 text-sky-700"
              : "bg-amber-50 text-amber-600",
          ].join(" ")}
        >
          <Icon className="size-6" />
        </span>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">
            {value}
            <span className="ml-1 text-sm font-medium text-slate-500">
              {suffix}
            </span>
          </p>
        </div>
      </div>
    </Card>
  );
}
