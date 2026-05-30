"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Plus,
  RotateCcw,
  Search,
  Users,
  Shield,
  UserCheck,
  Wrench,
  Loader2,
  Trash2,
  X,
  AlertTriangle,
  Mail,
  User,
  Key,
  ShieldAlert,
} from "lucide-react";

import { Card, PagePad, PrimaryButton, SecondaryButton, MetricCard } from "../_components/ui";
import { getStoredUser, usersApi, type UserItem, type UserRole, type UserStatus } from "@/lib/api";

const ROLE_MAP: Record<UserRole, { label: string; className: string; initialsClass: string }> = {
  ADMIN: {
    label: "Quản trị viên",
    className: "bg-sky-50 text-sky-700 border-sky-200",
    initialsClass: "bg-sky-100 text-sky-800 border-sky-300",
  },
  DISPATCHER: {
    label: "Điều phối viên",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    initialsClass: "bg-purple-100 text-purple-800 border-purple-300",
  },
  TECHNICIAN: {
    label: "Kỹ thuật viên",
    className: "bg-teal-50 text-teal-700 border-teal-200",
    initialsClass: "bg-teal-100 text-teal-800 border-teal-300",
  },
};

const STATUS_MAP: Record<UserStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Hoạt động", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  DISABLED: { label: "Vô hiệu", className: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default function AccountsPage() {
  const router = useRouter();
  const [currentUser] = useState(() => getStoredUser());
  const [authorized, setAuthorized] = useState(false);

  // Stats State
  const [stats, setStats] = useState({ total: 0, admin: 0, dispatcher: 0, technician: 0 });

  // Users List Query State
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "">("");
  const [filterStatus, setFilterStatus] = useState<UserStatus | "">("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Drawer Create/Edit Form State
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  const [formFullName, setFormFullName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("DISPATCHER");
  const [formStatus, setFormStatus] = useState<UserStatus>("ACTIVE");

  const [drawerError, setDrawerError] = useState("");
  const [drawerSubmitting, setDrawerSubmitting] = useState(false);

  // Delete Confirmation Dialog State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Check role authorization on mount
  useEffect(() => {
    if (!currentUser || currentUser.role !== "ADMIN") {
      router.replace("/403");
    } else {
      setAuthorized(true);
    }
  }, [currentUser, router]);

  // Debounce search keyword changes (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search query
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Users & Stats Function
  const fetchStats = useCallback(async () => {
    try {
      const data = await usersApi.getStats();
      setStats(data);
    } catch (err) {
      console.error("Lỗi khi tải thông số thống kê:", err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await usersApi.getAll({
        page,
        limit,
        search: debouncedSearch,
        role: filterRole || undefined,
        status: filterStatus || undefined,
      });
      setUsersList(response.data);
      setTotalPages(response.totalPages);
      setTotalCount(response.total);
    } catch (err: any) {
      setError(err?.message || "Lỗi không xác định khi tải danh sách.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filterRole, filterStatus]);

  // Load Initial Data
  useEffect(() => {
    if (authorized) {
      fetchUsers();
      fetchStats();
    }
  }, [authorized, fetchUsers, fetchStats]);

  // Handle Form Drawer Opens
  const handleOpenCreateDrawer = () => {
    setDrawerMode("create");
    setEditingUser(null);
    setFormFullName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("DISPATCHER");
    setFormStatus("ACTIVE");
    setDrawerError("");
    setShowDrawer(true);
  };

  const handleOpenEditDrawer = (user: UserItem) => {
    setDrawerMode("edit");
    setEditingUser(user);
    setFormFullName(user.fullName);
    setFormEmail(user.email);
    setFormPassword(""); // Leave password blank on edit
    setFormRole(user.role);
    setFormStatus(user.status);
    setDrawerError("");
    setShowDrawer(true);
  };

  // Submit Drawer Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setDrawerError("");

    if (!formFullName.trim()) {
      setDrawerError("Họ tên không được để trống.");
      return;
    }
    if (!formEmail.trim() || !/\S+@\S+\.\S+/.test(formEmail)) {
      setDrawerError("Email không hợp lệ.");
      return;
    }
    if (drawerMode === "create" && formPassword.length < 6) {
      setDrawerError("Mật khẩu tạo mới phải từ 6 ký tự trở lên.");
      return;
    }
    if (drawerMode === "edit" && formPassword && formPassword.length < 6) {
      setDrawerError("Mật khẩu cập nhật phải từ 6 ký tự trở lên.");
      return;
    }

    setDrawerSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        fullName: formFullName.trim(),
        email: formEmail.trim().toLowerCase(),
        role: formRole,
        status: formStatus,
      };

      if (formPassword) {
        payload.password = formPassword;
      }

      if (drawerMode === "create") {
        await usersApi.create(payload);
      } else if (editingUser) {
        await usersApi.update(editingUser.id, payload);
      }

      setShowDrawer(false);
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      setDrawerError(err?.message || "Đã xảy ra lỗi khi lưu thông tin.");
    } finally {
      setDrawerSubmitting(false);
    }
  };

  // Handle Delete Button Click
  const handleDeleteClick = (user: UserItem) => {
    setDeletingUser(user);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  // Confirm Delete Operation
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setDeleteError("");
    setDeleteSubmitting(true);

    try {
      await usersApi.remove(deletingUser.id);
      setShowDeleteModal(false);
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      setDeleteError(err?.message || "Lỗi khi xóa tài khoản.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Helper to extract Name Initials for Badges
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Format Dates Nicely
  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return "Chưa từng đăng nhập";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
          <p className="text-sm font-semibold">Đang xác thực quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <PagePad>
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Quản lý tài khoản
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Quản lý phân quyền vai trò nhân viên và phân phối tài khoản trong hệ thống.
            </p>
          </div>
          <PrimaryButton onClick={handleOpenCreateDrawer} className="h-11 px-6 bg-sky-600 hover:bg-sky-700">
            <Plus className="size-4" />
            Thêm tài khoản
          </PrimaryButton>
        </div>

        {/* Stats Section Cards */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Tổng nhân sự"
            value={String(stats.total)}
            note="Toàn bộ tài khoản hiện hoạt"
            icon={Users}
            tone="sky"
          />
          <MetricCard
            label="Quản trị viên"
            value={String(stats.admin)}
            note="Tài khoản quản lý hệ thống"
            icon={Shield}
            tone="red"
          />
          <MetricCard
            label="Điều phối viên"
            value={String(stats.dispatcher)}
            note="Phiếu điều phối máy móc"
            icon={UserCheck}
            tone="sky"
          />
          <MetricCard
            label="Kỹ thuật viên"
            value={String(stats.technician)}
            note="Nhật ký bảo dưỡng thiết bị"
            icon={Wrench}
            tone="green"
          />
        </div>

        {/* Main List Section */}
        <Card className="overflow-hidden">
          {/* Query Filter Area */}
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <select
                value={filterRole}
                onChange={(e) => { setFilterRole(e.target.value as UserRole | ""); setPage(1); }}
                className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 cursor-pointer"
              >
                <option value="">Tất cả vai trò</option>
                <option value="ADMIN">Quản trị viên (ADMIN)</option>
                <option value="DISPATCHER">Điều phối viên (DISPATCHER)</option>
                <option value="TECHNICIAN">Kỹ thuật viên (TECHNICIAN)</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value as UserStatus | ""); setPage(1); }}
                className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 cursor-pointer"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="DISABLED">Vô hiệu</option>
              </select>

              {(filterRole || filterStatus || search) && (
                <button
                  onClick={() => {
                    setFilterRole("");
                    setFilterStatus("");
                    setSearch("");
                    setPage(1);
                  }}
                  className="inline-flex h-10 items-center justify-center gap-1 px-3 text-xs font-bold text-slate-500 hover:text-sky-700 transition"
                >
                  <RotateCcw className="size-3.5" />
                  Đặt lại bộ lọc
                </button>
              )}
            </div>

            <label className="relative block w-full md:w-80">
              <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                placeholder="Tìm theo tên hoặc email..."
                type="text"
              />
            </label>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Nhân sự</th>
                  <th className="px-5 py-4">Vai trò</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4">Lần đăng nhập cuối</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {loading ? (
                  // Loading skeletons rows
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr className="animate-pulse" key={idx}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-slate-200" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 rounded bg-slate-200" />
                            <div className="h-3 w-44 rounded bg-slate-200" />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-5 w-20 rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-5 w-16 rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-28 rounded bg-slate-200" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex gap-2 h-8 w-16 bg-slate-200 rounded justify-end" />
                      </td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-rose-500 font-semibold bg-white">
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="size-8" />
                        <p>{error}</p>
                        <SecondaryButton onClick={fetchUsers} className="mt-2 text-xs h-8">Thử lại</SecondaryButton>
                      </div>
                    </td>
                  </tr>
                ) : usersList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-slate-500 bg-white">
                      Không tìm thấy tài khoản nào phù hợp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  usersList.map((user) => {
                    const isSelf = user.id === currentUser?.id;
                    return (
                      <tr
                        className={[
                          "transition hover:bg-slate-50 bg-white",
                          user.status === "DISABLED" ? "opacity-75" : "",
                        ].join(" ")}
                        key={user.id}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={[
                              "grid size-10 place-items-center rounded-full border text-sm font-bold shadow-sm select-none shrink-0",
                              ROLE_MAP[user.role]?.initialsClass || "bg-indigo-50 text-slate-600 border-slate-200"
                            ].join(" ")}>
                              {getInitials(user.fullName)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-950 flex items-center gap-1.5">
                                {user.fullName}
                                {isSelf && (
                                  <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                                    Tôi
                                  </span>
                                )}
                              </p>
                              <p className="text-xs font-semibold text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${ROLE_MAP[user.role]?.className}`}>
                            {ROLE_MAP[user.role]?.label || user.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${STATUS_MAP[user.status]?.className}`}>
                            <span className="size-1.5 rounded-full bg-current" />
                            {STATUS_MAP[user.status]?.label || user.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-bold text-slate-500">
                          {formatLastLogin(user.lastLoginAt)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditDrawer(user)}
                              className="inline-grid size-8 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-sky-300 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                              title="Chỉnh sửa tài khoản"
                            >
                              <Edit3 className="size-4" />
                            </button>
                            <button
                              disabled={isSelf}
                              onClick={() => handleDeleteClick(user)}
                              className={[
                                "inline-grid size-8 place-items-center rounded-md border text-slate-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500",
                                isSelf
                                  ? "opacity-40 border-slate-100 bg-slate-50 cursor-not-allowed"
                                  : "border-slate-200 bg-white hover:border-rose-300 hover:text-rose-600"
                              ].join(" ")}
                              title={isSelf ? "Không thể xóa chính tài khoản của bạn" : "Xóa tài khoản"}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && !error && usersList.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-4">
              <p className="text-sm font-semibold text-slate-500">
                Hiển thị <span className="text-slate-900 font-bold">{(page - 1) * limit + 1}</span> -{" "}
                <span className="text-slate-900 font-bold">{Math.min(page * limit, totalCount)}</span> trong tổng số{" "}
                <span className="text-slate-900 font-bold">{totalCount}</span> tài khoản
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className={[
                    "grid size-10 place-items-center rounded border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                    page === 1
                      ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  ].join(" ")}
                  disabled={page === 1}
                  type="button"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className={[
                    "grid size-10 place-items-center rounded border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                    page === totalPages
                      ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  ].join(" ")}
                  disabled={page === totalPages}
                  type="button"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Form Slide-over Drawer Panel */}
      {showDrawer && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setShowDrawer(false)}
        />
      )}
      <div className={[
        "fixed right-0 top-0 bottom-0 z-50 w-full max-w-md border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out md:max-w-lg flex flex-col",
        showDrawer ? "translate-x-0" : "translate-x-full"
      ].join(" ")}>
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {drawerMode === "create" ? "Thêm tài khoản mới" : "Chỉnh sửa tài khoản"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {drawerMode === "create"
                ? "Tạo mới tài khoản nhân viên và chỉ định quyền hạn hệ thống."
                : "Chỉnh sửa thông tin cơ bản và thay đổi vai trò hoặc trạng thái."}
            </p>
          </div>
          <button
            onClick={() => setShowDrawer(false)}
            className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Drawer Form Body */}
        <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-5">
          {drawerError && (
            <div className="flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
              <ShieldAlert className="size-5 shrink-0 text-red-600" />
              <div>{drawerError}</div>
            </div>
          )}

          {/* Full Name field */}
          <div className="space-y-1.5">
            <label htmlFor="form-fullName" className="text-sm font-bold text-slate-700 flex items-center gap-1">
              <User className="size-4 text-slate-400" />
              Họ và tên
            </label>
            <input
              id="form-fullName"
              type="text"
              value={formFullName}
              onChange={(e) => setFormFullName(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 placeholder:text-slate-400"
              placeholder="VD: Nguyễn Văn A"
              required
            />
          </div>

          {/* Email field */}
          <div className="space-y-1.5">
            <label htmlFor="form-email" className="text-sm font-bold text-slate-700 flex items-center gap-1">
              <Mail className="size-4 text-slate-400" />
              Địa chỉ Email
            </label>
            <input
              id="form-email"
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 placeholder:text-slate-400"
              placeholder="VD: nhanvien@gnoudcrm.vn"
              required
              disabled={drawerMode === "edit"} // Don't allow editing email once created (often a good standard, or editable)
            />
            {drawerMode === "edit" && (
              <p className="text-[10px] font-semibold text-slate-500">
                Email không thể chỉnh sửa để bảo toàn tính xác thực giao dịch tài khoản.
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label htmlFor="form-password" className="text-sm font-bold text-slate-700 flex items-center gap-1">
              <Key className="size-4 text-slate-400" />
              Mật khẩu
            </label>
            <input
              id="form-password"
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 placeholder:text-slate-400"
              placeholder={drawerMode === "create" ? "Nhập mật khẩu (tối thiểu 6 ký tự)" : "Để trống nếu không muốn đổi mật khẩu"}
              required={drawerMode === "create"}
            />
            {drawerMode === "edit" && (
              <p className="text-[10px] font-semibold text-slate-500">
                Chỉ nhập trường này nếu bạn muốn thay đổi mật khẩu đăng nhập cho người dùng này.
              </p>
            )}
          </div>

          {/* Role select field */}
          <div className="space-y-1.5">
            <label htmlFor="form-role" className="text-sm font-bold text-slate-700 flex items-center gap-1">
              <Shield className="size-4 text-slate-400" />
              Vai trò & Quyền hạn
            </label>
            {editingUser?.role === "ADMIN" ? (
              <div className="h-11 w-full rounded-lg border border-slate-100 bg-slate-50 px-3.5 flex items-center text-sm font-semibold text-slate-500 select-none">
                ADMIN - Quản trị viên (Không thể thay đổi)
              </div>
            ) : (
              <select
                id="form-role"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as UserRole)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 cursor-pointer"
              >
                <option value="DISPATCHER">DISPATCHER - Điều phối viên</option>
                <option value="TECHNICIAN">TECHNICIAN - Kỹ thuật viên</option>
              </select>
            )}
          </div>

          {/* Status field */}
          <div className="space-y-1.5">
            <label htmlFor="form-status" className="text-sm font-bold text-slate-700 flex items-center gap-1">
              <UserCheck className="size-4 text-slate-400" />
              Trạng thái hoạt động
            </label>
            {editingUser?.id === currentUser?.id ? (
              <div className="h-11 w-full rounded-lg border border-slate-100 bg-slate-50 px-3.5 flex items-center text-sm font-semibold text-slate-500 select-none">
                ACTIVE - Hoạt động bình thường (Không thể thay đổi)
              </div>
            ) : (
              <select
                id="form-status"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as UserStatus)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE - Hoạt động bình thường</option>
                <option value="DISABLED">DISABLED - Vô hiệu hóa truy cập</option>
              </select>
            )}
          </div>
        </form>

        {/* Drawer Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-150 flex items-center justify-end gap-3 bg-slate-50/50">
          <SecondaryButton onClick={() => setShowDrawer(false)} disabled={drawerSubmitting}>
            Hủy bỏ
          </SecondaryButton>
          <PrimaryButton
            onClick={handleSubmitForm}
            disabled={drawerSubmitting}
            className="bg-sky-600 hover:bg-sky-700"
          >
            {drawerSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu tài khoản"
            )}
          </PrimaryButton>
        </div>
      </div>

      {/* Elegant Delete Confirmation Modal */}
      {showDeleteModal && deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <span className="grid size-12 place-items-center rounded-full bg-rose-50 text-rose-600 shrink-0">
                <Trash2 className="size-6" />
              </span>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900">
                  Xóa tài khoản nhân viên?
                </h3>
                <p className="text-sm text-slate-500">
                  Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của{" "}
                  <strong className="text-slate-950 font-bold">{deletingUser.fullName}</strong> (
                  <span className="text-slate-800 break-all">{deletingUser.email}</span>)? Hành động này không thể hoàn tác và tài khoản này sẽ bị xóa khỏi toàn bộ hệ thống đăng nhập.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="mt-4 flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-800">
                <AlertTriangle className="size-4.5 shrink-0 text-red-600" />
                <div>{deleteError}</div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <SecondaryButton onClick={() => setShowDeleteModal(false)} disabled={deleteSubmitting}>
                Bỏ qua
              </SecondaryButton>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteSubmitting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {deleteSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  "Đồng ý xóa"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </PagePad>
  );
}
