import { ChevronRight, Edit3, Fuel, Timer, Truck } from "lucide-react";

import {
  Card,
  PagePad,
  PrimaryButton,
  SecondaryButton,
} from "../../_components/ui";

const specs = [
  ["Công suất", "110 kW"],
  ["Trọng lượng", "20 Tấn"],
  ["Dung tích gầu", "0.8 m³"],
  ["Động cơ", "Komatsu SAA6D107E-1"],
  ["Kích thước (D x R x C)", "9,425 x 2,800 x 3,040 mm"],
];

const basicInfo = [
  ["Thương hiệu", "Komatsu"],
  ["Model", "PC200-8"],
  ["Năm sản xuất", "2019"],
  ["Ngày nhập", "15/03/2020"],
];

const excavatorImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC68h0cKSLsNjOwACYgXqr7yRKmMV5YlaQ6l2-OM2giS9tdxdwiDCdXT8Jvv24WqNxFGB2PTZJ2xoEMJyQlxcuc_8dRkB2M9bvP5KRg5i3F-_Uak3uf3sMY-7Jv7aFm8Myy9QeF4lQSj2pI-sPoLH-vIouP6BqpfYbehzLWoAqDaZeTSD06MAyecqeeQ9LqLsLqM-xnJVebP97X2M5dlrQfCNe9IfvGYfNKXdh-9ezFDIVdQbc5Zuqv4vtrCAAaMcfMCcbkaE4ywZc";

export default function MachineryDetailPage() {
  return (
    <PagePad>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Chi tiết thiết bị
            </h1>
            <p className="mt-2 text-slate-600">
              Máy xúc Komatsu PC200 • EXC-200-A1
            </p>
          </div>
          <div className="flex gap-2">
            <SecondaryButton>
              <Edit3 className="size-4" />
              Sửa
            </SecondaryButton>
            <PrimaryButton className="h-11 px-6">
              <Truck className="size-4" />
              Điều phối
            </PrimaryButton>
          </div>
        </div>

        <div className="mb-8 flex gap-8 overflow-x-auto border-b border-slate-200">
          {["Tổng quan", "Thông số kỹ thuật", "Lịch sử bảo trì", "Lịch sử điều phối"].map(
            (tab, index) => (
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
            ),
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="overflow-hidden rounded-3xl">
            <div
              aria-label="Máy xúc Komatsu PC200"
              className="h-48 bg-slate-200 bg-cover bg-center"
              role="img"
              style={{ backgroundImage: `url(${excavatorImage})` }}
            />
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
              </div>
            </div>
          </Card>

          <div className="space-y-6 lg:col-span-2">
            <div className="grid gap-6 sm:grid-cols-2">
              <QuickStat
                icon={Timer}
                label="Số giờ hoạt động"
                suffix="giờ"
                tone="sky"
                value="4,520"
              />
              <QuickStat
                icon={Fuel}
                label="Mức tiêu hao (TB)"
                suffix="L/h"
                tone="amber"
                value="18.5"
              />
            </div>

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
              <div className="grid gap-4 sm:grid-cols-3">
                {specs.map(([label, value], index) => (
                  <div
                    className={[
                      "rounded-xl border border-slate-100 bg-slate-50 p-4",
                      index === 4 ? "sm:col-span-2" : "",
                    ].join(" ")}
                    key={label}
                  >
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-bold text-slate-950">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
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
            tone === "sky" ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-600",
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
