import Link from "next/link";
import {
  ImagePlus,
  Info,
  LocateFixed,
  Plus,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";

import {
  Card,
  PagePad,
  PrimaryButton,
} from "../../_components/ui";

export default function MachineryFormPage() {
  return (
    <PagePad>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Thêm/Sửa thiết bị
            </h1>
            <p className="mt-2 text-slate-600">
              Nhập thông tin chi tiết cho thiết bị công nghiệp mới hoặc cập
              nhật thông tin hiện có.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              href="/machinery"
            >
              Hủy
            </Link>
            <PrimaryButton className="h-11 px-6">
              <Save className="size-4" />
              Lưu thay đổi
            </PrimaryButton>
          </div>
        </div>

        <form className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <Card className="p-6">
              <CardTitle icon={Info} title="Thông tin cơ bản" />
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  className="md:col-span-2"
                  label="Tên thiết bị *"
                  placeholder="Nhập tên máy móc..."
                />
                <Field label="Số Serial" placeholder="Ví dụ: SN-2023-XYZ" />
                <Field
                  label="Nhà sản xuất"
                  placeholder="Ví dụ: Komatsu, Caterpillar..."
                />
                <Field label="Năm mua" placeholder="YYYY" type="number" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                  <Settings2 className="size-5 text-sky-700" />
                  <h2 className="text-2xl font-bold text-slate-950">
                    Thông số kỹ thuật
                  </h2>
                </div>
                <button
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-sky-700 transition hover:bg-sky-50"
                  type="button"
                >
                  <Plus className="size-4" />
                  Thêm dòng
                </button>
              </div>
              <div className="space-y-3">
                <SpecRow name="Công suất" value="110kW" />
                <SpecRow name="" value="" />
              </div>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-bold text-slate-950">
                Hình ảnh thiết bị
              </h2>
              <div className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:bg-slate-100">
                <div className="mb-3 grid size-12 place-items-center rounded-full bg-sky-50 text-sky-700">
                  <ImagePlus className="size-6" />
                </div>
                <p className="text-sm font-bold text-slate-950">
                  Kéo thả hình ảnh hoặc{" "}
                  <span className="text-sky-700">tải lên</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  PNG, JPG tối đa 5MB
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-5 text-xl font-bold text-slate-950">
                Phân loại & Trạng thái
              </h2>
              <div className="space-y-4">
                <SelectField
                  label="Danh mục *"
                  options={["Chọn danh mục...", "Máy xúc", "Cần cẩu", "Xe tải ben"]}
                />
                <SelectField
                  label="Trạng thái hiện tại"
                  options={[
                    "Sẵn sàng hoạt động",
                    "Đang bảo trì",
                    "Đang sử dụng",
                    "Hỏng hóc",
                  ]}
                />
                <label className="block space-y-1.5">
                  <span className="text-sm font-bold text-slate-600">
                    Vị trí hiện tại
                  </span>
                  <span className="relative block">
                    <LocateFixed className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                      placeholder="Nhập kho bãi hoặc công trường..."
                      type="text"
                    />
                  </span>
                </label>
              </div>
            </Card>
          </div>
        </form>
      </div>
    </PagePad>
  );
}

function CardTitle({
  icon: Icon,
  title,
}: {
  icon: typeof Info;
  title: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-4">
      <Icon className="size-5 text-sky-700" />
      <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  className = "",
}: {
  label: string;
  placeholder: string;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <input
        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}

function SpecRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <input
        className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
        defaultValue={name}
        placeholder="Tên thông số"
        type="text"
      />
      <input
        className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
        defaultValue={value}
        placeholder="Giá trị"
        type="text"
      />
      <button
        className="grid size-10 place-items-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        type="button"
      >
        <Trash2 className="size-5" />
      </button>
    </div>
  );
}

function SelectField({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <select className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
