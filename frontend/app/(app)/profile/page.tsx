"use client";

import { Camera, Save, ShieldCheck, X } from "lucide-react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  ActivityTimeline,
  Card,
  PagePad,
  PrimaryButton,
  SecondaryButton,
} from "../_components/ui";
import {
  ApiError,
  profileApi,
  updateStoredUser,
  uploadImage,
  type ProfileActivity,
  type ProfileUser,
  type UserRole,
  type UserStatus,
} from "@/lib/api";

type TimelineItem = {
  title: string;
  body: string;
  time: string;
  tone: "sky" | "green" | "slate" | "amber";
};

function ProfileContent() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(
    () => searchParams.get("showActivities") === "true",
  );
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [activities, setActivities] = useState<ProfileActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      setError("");

      try {
        const [profileResult, activityResult] = await Promise.all([
          profileApi.getMe(),
          profileApi.getActivities(50),
        ]);

        setProfile(profileResult);
        setFullName(profileResult.fullName);
        setActivities(activityResult);
        updateStoredUser(profileResult);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "Không thể tải dữ liệu hồ sơ.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, []);

  const visibleActivities = useMemo(
    () => activities.slice(0, 5).map(toTimelineItem),
    [activities],
  );

  async function handleSave() {
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const updated = await profileApi.update({ fullName: fullName.trim() });
      setProfile(updated);
      setFullName(updated.fullName);
      updateStoredUser(updated);
      setMessage("Đã lưu thay đổi hồ sơ.");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Không thể lưu hồ sơ.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAvatarChange(file: File | undefined) {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setError("");
    setMessage("");

    try {
      const { url } = await uploadImage(file);
      const updated = await profileApi.update({ avatarUrl: url });
      setProfile(updated);
      updateStoredUser(updated);
      setMessage("Đã cập nhật ảnh đại diện.");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Không thể tải ảnh đại diện.",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const initials = getInitials(profile?.fullName || fullName || "User");

  return (
    <PagePad>
      <div className="mx-auto max-w-6xl">
        <div className="mb-7">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Cài đặt tài khoản
          </h1>
          <p className="mt-2 text-slate-600">
            Quản lý thông tin cá nhân và hoạt động gần đây của bạn trong hệ thống.
          </p>
        </div>

        {error ? (
          <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="mb-5 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <Card className="p-6">
              <SectionTitle>Thông tin cá nhân</SectionTitle>
              {isLoading ? (
                <ProfileSkeleton />
              ) : (
                <>
                  <div className="flex flex-col gap-8 md:flex-row">
                    <div className="flex w-full flex-col items-center gap-3 md:w-40">
                      <div className="relative">
                        <div
                          aria-label="Ảnh đại diện"
                          className="grid size-32 place-items-center overflow-hidden rounded-full border-4 border-slate-100 bg-sky-50 bg-cover bg-center text-3xl font-bold text-sky-800 shadow-sm"
                          role="img"
                          style={
                            profile?.avatarUrl
                              ? {
                                  backgroundImage: `url(${profile.avatarUrl})`,
                                }
                              : undefined
                          }
                        >
                          {profile?.avatarUrl ? null : initials}
                        </div>
                        <button
                          className="absolute bottom-1 right-1 grid size-10 place-items-center rounded-full bg-sky-500 text-white shadow-lg transition hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                          type="button"
                        >
                          <Camera className="size-5" />
                        </button>
                        <input
                          accept="image/*"
                          className="hidden"
                          onChange={(event) =>
                            handleAvatarChange(event.target.files?.[0])
                          }
                          ref={fileInputRef}
                          type="file"
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-500">
                        {isUploading ? "Đang tải ảnh..." : "Ảnh đại diện"}
                      </span>
                    </div>

                    <div className="grid flex-1 gap-4 md:grid-cols-2">
                      <TextInput
                        label="Họ và tên"
                        onChange={setFullName}
                        value={fullName}
                      />
                      <TextInput
                        disabled
                        label="Email"
                        value={profile?.email ?? ""}
                      />
                      <TextInput
                        disabled
                        label="Trạng thái"
                        value={statusLabel(profile?.status)}
                      />
                      <TextInput
                        disabled
                        label="Vai trò"
                        value={roleLabel(profile?.role)}
                      />
                      <div className="flex items-center gap-2 md:col-span-2">
                        <span className="text-sm font-bold text-slate-700">
                          Vai trò:
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                          <ShieldCheck className="size-4" />
                          {roleLabel(profile?.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end border-t border-slate-200 pt-4">
                    <PrimaryButton
                      disabled={isSaving || !fullName.trim()}
                      onClick={handleSave}
                    >
                      <Save className="size-4" />
                      {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    </PrimaryButton>
                  </div>
                </>
              )}
            </Card>
          </div>

          <Card className="p-6 lg:col-span-4">
            <SectionTitle>Hoạt động gần đây</SectionTitle>
            {isLoading ? (
              <ActivitySkeleton />
            ) : visibleActivities.length > 0 ? (
              <div className="space-y-5">
                <ActivityTimeline items={visibleActivities} />
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="h-10 w-full rounded-lg text-sm font-bold text-sky-700 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1"
                  type="button"
                >
                  Xem tất cả
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Chưa có hoạt động gần đây trong database.
              </p>
            )}
          </Card>
        </div>
      </div>

      <ActivityHistoryModal
        activities={activities}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </PagePad>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm font-semibold text-slate-500">
          Đang tải cấu hình...
        </div>
      }
    >
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
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-bold text-slate-700">{label}</span>
      <input
        className={[
          "h-10 w-full rounded-lg border px-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10",
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
            : "border-slate-300 bg-slate-50",
        ].join(" ")}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={!onChange}
        type="text"
        value={value}
      />
    </label>
  );
}

function ActivityHistoryModal({
  activities,
  isOpen,
  onClose,
}: {
  activities: ProfileActivity[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" || activity.type === selectedType;

    return matchesSearch && matchesType;
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex h-full max-h-[600px] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-950">
              Lịch sử hoạt động
            </h3>
            <p className="text-xs text-slate-500">
              Hoạt động bảo trì và điều phối liên quan đến tài khoản của bạn.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 border-b border-slate-100 p-6">
          <input
            type="text"
            placeholder="Tìm kiếm hoạt động..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          />
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", name: "Tất cả" },
              { id: "maintenance", name: "Bảo trì" },
              { id: "assignment", name: "Điều phối" },
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
                type="button"
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredActivities.length > 0 ? (
            <ActivityTimeline items={filteredActivities.map(toTimelineItem)} />
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

function toTimelineItem(activity: ProfileActivity): TimelineItem {
  return {
    title: `${activity.id} · ${activity.title}`,
    body: `${activity.description} (${activity.status})`,
    time: activity.time,
    tone:
      activity.status === "Hoàn thành"
        ? "green"
        : activity.type === "maintenance"
          ? "amber"
          : "sky",
  };
}

function roleLabel(role?: UserRole) {
  const labels: Record<UserRole, string> = {
    ADMIN: "Quản trị viên",
    TECHNICIAN: "Kỹ thuật viên",
    DISPATCHER: "Điều phối viên",
  };

  return role ? labels[role] : "Chưa xác định";
}

function statusLabel(status?: UserStatus) {
  const labels: Record<UserStatus, string> = {
    ACTIVE: "Đang hoạt động",
    DISABLED: "Đã vô hiệu hóa",
  };

  return status ? labels[status] : "Chưa xác định";
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <div className="mx-auto size-32 animate-pulse rounded-full bg-slate-100 md:mx-0" />
      <div className="grid flex-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="space-y-2" key={index}>
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-10 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="space-y-2" key={index}>
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
