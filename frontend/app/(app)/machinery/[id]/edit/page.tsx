"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ImagePlus,
  Info,
  Loader2,
  LocateFixed,
  Plus,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";

import { Card, PagePad, PrimaryButton, SecondaryButton } from "../../../_components/ui";
import {
  getStoredUser,
  machineryApi,
  categoryApi,
  uploadImage,
  type CategoryItem,
  type MachineryStatus,
} from "@/lib/api";

const STATUS_OPTIONS: { label: string; value: MachineryStatus }[] = [
  { label: "Sẵn sàng", value: "AVAILABLE" },
  { label: "Đang thuê", value: "RENTED" },
  { label: "Bảo trì", value: "MAINTENANCE" },
];

export default function MachineryEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isAllowed] = useState(() => {
    const user = getStoredUser();
    return !user || user.role === "ADMIN";
  });

  // Categories from API
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // Form fields
  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [purchaseYear, setPurchaseYear] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  const [fuelConsumption, setFuelConsumption] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<MachineryStatus>("AVAILABLE");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAllowed) {
      router.replace("/403");
    }
  }, [isAllowed, router]);

  // Fetch data on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [categoriesData, machineryData] = await Promise.all([
          categoryApi.getAll(),
          machineryApi.getById(id),
        ]);

        setCategories(categoriesData);

        // Populate fields
        setName(machineryData.name || "");
        setSerialNumber(machineryData.serialNumber || "");
        setManufacturer(machineryData.manufacturer || "");
        setPurchaseYear(machineryData.purchaseYear ? String(machineryData.purchaseYear) : "");
        setOperatingHours(machineryData.operatingHours ? String(machineryData.operatingHours) : "0");
        setFuelConsumption(machineryData.fuelConsumption ? String(machineryData.fuelConsumption) : "0");
        setLocation(machineryData.location || "");
        setStatus(machineryData.status || "AVAILABLE");
        setImageUrl(machineryData.imageUrl || "");
        
        if (machineryData.category) {
          setCategoryId(typeof machineryData.category === "object" ? machineryData.category._id : machineryData.category);
        }

        // Set specs array
        if (machineryData.specs) {
          const specList = Object.entries(machineryData.specs).map(([k, v]) => ({
            key: k,
            value: String(v),
          }));
          setSpecs(specList.length > 0 ? specList : [{ key: "", value: "" }]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải dữ liệu thiết bị.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (isAllowed) {
      loadData();
    }
  }, [id, isAllowed]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const res = await uploadImage(file);
      setImageUrl(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải lên hình ảnh.");
    } finally {
      setUploading(false);
    }
  };

  const addSpecRow = () => {
    setSpecs((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeSpecRow = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: "key" | "value", val: string) => {
    setSpecs((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: val } : s)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Tên thiết bị là bắt buộc.");
      return;
    }

    if (!serialNumber.trim()) {
      setError("Số serial là bắt buộc.");
      return;
    }

    setSaving(true);

    // Build specs object from rows
    const specsObj: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specsObj[s.key.trim()] = s.value.trim();
      }
    });

    const payload: Record<string, unknown> = {
      name: name.trim(),
      serialNumber: serialNumber.trim(),
      status,
      operatingHours: operatingHours ? Number(operatingHours) : 0,
      fuelConsumption: fuelConsumption ? Number(fuelConsumption) : 0,
      specs: specsObj,
      imageUrl: imageUrl.trim() || undefined,
    };

    if (manufacturer.trim()) payload.manufacturer = manufacturer.trim();
    if (purchaseYear) payload.purchaseYear = Number(purchaseYear);
    if (location.trim()) payload.location = location.trim();
    payload.category = categoryId || null;

    try {
      await machineryApi.update(id, payload);
      router.push(`/machinery/${id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật thiết bị.",
      );
      setSaving(false);
    }
  };

  if (!isAllowed) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  if (loading) {
    return (
      <PagePad>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-sky-700" />
        </div>
      </PagePad>
    );
  }

  return (
    <PagePad>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Chỉnh sửa thiết bị
            </h1>
            <p className="mt-2 text-slate-600">
              Cập nhật thông tin chi tiết và thông số kỹ thuật cho thiết bị &ldquo;{name}&rdquo;.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              href={`/machinery/${id}`}
            >
              Hủy
            </Link>
            <PrimaryButton
              className="h-11 px-6"
              disabled={saving}
              onClick={handleSubmit}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </PrimaryButton>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="grid gap-6 lg:grid-cols-12" onSubmit={handleSubmit}>
          {/* Left column */}
          <div className="space-y-6 lg:col-span-8">
            <Card className="p-6">
              <CardTitle icon={Info} title="Thông tin cơ bản" />
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  className="md:col-span-2"
                  label="Tên thiết bị *"
                  onChange={setName}
                  placeholder="Nhập tên máy móc..."
                  value={name}
                />
                <Field
                  label="Số Serial *"
                  onChange={setSerialNumber}
                  placeholder="Ví dụ: SN-2023-XYZ"
                  value={serialNumber}
                />
                <Field
                  label="Nhà sản xuất"
                  onChange={setManufacturer}
                  placeholder="Ví dụ: Komatsu, Caterpillar..."
                  value={manufacturer}
                />
                <Field
                  label="Năm mua"
                  onChange={setPurchaseYear}
                  placeholder="YYYY"
                  type="number"
                  value={purchaseYear}
                />
                <Field
                  label="Số giờ hoạt động"
                  onChange={setOperatingHours}
                  placeholder="0"
                  type="number"
                  value={operatingHours}
                />
                <Field
                  label="Mức tiêu hao nhiên liệu (L/h)"
                  onChange={setFuelConsumption}
                  placeholder="0"
                  type="number"
                  value={fuelConsumption}
                />
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
                  onClick={addSpecRow}
                  type="button"
                >
                  <Plus className="size-4" />
                  Thêm dòng
                </button>
              </div>
              <div className="space-y-3">
                {specs.map((spec, index) => (
                  <SpecRow
                    key={index}
                    name={spec.key}
                    onChangeName={(val) => updateSpec(index, "key", val)}
                    onChangeValue={(val) => updateSpec(index, "value", val)}
                    onRemove={() => removeSpecRow(index)}
                    value={spec.value}
                  />
                ))}
                {specs.length === 0 && (
                  <p className="py-4 text-center text-sm text-slate-500">
                    Chưa có thông số. Nhấn &ldquo;Thêm dòng&rdquo; để bắt đầu.
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6 lg:col-span-4">
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-bold text-slate-950">
                Hình ảnh thiết bị
              </h2>
              <input
                type="file"
                id="image-upload-input"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={uploading}
              />
              {uploading ? (
                <div className="flex aspect-video flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/50 p-6 text-center animate-pulse">
                  <Loader2 className="size-8 animate-spin text-sky-700" />
                  <p className="mt-3 text-sm font-bold text-sky-700">Đang tải ảnh lên Cloudinary...</p>
                </div>
              ) : imageUrl ? (
                <div className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => document.getElementById("image-upload-input")?.click()}
                      className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-lg hover:bg-slate-100 transition"
                    >
                      Thay đổi ảnh
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById("image-upload-input")?.click()}
                  className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:bg-slate-100 focus-within:ring-2 focus-within:ring-sky-500"
                >
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
              )}
            </Card>

            <Card className="p-6">
              <h2 className="mb-5 text-xl font-bold text-slate-950">
                Phân loại & Trạng thái
              </h2>
              <div className="space-y-4">
                <SelectField
                  label="Danh mục *"
                  onChange={setCategoryId}
                  options={[
                    { label: "Chọn danh mục...", value: "" },
                    ...categories.map((c) => ({
                      label: c.name,
                      value: c._id,
                    })),
                  ]}
                  value={categoryId}
                />
                <SelectField
                  label="Trạng thái hiện tại"
                  onChange={(val) => setStatus(val as MachineryStatus)}
                  options={STATUS_OPTIONS.map((o) => ({
                    label: o.label,
                    value: o.value,
                  }))}
                  value={status}
                />
                <label className="block space-y-1.5">
                  <span className="text-sm font-bold text-slate-600">
                    Vị trí hiện tại
                  </span>
                  <span className="relative block">
                    <LocateFixed className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Nhập kho bãi hoặc công trường..."
                      type="text"
                      value={location}
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

/* ─── Sub-components ────────────────────────────────────────────── */

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
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  className?: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <input
        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function SpecRow({
  name,
  value,
  onChangeName,
  onChangeValue,
  onRemove,
}: {
  name: string;
  value: string;
  onChangeName: (val: string) => void;
  onChangeValue: (val: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
        onChange={(e) => onChangeName(e.target.value)}
        placeholder="Tên thông số"
        type="text"
        value={name}
      />
      <input
        className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
        onChange={(e) => onChangeValue(e.target.value)}
        placeholder="Giá trị"
        type="text"
        value={value}
      />
      <button
        className="grid size-10 place-items-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        onClick={onRemove}
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
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <select
        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
