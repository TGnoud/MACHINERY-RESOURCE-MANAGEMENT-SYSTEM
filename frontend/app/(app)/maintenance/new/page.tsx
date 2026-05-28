"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  FileText,
  PackagePlus,
  Plus,
  Search,
  UserRound,
  Wrench,
  Factory,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { Card, PagePad } from "../../_components/ui";
import { getStoredUser } from "@/lib/api";

export default function NewMaintenanceTicketPage() {
  const router = useRouter();
  const [isAllowed] = useState(() => {
    const user = getStoredUser();

    return !user || user.role === "ADMIN" || user.role === "TECHNICIAN";
  });

  useEffect(() => {
    if (!isAllowed) {
      router.replace("/403");
    }
  }, [isAllowed, router]);

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
            Điền thông tin chi tiết để yêu cầu bảo trì thiết bị, phân công kỹ
            thuật viên và theo dõi tiến độ.
          </p>
        </div>

        <form className="space-y-6 pb-8">
          <FormCard icon={Factory} title="Thông tin thiết bị">
            <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <SelectField
                label="Máy móc"
                options={[
                  "Chọn thiết bị cần bảo trì...",
                  "Máy xúc Komatsu PC200",
                  "Cần cẩu Liebherr 112 EC-H",
                  "Xe nâng Komatsu 3 Tấn",
                ]}
                required
              />
              <TextField
                disabled
                label="Serial Number"
                value="HS-VF2-88492"
              />
            </div>

            <div className="mt-6 rounded-lg bg-indigo-50 px-5 py-4">
              <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base">
                <span className="font-medium text-slate-700">
                  Trạng thái hiện tại:
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-bold text-amber-600">
                  <span className="size-2 rounded-full bg-amber-500" />
                  Cảnh báo hao mòn (Cần kiểm tra)
                </span>
              </div>
            </div>
          </FormCard>

          <FormCard icon={Wrench} title="Chi tiết bảo trì">
            <div className="grid gap-5 lg:grid-cols-2">
              <SelectField
                label="Loại bảo trì"
                options={[
                  "Bảo trì định kỳ (Routine)",
                  "Bảo trì khẩn cấp",
                  "Kiểm tra an toàn",
                  "Thay thế linh kiện",
                ]}
                required
              />
              <SelectField
                label="Mức độ ưu tiên"
                options={[
                  "Trung bình (Medium)",
                  "Thấp (Low)",
                  "Cao (High)",
                  "Khẩn cấp (Critical)",
                ]}
                required
              />
              <SelectField
                icon={UserRound}
                label="Kỹ thuật viên phụ trách"
                options={[
                  "Chọn kỹ thuật viên...",
                  "Trần Văn B",
                  "Phạm Văn Cường",
                  "Nguyễn Văn An",
                ]}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <DateField label="Ngày dự kiến" />
                <TimeField label="Giờ bắt đầu" />
              </div>
            </div>
          </FormCard>

          <FormCard icon={FileText} title="Mô tả vấn đề & Linh kiện">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Mô tả chi tiết vấn đề <RequiredMark />
              </span>
              <textarea
                className="mt-2 min-h-40 w-full resize-y rounded-lg border border-slate-200 bg-white p-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                placeholder="Nhập mô tả chi tiết về tình trạng máy, các triệu chứng bất thường, âm thanh lạ..."
                rows={5}
              />
            </label>

            <div className="mt-6">
              <label className="text-sm font-medium text-slate-700">
                Linh kiện/Vật tư dự kiến cần thiết
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <span className="sr-only">Tìm kiếm linh kiện trong kho</span>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                    placeholder="Tìm kiếm linh kiện trong kho..."
                    type="text"
                  />
                </label>
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  type="button"
                >
                  <Plus className="size-4" />
                  Thêm linh kiện
                </button>
              </div>

              <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center">
                <div className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-white text-slate-500">
                  <PackagePlus className="size-5" />
                </div>
                <p className="font-semibold text-slate-800">
                  Chưa có linh kiện nào được chọn.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Tìm kiếm hoặc thêm linh kiện mới để dự trù vật tư.
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
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-sky-700 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-sky-800"
              type="button"
            >
              <FileText className="size-4" />
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
  icon: Icon,
  label,
  options,
  required,
}: {
  icon?: ComponentType<{ className?: string }>;
  label: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label} {required ? <RequiredMark /> : null}
      </span>
      <span className="relative mt-2 block">
        {Icon ? (
          <Icon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
        ) : null}
        <select
          className={[
            "h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white pr-11 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10",
            Icon ? "pl-12" : "pl-4",
          ].join(" ")}
          defaultValue={options[0]}
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
      </span>
    </label>
  );
}

function DateField({ label }: { label: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="relative mt-2 block">
        <input
          className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 pr-11 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          type="date"
        />
        <CalendarDays className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-700" />
      </span>
    </label>
  );
}

function TimeField({ label }: { label: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="relative mt-2 block">
        <input
          className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 pr-11 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          type="time"
        />
        <Clock3 className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-700" />
      </span>
    </label>
  );
}
