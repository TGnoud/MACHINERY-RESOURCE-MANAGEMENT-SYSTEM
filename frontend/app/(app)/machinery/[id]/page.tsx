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
                className={`ml-3 inline-flex rounded-full border px-3 py-0.5 text-xs font-bold ${statusInfo.className}`}
              >
                {statusInfo.label}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            {user?.role === "ADMIN" && (
              <>
                <SecondaryButton>
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
              <PrimaryButton className="h-11 px-6">
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
            "Tổng quan",
            "Thông số kỹ thuật",
            "Lịch sử bảo trì",
            "Lịch sử điều phối",
          ].map((tab, index) => (
            <button
              className={[
                "shrink-0 border-b-2 py-4 text-sm font-bold",
                index === 0
                  ? "border-sky-700 text-sky-700"
                  : "border-transparent text-slate-500",
              ].join(" ")}
              key={tab}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column - Basic info card */}
          <Card className="overflow-hidden rounded-3xl">
            <div className="h-48 bg-slate-200 bg-cover bg-center">
              <div className="flex h-full items-center justify-center text-slate-400">
                <Truck className="size-16" />
              </div>
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

            {/* Specs card */}
            <Card className="rounded-3xl p-6">
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-950">
                  Tóm tắt thông số
                </h2>
                <button
                  className="inline-flex items-center gap-1 text-sm font-bold text-sky-700"
                  type="button"
                >
                  Xem tất cả
                  <ChevronRight className="size-4" />
                </button>
              </div>
              {specsEntries.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  {specsEntries.map(([label, value], index) => (
                    <div
                      className={[
                        "rounded-xl border border-slate-100 bg-slate-50 p-4",
                        index === specsEntries.length - 1 &&
                        specsEntries.length % 3 !== 0
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
