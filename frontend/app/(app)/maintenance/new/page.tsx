"use client";

import {
  CalendarDays,
  ChevronDown,
  Factory,
  FileText,
  Loader2,
  PackagePlus,
  Plus,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";

import { Card, PagePad } from "../../_components/ui";
import {
  getStoredUser,
  machineryApi,
  maintenanceApi,
  type MachineryItem,
  type MaintenancePriority,
  type MaintenanceStatus,
  type MaintenanceType,
} from "@/lib/api";

const TYPE_OPTIONS: { label: string; value: MaintenanceType }[] = [
  { label: "Bảo trì định kỳ", value: "ROUTINE" },
  { label: "Bảo trì khẩn cấp", value: "EMERGENCY" },
  { label: "Kiểm tra an toàn", value: "INSPECTION" },
  { label: "Thay thế linh kiện", value: "REPLACEMENT" },
];

const PRIORITY_OPTIONS: { label: string; value: MaintenancePriority }[] = [
  { label: "Thấp", value: "LOW" },
  { label: "Trung bình", value: "MEDIUM" },
  { label: "Cao", value: "HIGH" },
  { label: "Khẩn cấp", value: "CRITICAL" },
];

const STATUS_OPTIONS: { label: string; value: MaintenanceStatus }[] = [
  { label: "Lên lịch", value: "PENDING" },
  { label: "Đang làm", value: "IN_PROGRESS" },
  { label: "Hoàn thành", value: "COMPLETED" },
];

const MACHINERY_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Sẵn sàng",
  RENTED: "Đang thuê",
  MAINTENANCE: "Bảo trì",
};

export default function NewMaintenanceTicketPage() {
  const router = useRouter();
  const [user] = useState(() => getStoredUser());
  const [machineries, setMachineries] = useState<MachineryItem[]>([]);
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [machineryId, setMachineryId] = useState("");
  const [type, setType] = useState<MaintenanceType>("ROUTINE");
  const [priority, setPriority] = useState<MaintenancePriority>("MEDIUM");
  const [status, setStatus] = useState<MaintenanceStatus>("PENDING");
  const [cost, setCost] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [description, setDescription] = useState("");
  const [sparePartName, setSparePartName] = useState("");
  const [sparePartCost, setSparePartCost] = useState("");

  const isAllowed = !user || user.role === "ADMIN" || user.role === "TECHNICIAN";

  useEffect(() => {
    if (!isAllowed) {
      router.replace("/403");
    }
  }, [isAllowed, router]);

  useEffect(() => {
    async function fetchMachineries() {
      setLoadingMachines(true);
      setError(null);

      try {
        const response = await machineryApi.getAll({
          page: 1,
          limit: 1000,
          sort: "name",
          order: "asc",
        });

        setMachineries(response.data);
        setMachineryId((current) => current || response.data[0]?._id || "");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Không thể tải danh sách máy móc.",
        );
      } finally {
        setLoadingMachines(false);
      }
    }

    fetchMachineries();
  }, []);

  const selectedMachinery = useMemo(
    () => machineries.find((item) => item._id === machineryId) ?? null,
    [machineries, machineryId],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!machineryId || !description.trim()) {
      setError("Vui lòng chọn máy móc và nhập mô tả bảo trì.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const parsedCost = Number(cost || 0);
      const parsedSparePartCost = Number(sparePartCost || 0);

      await maintenanceApi.create({
        machinery: machineryId,
        technician: user?.id,
        type,
        priority,
        status,
        description: description.trim(),
        cost: Number.isFinite(parsedCost) ? parsedCost : 0,
        completedAt:
          status === "COMPLETED" && completedAt ? completedAt : undefined,
        spareParts: sparePartName.trim()
          ? [
              {
                name: sparePartName.trim(),
                quantity: 1,
                cost: Number.isFinite(parsedSparePartCost)
                  ? parsedSparePartCost
                  : 0,
              },
            ]
          : [],
      });

      router.push("/maintenance");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo phiếu bảo trì.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAllowed) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <PagePad>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Tạo phiếu bảo trì mới
          </h1>
          <p className="mt-3 max-w-4xl text-lg leading-8 text-slate-600">
            Ghi nhận yêu cầu bảo trì, cập nhật trạng thái máy và lưu lịch sử xử
            lý cho từng thiết bị.
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <form className="space-y-6 pb-8" onSubmit={handleSubmit}>
          <FormCard icon={Factory} title="Thông tin thiết bị">
            <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <SelectField
                disabled={loadingMachines || machineries.length === 0}
                label="Máy móc"
                onChange={setMachineryId}
                options={machineries.map((item) => ({
                  label: `${item.name} - ${item.serialNumber}`,
                  value: item._id,
                }))}
                placeholder={
                  loadingMachines ? "Đang tải máy móc..." : "Chọn máy móc"
                }
                required
                value={machineryId}
              />
              <TextField
                disabled
                label="Serial Number"
                value={selectedMachinery?.serialNumber ?? ""}
              />
            </div>

            <div className="mt-6 rounded-lg bg-indigo-50 px-5 py-4">
              <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base">
                <span className="font-medium text-slate-700">
                  Trạng thái hiện tại:
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
                  <span className="size-2 rounded-full bg-amber-500" />
                  {selectedMachinery
                    ? MACHINERY_STATUS_LABELS[selectedMachinery.status]
                    : "Chưa chọn máy"}
                </span>
              </div>
            </div>
          </FormCard>

          <FormCard icon={Wrench} title="Chi tiết bảo trì">
            <div className="grid gap-5 lg:grid-cols-2">
              <SelectField
                label="Loại bảo trì"
                onChange={(value) => setType(value as MaintenanceType)}
                options={TYPE_OPTIONS}
                required
                value={type}
              />
              <SelectField
                label="Mức độ ưu tiên"
                onChange={(value) => setPriority(value as MaintenancePriority)}
                options={PRIORITY_OPTIONS}
                required
                value={priority}
              />
              <SelectField
                label="Trạng thái phiếu"
                onChange={(value) => setStatus(value as MaintenanceStatus)}
                options={STATUS_OPTIONS}
                required
                value={status}
              />
              <NumberField
                label="Chi phí dự kiến"
                onChange={setCost}
                placeholder="0"
                value={cost}
              />
              {status === "COMPLETED" ? (
                <DateField
                  label="Ngày hoàn thành"
                  onChange={setCompletedAt}
                  value={completedAt}
                />
              ) : null}
            </div>
          </FormCard>

          <FormCard icon={FileText} title="Mô tả vấn đề & linh kiện">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Mô tả chi tiết vấn đề <RequiredMark />
              </span>
              <textarea
                className="mt-2 min-h-40 w-full resize-y rounded-lg border border-slate-200 bg-white p-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Nhập tình trạng máy, dấu hiệu bất thường, hạng mục cần xử lý..."
                required
                rows={5}
                value={description}
              />
            </label>

            <div className="mt-6">
              <label className="text-sm font-medium text-slate-700">
                Linh kiện/Vật tư dự kiến
              </label>
              <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_220px]">
                <input
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                  onChange={(event) => setSparePartName(event.target.value)}
                  placeholder="Tên linh kiện"
                  type="text"
                  value={sparePartName}
                />
                <NumberField
                  label="Chi phí linh kiện"
                  onChange={setSparePartCost}
                  placeholder="0"
                  value={sparePartCost}
                  visuallyHideLabel
                />
              </div>

              <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center">
                <div className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-white text-slate-500">
                  <PackagePlus className="size-5" />
                </div>
                <p className="font-semibold text-slate-800">
                  {sparePartName.trim()
                    ? sparePartName
                    : "Chưa có linh kiện nào được chọn."}
                </p>
              </div>
            </div>
          </FormCard>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              href="/maintenance"
            >
              Hủy bỏ
            </Link>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-sky-700 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting || loadingMachines}
              type="submit"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Tạo phiếu bảo trì
            </button>
          </div>
        </form>
      </div>
    </PagePad>
  );
}

function FormCard({
  children,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  icon: ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-slate-200 pb-4">
        <Icon className="size-5 text-sky-700" />
        <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

function RequiredMark() {
  return <span className="text-red-500">*</span>;
}

function TextField({
  disabled,
  label,
  value,
}: {
  disabled?: boolean;
  label: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-indigo-50 px-4 text-base text-slate-700 outline-none disabled:cursor-not-allowed disabled:text-slate-600"
        disabled={disabled}
        readOnly
        type="text"
        value={value}
      />
    </label>
  );
}

function SelectField({
  disabled,
  label,
  onChange,
  options,
  placeholder,
  required,
  value,
}: {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label} {required ? <RequiredMark /> : null}
      </span>
      <span className="relative mt-2 block">
        <select
          className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-4 pr-11 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          value={value}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
      </span>
    </label>
  );
}

function DateField({
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
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="relative mt-2 block">
        <input
          className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 pr-11 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          onChange={(event) => onChange(event.target.value)}
          type="date"
          value={value}
        />
        <CalendarDays className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-700" />
      </span>
    </label>
  );
}

function NumberField({
  label,
  onChange,
  placeholder,
  value,
  visuallyHideLabel,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
  visuallyHideLabel?: boolean;
}) {
  return (
    <label className="block">
      <span
        className={
          visuallyHideLabel ? "sr-only" : "text-sm font-medium text-slate-700"
        }
      >
        {label}
      </span>
      <input
        className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
        min={0}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="number"
        value={value}
      />
    </label>
  );
}
