"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  CalendarDays,
  ChevronDown,
  FileText,
  Info,
  MapPin,
  Route,
  SendHorizonal,
  Loader2,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { Card, PagePad } from "../../_components/ui";
import {
  getStoredUser,
  machineryApi,
  assignmentApi,
  type MachineryItem,
} from "@/lib/api";

export default function NewAssignmentPage() {
  const router = useRouter();
  const [user] = useState(() => getStoredUser());
  const [isAllowed] = useState(() => {
    return !user || user.role === "ADMIN" || user.role === "DISPATCHER";
  });

  // Machinery options from API
  const [machineries, setMachineries] = useState<MachineryItem[]>([]);
  const [loadingMachineries, setLoadingMachineries] = useState(true);

  // Form States
  const [machineryId, setMachineryId] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [notes, setNotes] = useState("");
  
  // Status feedback states
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAllowed) {
      router.replace("/403");
    }
  }, [isAllowed, router]);

  // Fetch machinery options on mount
  useEffect(() => {
    async function fetchMachinery() {
      try {
        // Fetch all machineries (up to 1000) so dispatcher can choose
        const res = await machineryApi.getAll({ limit: 1000 });
        setMachineries(res.data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách thiết bị:", err);
      } finally {
        setLoadingMachineries(false);
      }
    }
    if (isAllowed) {
      fetchMachinery();
    }
  }, [isAllowed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineryId) {
      setError("Vui lòng chọn thiết bị cần điều động.");
      return;
    }
    if (!destination.trim()) {
      setError("Vui lòng nhập điểm đến / công trường.");
      return;
    }
    if (!startDate) {
      setError("Vui lòng chọn ngày bắt đầu.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: Record<string, any> = {
        machinery: machineryId,
        dispatcher: user?.id,
        destination: destination.trim(),
        startDate,
        status,
      };

      if (endDate) {
        payload.endDate = endDate;
      }

      await assignmentApi.create(payload);
      router.push("/assignments");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo phiếu điều phối.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAllowed) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <PagePad>
      <div className="mx-auto max-w-7xl">
        <nav className="mb-7 flex flex-wrap items-center gap-2 text-base font-medium text-slate-600">
          <Link className="transition hover:text-sky-700" href="/dashboard">
            Trang chủ
          </Link>
          <ChevronDown className="size-4 -rotate-90 text-slate-400" />
          <Link className="transition hover:text-sky-700" href="/assignments">
            Phân bổ & Điều phối
          </Link>
          <ChevronDown className="size-4 -rotate-90 text-slate-400" />
          <span className="font-bold text-sky-700">Tạo phiếu mới</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Tạo phiếu điều phối mới
          </h1>
          <p className="mt-3 max-w-4xl text-lg leading-8 text-slate-600">
            Nhập thông tin chi tiết để điều động thiết bị đến công trường hoặc trạm làm việc.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
          <div className="space-y-6">
            <FormCard icon={Info} iconTone="sky" title="Thông tin chung">
              <div className="grid gap-5 md:grid-cols-2">
                <TextField label="Mã phiếu" value="ASG-AUTO (Tự sinh)" />
                <TextField label="Người điều phối" value={user?.fullName || "Chưa đăng nhập"} />
              </div>

              <div className="mt-6">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Thiết bị cần điều động <span className="text-red-500">*</span>
                  </span>
                  <span className="relative mt-2 block">
                    <select
                      className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-11 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                      value={machineryId}
                      onChange={(e) => setMachineryId(e.target.value)}
                      required
                    >
                      <option value="">
                        {loadingMachineries ? "Đang tải danh sách..." : "Chọn thiết bị từ danh sách..."}
                      </option>
                      {machineries.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name} ({m.serialNumber}) — Trạng thái: {
                            m.status === "AVAILABLE" ? "Sẵn sàng" : m.status === "RENTED" ? "Đang thuê" : "Bảo trì"
                          }
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
                  </span>
                </label>
              </div>
            </FormCard>

            <FormCard icon={Route} iconTone="amber" title="Chi tiết điều phối">
              <div className="space-y-6">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Điểm đến / Công trường <span className="text-red-500">*</span>
                  </span>
                  <span className="relative mt-2 block">
                    <MapPin className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
                    <input
                      className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                      placeholder="Nhập địa chỉ hoặc tên công trường dự án..."
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                    />
                  </span>
                </label>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </span>
                    <span className="relative mt-2 block">
                      <input
                        className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 pr-11 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                      <CalendarDays className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-700" />
                    </span>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Ngày kết thúc dự kiến
                    </span>
                    <span className="relative mt-2 block">
                      <input
                        className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 pr-11 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                      <CalendarDays className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-700" />
                    </span>
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Trạng thái ban đầu <span className="text-red-500">*</span>
                  </span>
                  <span className="relative mt-2 block">
                    <select
                      className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-11 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      required
                    >
                      <option value="PENDING">Chờ xử lý (Chờ duyệt)</option>
                      <option value="IN_TRANSIT">Đang di chuyển</option>
                      <option value="ACTIVE">Đang hoạt động</option>
                      <option value="COMPLETED">Hoàn thành</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
                  </span>
                </label>
              </div>
            </FormCard>
          </div>

          <aside className="space-y-6">
            <FormCard icon={FileText} iconTone="indigo" title="Ghi chú & Hướng dẫn">
              <label className="block">
                <span className="flex items-center justify-between gap-4 text-sm font-medium text-slate-700">
                  <span>Nội dung ghi chú</span>
                  <span className="text-xs font-medium text-slate-500">Tùy chọn</span>
                </span>
                <textarea
                  className="mt-2 min-h-48 w-full resize-none rounded-lg border border-slate-200 bg-white p-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                  placeholder="Nhập hướng dẫn đặc biệt cho tài xế hoặc thông tin công trường..."
                  rows={7}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
            </FormCard>

            <Card className="p-5 sm:p-6">
              <h2 className="border-b border-slate-200 pb-4 text-lg font-semibold text-slate-950">
                Thao tác
              </h2>
              <div className="mt-6 space-y-4">
                <button
                  className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-sky-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-800 disabled:opacity-50"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <SendHorizonal className="size-5" />
                  )}
                  Tạo phiếu điều phối
                </button>
                <Link
                  className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 hover:text-sky-700"
                  href="/assignments"
                >
                  Hủy bỏ
                </Link>
              </div>
            </Card>
          </aside>
        </form>
      </div>
    </PagePad>
  );
}

function FormCard({
  children,
  icon: Icon,
  iconTone,
  title,
}: {
  children: ReactNode;
  icon: ComponentType<{ className?: string }>;
  iconTone: "sky" | "amber" | "indigo";
  title: string;
}) {
  const toneClass = {
    sky: "bg-sky-100 text-sky-700",
    amber: "bg-amber-100 text-amber-700",
    indigo: "bg-indigo-100 text-indigo-700",
  }[iconTone];

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-5">
        <span className={`grid size-10 place-items-center rounded-lg ${toneClass}`}>
          <Icon className="size-5" />
        </span>
        <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

function TextField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-indigo-50 px-4 text-base text-slate-700 outline-none"
        readOnly
        type="text"
        value={value}
      />
    </label>
  );
}
