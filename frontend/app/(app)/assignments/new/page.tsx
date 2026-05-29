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

  // Combobox & Search States
  const [machinerySearch, setMachinerySearch] = useState("");
  const [isMachineryDropdownOpen, setIsMachineryDropdownOpen] = useState(false);
  
  const [destinationPresets, setDestinationPresets] = useState<string[]>([]);
  const [isDestDropdownOpen, setIsDestDropdownOpen] = useState(false);

  // Form States
  const [machineryId, setMachineryId] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  
  // Status feedback states
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAllowed) {
      router.replace("/403");
    }
  }, [isAllowed, router]);

  // Fetch machinery options & destinations on mount
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
    async function fetchDestinations() {
      try {
        const res = await assignmentApi.getAll({ limit: 200 });
        const dests = Array.from(new Set(res.data.map(a => a.destination).filter(Boolean)));
        setDestinationPresets(dests);
      } catch (err) {
        console.error("Lỗi khi tải danh sách điểm đến mẫu:", err);
        setDestinationPresets([
          'Dự án VSIP mở rộng, Bình Dương',
          'Kho trung chuyển Cát Lái, TP.HCM',
          'Công trường hầm Thủ Thiêm',
          'Mỏ đá Kiên Giang',
          'Khu công nghiệp Long Hậu',
          'Cảng ICD Sóng Thần',
          'Dự án Metro Bến Thành - Suối Tiên',
          'Nhà máy cơ khí Đồng Nai',
          'Dự án sân bay Long Thành, Đồng Nai',
        ]);
      }
    }
    if (isAllowed) {
      fetchMachinery();
      fetchDestinations();
    }
  }, [isAllowed]);

  useEffect(() => {
    const queryMachineryId = new URLSearchParams(window.location.search).get(
      "machineryId",
    );
    if (!queryMachineryId || loadingMachineries || machineryId) {
      return;
    }

    const machinery = machineries.find((item) => item._id === queryMachineryId);
    if (!machinery) {
      return;
    }

    setMachineryId(queryMachineryId);
    if (machinery.status !== "AVAILABLE") {
      setError(
        "Thiết bị được chọn hiện không sẵn sàng để điều phối. Vui lòng chọn thiết bị khác.",
      );
    }
  }, [loadingMachineries, machineries, machineryId]);

  const selectedMachinery = machineries.find((item) => item._id === machineryId);
  const selectedMachineryUnavailable =
    Boolean(selectedMachinery) && selectedMachinery?.status !== "AVAILABLE";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineryId) {
      setError("Vui lòng chọn thiết bị cần điều động.");
      return;
    }
    if (selectedMachineryUnavailable) {
      setError(
        "Thiết bị được chọn hiện không sẵn sàng để điều phối. Vui lòng chọn thiết bị khác.",
      );
      return;
    }
    if (!destination.trim()) {
      setError("Vui lòng nhập hoặc chọn điểm đến / công trường.");
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
        notes: notes.trim() || undefined,
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

              <div className="mt-6 relative" id="machinery-combobox-container">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Thiết bị cần điều động <span className="text-red-500">*</span>
                  </span>
                  <span className="relative mt-2 block">
                    <button
                      type="button"
                      onClick={() => setIsMachineryDropdownOpen(!isMachineryDropdownOpen)}
                      className="h-12 w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 text-left"
                    >
                      <span className="truncate">
                        {(() => {
                          const selectedMachinery = machineries.find(m => m._id === machineryId);
                          return selectedMachinery
                            ? `${selectedMachinery.name} (${selectedMachinery.serialNumber}) — Trạng thái: ${
                                selectedMachinery.status === "AVAILABLE" ? "Sẵn sàng" : selectedMachinery.status === "RENTED" ? "Đang thuê" : "Bảo trì"
                              }`
                            : "Chọn thiết bị từ danh sách...";
                        })()}
                      </span>
                      <ChevronDown className={`size-5 text-slate-500 transition-transform duration-200 ${isMachineryDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isMachineryDropdownOpen && (
                      <div className="absolute left-0 right-0 z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                        <input
                          type="text"
                          className="h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-sky-500"
                          placeholder="Tìm tên hoặc số serial..."
                          value={machinerySearch}
                          onChange={(e) => setMachinerySearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="mt-2 space-y-1">
                          {loadingMachineries ? (
                            <div className="flex items-center justify-center p-4 text-sm text-slate-500">
                              <Loader2 className="size-4 animate-spin mr-2" /> Đang tải thiết bị...
                            </div>
                          ) : (
                            (() => {
                              const filtered = machineries.filter(
                                (m) =>
                                  m.name.toLowerCase().includes(machinerySearch.toLowerCase()) ||
                                  m.serialNumber.toLowerCase().includes(machinerySearch.toLowerCase())
                              );
                              if (filtered.length === 0) {
                                return <div className="p-3 text-center text-sm text-slate-500">Không tìm thấy thiết bị nào</div>;
                              }
                              return filtered.map((m) => {
                                const isSelected = m._id === machineryId;
                                const statusLabel = m.status === "AVAILABLE" ? "Sẵn sàng" : m.status === "RENTED" ? "Đang thuê" : "Bảo trì";
                                const statusColor = m.status === "AVAILABLE" ? "text-emerald-600 font-bold" : m.status === "RENTED" ? "text-sky-600 font-bold" : "text-red-500 font-bold";
                                return (
                                  <button
                                    key={m._id}
                                    type="button"
                                    disabled={m.status !== "AVAILABLE"}
                                    onClick={() => {
                                      setMachineryId(m._id);
                                      setError(null);
                                      setIsMachineryDropdownOpen(false);
                                      setMachinerySearch("");
                                    }}
                                    className={`flex w-full flex-col rounded-md px-3 py-2 text-left text-sm transition ${
                                      isSelected ? "bg-sky-50/70" : ""
                                    } ${
                                      m.status === "AVAILABLE"
                                        ? "hover:bg-slate-50 cursor-pointer"
                                        : "opacity-40 cursor-not-allowed bg-slate-50/30"
                                    }`}
                                    title={m.status !== "AVAILABLE" ? "Thiết bị hiện không sẵn sàng để điều phối" : ""}
                                  >
                                    <span className="font-bold text-slate-900">{m.name}</span>
                                    <span className="mt-0.5 flex items-center justify-between text-xs text-slate-500">
                                      <span>Số serial: {m.serialNumber}</span>
                                      <span className={statusColor}>
                                        {statusLabel} {m.status !== "AVAILABLE" && "(Không khả dụng)"}
                                      </span>
                                    </span>
                                  </button>
                                );
                              });
                            })()
                          )}
                        </div>
                      </div>
                    )}
                  </span>
                </label>
              </div>
            </FormCard>

            <FormCard icon={Route} iconTone="amber" title="Chi tiết điều phối">
              <div className="space-y-6">
                <label className="block relative" id="destination-combobox-container">
                  <span className="text-sm font-medium text-slate-700">
                    Điểm đến / Công trường <span className="text-red-500">*</span>
                  </span>
                  <span className="relative mt-2 block">
                    <MapPin className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500 z-10" />
                    <input
                      className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-10 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                      placeholder="Nhập địa chỉ hoặc tìm kiếm công trường dự án..."
                      type="text"
                      value={destination}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        setIsDestDropdownOpen(true);
                      }}
                      onFocus={() => setIsDestDropdownOpen(true)}
                      onBlur={() => {
                        setTimeout(() => setIsDestDropdownOpen(false), 200);
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsDestDropdownOpen(!isDestDropdownOpen);
                      }}
                      className="absolute right-3 top-1/2 size-8 -translate-y-1/2 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
                    >
                      <ChevronDown className={`size-4 transition-transform duration-200 ${isDestDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                  </span>

                  {isDestDropdownOpen && (
                    <div className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
                      {(() => {
                        const query = destination.trim().toLowerCase();
                        const filtered = destinationPresets.filter(
                          (d) => d.toLowerCase().includes(query)
                        );
                        if (filtered.length === 0) {
                          return (
                            <div className="p-3 text-center text-xs text-slate-500 italic">
                              Không tìm thấy điểm đến mẫu, tiếp tục gõ để nhập thủ công...
                            </div>
                          );
                        }
                        return filtered.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onMouseDown={() => {
                              setDestination(d);
                              setIsDestDropdownOpen(false);
                            }}
                            className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-slate-800 transition hover:bg-slate-50 hover:text-sky-700"
                          >
                            <MapPin className="mr-2 size-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium truncate">{d}</span>
                          </button>
                        ));
                      })()}
                    </div>
                  )}
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
              </div>
            </FormCard>
          </div>

          <aside className="space-y-6">
            <FormCard icon={FileText} iconTone="indigo" title="Ghi chú & Hướng dẫn">
              <label className="block">
                <span className="flex items-center justify-between gap-4 text-sm font-medium text-slate-700">
                  <span>Nội dung ghi chú & hướng dẫn</span>
                  <span className="text-xs font-medium text-slate-500">Tùy chọn</span>
                </span>
                <textarea
                  className="mt-2 min-h-48 w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                  placeholder="Nhập ghi chú, hướng dẫn đặc biệt cho tài xế hoặc thông tin công trường..."
                  rows={8}
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
                  disabled={saving || selectedMachineryUnavailable}
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
