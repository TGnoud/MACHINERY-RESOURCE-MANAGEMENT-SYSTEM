"use client";

import { Camera, LockKeyhole, Save, ShieldCheck } from "lucide-react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import {
  ActivityTimeline,
  Card,
  PagePad,
  PrimaryButton,
  SecondaryButton,
} from "../_components/ui";

const profileAvatar =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDdtkL-nRyK57BVT5EoPPdiaMcWaxTfuNB9W32aSEMs6US1rPyKmVYcVmpHlxAfuif4Z2V0efEB3L8ZHsXRHZCuKOzCC367Hz2cIEo30eIPBryGOKGfPRHlxWQdQYaxAU2OhvIHjb8YWES4OjAectGfIZhXDSBgtIIg_XXT0Dph2POe3xDn_hY-2vWwl2AbUVBJSczop6DAfY0fJ-6oe30O4eRwr7gwU3xzN8hmPcunlSa7s10uVqn27ZoKcNmeHJSveftTI-aXgKo";

const profileActivities = [
  {
    title: "Cập nhật trạng thái máy",
    body: "Máy xúc EX-200 chuyển sang Bảo trì.",
    time: "10:30, Hôm nay",
    tone: "sky" as const,
  },
  {
    title: "Đăng nhập hệ thống",
    body: "Từ IP: 192.168.1.105",
    time: "08:00, Hôm nay",
    tone: "amber" as const,
  },
  {
    title: "Phê duyệt báo cáo",
    body: "Báo cáo kiểm kê kho bãi tuần 42.",
    time: "16:45, Hôm qua",
    tone: "green" as const,
  },
];

const allActivities = [
  {
    title: "Cập nhật trạng thái máy",
    body: "Máy xúc EX-200 chuyển sang Bảo trì.",
    time: "10:30, Hôm nay",
    tone: "sky" as const,
    type: "maintenance",
  },
  {
    title: "Đăng nhập hệ thống",
    body: "Từ IP: 192.168.1.105",
    time: "08:00, Hôm nay",
    tone: "amber" as const,
    type: "security",
  },
  {
    title: "Phê duyệt báo cáo",
    body: "Báo cáo kiểm kê kho bãi tuần 42.",
    time: "16:45, Hôm qua",
    tone: "green" as const,
    type: "document",
  },
  {
    title: "Tạo phiếu bảo trì mới",
    body: "Trần Văn B đã tạo phiếu MT-2023-089 cho Máy xúc Komatsu.",
    time: "24/10/2023",
    tone: "sky" as const,
    type: "maintenance",
  },
  {
    title: "Bàn giao thiết bị",
    body: "Lê Văn C đã bàn giao Máy phát điện Cummins cho đội công trình số 2.",
    time: "23/10/2023",
    tone: "sky" as const,
    type: "assignment",
  },
  {
    title: "Cập nhật tài khoản",
    body: "Admin đã cập nhật quyền hạn cho tài khoản Kỹ thuật viên Nguyễn Văn B.",
    time: "22/10/2023",
    tone: "slate" as const,
    type: "security",
  },
  {
    title: "Cảnh báo quá nhiệt",
    body: "Thiết bị Máy xúc Komatsu phát hiện cảnh báo nhiệt độ động cơ vượt ngưỡng.",
    time: "20/10/2023",
    tone: "amber" as const,
    type: "maintenance",
  },
  {
    title: "Đăng xuất hệ thống",
    body: "Nguyễn Văn A đăng xuất khỏi phiên làm việc.",
    time: "19/10/2023",
    tone: "slate" as const,
    type: "security",
  },
  {
    title: "Thêm thiết bị mới",
    body: "Đã thêm Xe tải Isuzu QKR vào hệ thống quản lý tài sản.",
    time: "18/10/2023",
    tone: "green" as const,
    type: "machinery",
  },
];

function ProfileContent() {
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(
    () => searchParams.get("showActivities") === "true",
  );

  return (
    <PagePad>
      <div className="mx-auto max-w-6xl">
        <div className="mb-7">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Cài đặt tài khoản
          </h1>
          <p className="mt-2 text-slate-600">
            Quản lý thông tin cá nhân và bảo mật của bạn trong hệ thống.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <Card className="p-6">
              <SectionTitle>Thông tin cá nhân</SectionTitle>
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex w-full flex-col items-center gap-3 md:w-40">
                  <div className="relative">
                    <div
                      aria-label="Ảnh đại diện"
                      className="size-32 overflow-hidden rounded-full border-4 border-slate-100 bg-cover bg-center shadow-sm"
                      role="img"
                      style={{ backgroundImage: `url(${profileAvatar})` }}
                    />
                    <button
                      className="absolute bottom-1 right-1 grid size-10 place-items-center rounded-full bg-sky-500 text-white shadow-lg transition hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1"
                      type="button"
                    >
                      <Camera className="size-5" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-slate-500">
                    Ảnh đại diện
                  </span>
                </div>

                <div className="grid flex-1 gap-4 md:grid-cols-2">
                  <TextInput label="Họ và tên" value="Nguyễn Văn A" />
                  <TextInput label="Email" value="nguyenvana@gnoudcrm.vn" />
                  <TextInput label="Số điện thoại" value="0901234567" />
                  <TextInput disabled label="Phòng ban" value="Vận hành máy móc" />
                  <div className="flex items-center gap-2 md:col-span-2">
                    <span className="text-sm font-bold text-slate-700">Vai trò:</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                      <ShieldCheck className="size-4" />
                      Quản trị viên cấp trung
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end border-t border-slate-200 pt-4">
                <PrimaryButton>
                  <Save className="size-4" />
                  Lưu thay đổi
                </PrimaryButton>
              </div>
            </Card>

            <Card className="p-6">
              <SectionTitle>Đổi mật khẩu</SectionTitle>
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput
                  className="md:col-span-2 md:max-w-[50%]"
                  label="Mật khẩu hiện tại"
                  type="password"
                  value="••••••••"
                />
                <TextInput label="Mật khẩu mới" type="password" value="••••••••" />
                <TextInput
                  label="Xác nhận mật khẩu mới"
                  type="password"
                  value="••••••••"
                />
              </div>
              <div className="mt-6 flex justify-end border-t border-slate-200 pt-4">
                <SecondaryButton>
                  <LockKeyhole className="size-4" />
                  Cập nhật mật khẩu
                </SecondaryButton>
              </div>
            </Card>
          </div>

          <Card className="p-6 lg:col-span-4">
            <SectionTitle>Hoạt động gần đây</SectionTitle>
            <div className="space-y-5">
              <ActivityTimeline items={profileActivities} />
              <button
                onClick={() => setIsModalOpen(true)}
                className="h-10 w-full rounded-lg text-sm font-bold text-sky-700 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1"
                type="button"
              >
                Xem tất cả
              </button>
            </div>
          </Card>
        </div>
      </div>

      <ActivityHistoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </PagePad>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-semibold text-slate-500">Đang tải cấu hình…</div>}>
      <ProfileContent />
    </Suspense>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="mb-6 border-b border-slate-200 pb-3">
      <h2 className="text-xl font-bold uppercase tracking-wide text-slate-600">
        {children}
      </h2>
    </div>
  );
}

function TextInput({
  label,
  value,
  disabled,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  disabled?: boolean;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="block text-sm font-bold text-slate-700">{label}</span>
      <input
        className={[
          "h-10 w-full rounded-lg border px-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10",
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
            : "border-slate-300 bg-slate-50",
        ].join(" ")}
        disabled={disabled}
        readOnly
        type={type}
        value={value}
      />
    </label>
  );
}

function ActivityHistoryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const filteredActivities = allActivities.filter((act) => {
    const matchesSearch =
      act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.body.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || act.type === selectedType;
    return matchesSearch && matchesType;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex h-full max-h-[600px] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Lịch sử hoạt động toàn bộ</h3>
            <p className="text-xs text-slate-500">Xem và tìm kiếm tất cả dấu vết hoạt động hệ thống.</p>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="border-b border-slate-100 p-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm hoạt động…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-4 pr-10 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 placeholder:text-slate-400"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", name: "Tất cả" },
              { id: "maintenance", name: "Bảo trì" },
              { id: "security", name: "Đăng nhập/Bảo mật" },
              { id: "document", name: "Tài liệu" },
              { id: "assignment", name: "Lịch trình" },
              { id: "machinery", name: "Thiết bị" },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={[
                  "h-8 rounded-full px-4 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1",
                  selectedType === type.id
                    ? "bg-sky-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                ].join(" ")}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredActivities.length > 0 ? (
            <ActivityTimeline items={filteredActivities} />
          ) : (
            <div className="py-12 text-center text-sm font-semibold text-slate-400">
              Không tìm thấy hoạt động nào phù hợp.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
