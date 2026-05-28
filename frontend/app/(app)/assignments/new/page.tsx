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
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { Card, PagePad } from "../../_components/ui";
import { getStoredUser } from "@/lib/api";

export default function NewAssignmentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getStoredUser();
    setUser(u);
    if (u && u.role !== "ADMIN" && u.role !== "DISPATCHER") {
      router.replace("/403");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <PagePad>
      <div className="mx-auto max-w-7xl">
        <nav className="mb-7 flex flex-wrap items-center gap-2 text-base font-medium text-slate-600">
          <span>Trang chủ</span>
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
            Nhập thông tin chi tiết để điều động thiết bị đến công trường hoặc
            trạm làm việc.
          </p>
        </div>

        <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
          <div className="space-y-6">
            <FormCard icon={Info} iconTone="sky" title="Thông tin chung">
              <div className="grid gap-5 md:grid-cols-2">
                <TextField label="Mã phiếu" value="DP-2023-AUTO" />
                <TextField label="Người điều phối" value="Nguyễn Văn Quản lý" />
              </div>

              <div className="mt-6">
                <SelectField
                  label="Thiết bị cần điều động"
                  options={[
                    "Chọn thiết bị từ danh sách khả dụng...",
                    "Cẩu tháp Liebherr 112 EC-H",
                    "Xe nâng Komatsu 3 Tấn",
                    "Xe tải Hino 15 Tấn",
                    "Máy xúc lật Volvo L120",
                  ]}
                  required
                />
              </div>
            </FormCard>

            <FormCard icon={Route} iconTone="amber" title="Chi tiết điều phối">
              <div className="space-y-6">
                <TextInput
                  icon={MapPin}
                  label="Điểm đến / Công trường"
                  placeholder="Nhập địa chỉ, tọa độ hoặc tên dự án..."
                  required
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <DateField label="Ngày bắt đầu" required />
                  <DateField label="Ngày kết thúc dự kiến" />
                </div>

                <SelectField
                  label="Trạng thái ban đầu"
                  options={[
                    "Đang xử lý (Chờ duyệt)",
                    "Đang di chuyển",
                    "Đang hoạt động",
                  ]}
                  required
                />
              </div>
            </FormCard>
          </div>

          <aside className="space-y-6">
            <FormCard icon={FileText} iconTone="indigo" title="Ghi chú & Hướng dẫn">
              <label className="block">
                <span className="flex items-center justify-between gap-4 text-sm font-medium text-slate-700">
                  <span>Nội dung ghi chú</span>
                  <span className="text-xs font-medium text-slate-500">
                    Tùy chọn
                  </span>
                </span>
                <textarea
                  className="mt-2 min-h-48 w-full resize-none rounded-lg border border-slate-200 bg-white p-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                  placeholder="Nhập hướng dẫn đặc biệt cho tài xế, lưu ý an toàn, hoặc thông tin liên hệ tại công trường..."
                  rows={7}
                />
              </label>
            </FormCard>

            <Card className="p-5 sm:p-6">
              <h2 className="border-b border-slate-200 pb-4 text-lg font-semibold text-slate-950">
                Thao tác
              </h2>
              <div className="mt-6 space-y-4">
                <button
                  className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-sky-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-800"
                  type="button"
                >
                  <SendHorizonal className="size-5" />
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

function RequiredMark() {
  return <span className="text-red-500">*</span>;
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

function TextInput({
  icon: Icon,
  label,
  placeholder,
  required,
}: {
  icon?: ComponentType<{ className?: string }>;
  label: string;
  placeholder: string;
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
        <input
          className={[
            "h-12 w-full rounded-lg border border-slate-200 bg-white pr-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10",
            Icon ? "pl-12" : "pl-4",
          ].join(" ")}
          placeholder={placeholder}
          type="text"
        />
      </span>
    </label>
  );
}

function SelectField({
  label,
  options,
  required,
}: {
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
        <select
          className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-11 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
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

function DateField({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label} {required ? <RequiredMark /> : null}
      </span>
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
