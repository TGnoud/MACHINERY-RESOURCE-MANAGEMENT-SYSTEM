"use client";

import {
  ChevronDown,
  Factory,
  FileText,
  Loader2,
  Plus,
  Search,
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

export default function NewMaintenanceTicketPage() {
  const router = useRouter();
  const [user] = useState(() => getStoredUser());
  const [machineries, setMachineries] = useState<MachineryItem[]>([]);
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [machineryId, setMachineryId] = useState("");
  const [machineSearch, setMachineSearch] = useState("");
  const [isMachineMenuOpen, setIsMachineMenuOpen] = useState(false);
  const [type, setType] = useState<MaintenanceType>("ROUTINE");
  const [priority, setPriority] = useState<MaintenancePriority>("MEDIUM");
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");

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
          status: "AVAILABLE",
          sort: "name",
          order: "asc",
        });

        setMachineries(response.data);
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

  const filteredMachineries = useMemo(() => {
    const keyword = machineSearch.trim().toLowerCase();

    if (!keyword || selectedMachinery?.name === machineSearch) {
      return machineries;
    }

    return machineries.filter((item) => {
      const haystack = `${item.name} ${item.serialNumber}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [machineSearch, machineries, selectedMachinery]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!machineryId || !description.trim()) {
      setError("Vui lòng chọn máy sẵn sàng và nhập mô tả bảo trì.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const parsedCost = Number(cost || 0);

      await maintenanceApi.create({
        machinery: machineryId,
        technician: user?.id,
        type,
        priority,
        description: description.trim(),
        cost: Number.isFinite(parsedCost) ? parsedCost : 0,
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
            Ghi nhận yêu cầu bảo trì và lưu lịch sử xử lý cho thiết bị đang sẵn sàng.
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <form className="space-y-6 pb-8" onSubmit={handleSubmit}>
          <FormCard icon={Factory} title="Thông tin thiết bị">
            <MachineCombobox
              disabled={loadingMachines}
              isOpen={isMachineMenuOpen}
              loading={loadingMachines}
              machines={filteredMachineries}
              onBlur={() => window.setTimeout(() => setIsMachineMenuOpen(false), 120)}
              onFocus={() => setIsMachineMenuOpen(true)}
              onInputChange={(value) => {
                setMachineSearch(value);
                setMachineryId("");
                setIsMachineMenuOpen(true);
              }}
              onSelect={(machine) => {
                setMachineryId(machine._id);
                setMachineSearch(`${machine.name} - ${machine.serialNumber}`);
                setIsMachineMenuOpen(false);
              }}
              searchValue={machineSearch}
            />
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
              <NumberField
                label="Chi phí dự kiến"
                onChange={setCost}
                placeholder="0"
                value={cost}
              />
            </div>
          </FormCard>

          <FormCard icon={FileText} title="Mô tả vấn đề">
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

function MachineCombobox({
  disabled,
  isOpen,
  loading,
  machines,
  onBlur,
  onFocus,
  onInputChange,
  onSelect,
  searchValue,
}: {
  disabled?: boolean;
  isOpen: boolean;
  loading: boolean;
  machines: MachineryItem[];
  onBlur: () => void;
  onFocus: () => void;
  onInputChange: (value: string) => void;
  onSelect: (machine: MachineryItem) => void;
  searchValue: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        Máy móc sẵn sàng <RequiredMark />
      </span>
      <span className="relative mt-2 block">
        <Search className="absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 text-slate-400" />
        <input
          className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          disabled={disabled}
          onBlur={onBlur}
          onChange={(event) => onInputChange(event.target.value)}
          onFocus={onFocus}
          placeholder={loading ? "Đang tải máy móc..." : "Tìm theo tên hoặc serial..."}
          required
          type="text"
          value={searchValue}
        />
        {isOpen ? (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-white py-2 shadow-xl">
            {loading ? (
              <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-500">
                <Loader2 className="size-4 animate-spin" />
                Đang tải máy móc
              </div>
            ) : machines.length > 0 ? (
              machines.map((machine) => (
                <button
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-slate-50"
                  key={machine._id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onSelect(machine)}
                  type="button"
                >
                  <span>
                    <span className="block text-sm font-bold text-slate-950">
                      {machine.name}
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-slate-500">
                      {machine.serialNumber}
                    </span>
                  </span>
                  <span className="inline-flex shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    Sẵn sàng
                  </span>
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm font-semibold text-slate-500">
                Không có thiết bị sẵn sàng phù hợp.
              </p>
            )}
          </div>
        ) : null}
      </span>
    </label>
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

function SelectField({
  label,
  onChange,
  options,
  required,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
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
          className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-4 pr-11 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          onChange={(event) => onChange(event.target.value)}
          required={required}
          value={value}
        >
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

function NumberField({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
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
