"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ButtonHTMLAttributes, ComponentType, ReactNode } from "react";
import { useState, useEffect, useRef } from "react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Factory,
  Grid2X2,
  Home,
  LogOut,
  Menu,
  Search,
  UserCircle,
  Users,
} from "lucide-react";
import { getStoredUser, authApi, clearAuthSession } from "@/lib/api";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  match: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Grid2X2,
    match: (pathname) => pathname === "/dashboard",
  },
  {
    label: "Máy móc",
    href: "/machinery",
    icon: Factory,
    match: (pathname) => pathname.startsWith("/machinery"),
  },
  {
    label: "Lịch trình",
    href: "/assignments",
    icon: CalendarDays,
    match: (pathname) => pathname.startsWith("/assignments"),
  },
  {
    label: "Nhật ký bảo trì",
    href: "/maintenance",
    icon: ClipboardList,
    match: (pathname) => pathname.startsWith("/maintenance"),
  },
  {
    label: "Tài khoản",
    href: "/accounts",
    icon: Users,
    match: (pathname) => pathname.startsWith("/accounts"),
  },
];

const pageMeta: Record<
  string,
  { search?: string; breadcrumbs?: string[]; disabled?: boolean; hideSearch?: boolean }
> = {
  "/dashboard": { hideSearch: true },
  "/machinery": { breadcrumbs: ["Máy móc"] },
  "/machinery/new": { breadcrumbs: ["Máy móc", "Thêm/Sửa thiết bị"] },
  "/assignments": { breadcrumbs: ["Lịch trình", "Phân bổ & Điều phối"] },
  "/assignments/new": { breadcrumbs: ["Lịch trình", "Tạo phiếu điều phối mới"] },
  "/maintenance": { breadcrumbs: ["Nhật ký bảo trì"] },
  "/maintenance/new": { breadcrumbs: ["Nhật ký bảo trì", "Tạo phiếu bảo trì"] },
  "/accounts": { search: "Tìm kiếm tài khoản…" },
  "/profile": { breadcrumbs: ["Cài đặt", "Hồ sơ cá nhân"] },
  "/403": { search: "Search…", disabled: true },
};

const avatarUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC_9N9lAiE7KfuW6gxc9WHUoqBmEI84t58qxkPf2w7rRRaL3InZJ3g0VRn7XG_1zuE588t_aBGD9BMZpfy9JZtHNduhvOVhk8_brXgobIuOPHhHiaj2lp3UTa9a7YCH3hH_n5yy8hqK_t54OyFDsylqpA-pMHX20NQocZhcge87n6Hy2IeKU2aqhxpbRhTmXIz--rsxnRlmoRjkHA9XMzjM4M1Gf1-dtKJQFhhJ6ydqFI1c-LCvfC7Lwf5MfcZ6ZY0bR2MzeVUXgGw";

const recentActivities = [
  {
    title: "Tạo phiếu bảo trì mới",
    body: "Trần Văn B đã tạo phiếu MT-2023-089 cho Máy xúc Komatsu.",
    time: "10 phút trước",
  },
  {
    title: "Cập nhật trạng thái",
    body: "Thiết bị Cần cẩu tháp Liebherr chuyển sang trạng thái Sẵn sàng.",
    time: "2 giờ trước",
  },
  {
    title: "Đăng nhập hệ thống",
    body: "Nguyễn Văn A (Admin) đăng nhập từ IP 192.168.1.45.",
    time: "08:00 AM",
  },
  {
    title: "Cảnh báo nhiên liệu",
    body: "Xe tải Isuzu QKR mức nhiên liệu dưới 15%.",
    time: "Hôm qua",
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isForbidden = pathname === "/403";
  const meta =
    pathname.startsWith("/machinery/") &&
    pathname !== "/machinery/new" &&
    !isForbidden
      ? { breadcrumbs: ["Máy móc", "Chi tiết thiết bị"] }
      : pageMeta[pathname] ?? { search: "Tìm kiếm…" };

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [user] = useState(() => getStoredUser());
  const visibleNavItems = navItems.filter((item) => {
    if (item.href === "/accounts") {
      return user?.role === "ADMIN";
    }
    return true;
  });

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    setIsProfileOpen(false);

    try {
      await authApi.logout();
    } catch {
      // Continue client-side logout even when the token is already expired.
    } finally {
      clearAuthSession();
      window.location.href = "/login";
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[280px] flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
        <Brand />
        <nav className="mt-10 flex flex-1 flex-col gap-2">
          {visibleNavItems.map((item) => (
            <SidebarLink
              key={item.label}
              item={item}
              active={item.match(pathname)}
              disabled={isForbidden}
            />
          ))}
        </nav>
      </aside>

      <header className="fixed right-0 top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur md:w-[calc(100%-280px)] md:px-6">
        <div className="flex items-center gap-3 md:hidden">
          <button
            aria-label="Mở thực đơn điều hướng"
            className="grid size-9 place-items-center rounded-lg text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
          <span className="text-lg font-bold text-sky-800">GnoudCRM</span>
        </div>

        <div className="hidden min-w-0 md:block">
          {meta.breadcrumbs ? (
            <Breadcrumbs items={meta.breadcrumbs} disabled={isForbidden} />
          ) : meta.hideSearch ? null : (
            <SearchBox
              disabled={Boolean(meta.disabled)}
              placeholder={meta.search ?? "Tìm kiếm…"}
            />
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Dropdown Container */}
          <div className="relative" ref={notificationRef}>
            <IconButton
              aria-label="Xem thông báo"
              aria-haspopup="true"
              aria-expanded={isNotificationsOpen}
              disabled={isForbidden}
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
              }}
            >
              <Bell aria-hidden="true" className="size-5" />
              {!isForbidden && (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </IconButton>

            {isNotificationsOpen && !isForbidden && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 z-50 overflow-hidden">
                <div className="border-b border-slate-100 px-4 py-3 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Thông báo gần đây</span>
                  <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full tabular-nums">4 mới</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {recentActivities.map((act, index) => (
                    <div key={index} className="px-4 py-3 hover:bg-slate-50 transition">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-slate-950">{act.title}</span>
                        <span className="text-[10px] font-semibold text-slate-500 shrink-0 tabular-nums">{act.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{act.body}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/profile?showActivities=true"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="block border-t border-slate-100 py-2.5 text-center text-xs font-bold text-sky-700 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                >
                  Xem tất cả hoạt động
                </Link>
              </div>
            )}
          </div>

          {/* User Profile Dropdown Container */}
          <div className="relative" ref={profileRef}>
            <button
              id="user-menu-button"
              aria-haspopup="true"
              aria-expanded={isProfileOpen}
              aria-label="Thực đơn người dùng"
              disabled={isForbidden}
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false);
              }}
              className={[
                "ml-1 grid size-9 place-items-center overflow-hidden rounded-full border border-slate-200 bg-sky-50 bg-cover bg-center text-sm font-bold text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1 transition hover:opacity-90",
                isForbidden ? "opacity-50 pointer-events-none" : "",
              ].join(" ")}
              style={isForbidden ? undefined : { backgroundImage: `url(${avatarUrl})` }}
            >
              {isForbidden ? (
                <UserCircle aria-hidden="true" className="size-5 text-slate-500" />
              ) : null}
            </button>

            {isProfileOpen && !isForbidden && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-xl ring-1 ring-black/5 z-50">
                <div className="border-b border-slate-100 px-4 py-2.5 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user?.fullName ?? "Nguyễn Văn A"}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 truncate mt-0.5">
                    {user?.email ?? "admin@gnoudcrm.vn"}
                  </p>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider mt-1.5 ${
                    user?.role === "ADMIN" ? "bg-sky-100 text-sky-800" :
                    user?.role === "DISPATCHER" ? "bg-purple-100 text-purple-800" :
                    "bg-teal-100 text-teal-800"
                  }`}>
                    {user?.role === "ADMIN" ? "ADMIN" :
                     user?.role === "DISPATCHER" ? "ĐIỀU PHỐI" :
                     user?.role === "TECHNICIAN" ? "KỸ THUẬT" : "ADMIN"}
                  </span>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 mt-1 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-700 focus-visible:bg-slate-50 focus-visible:text-sky-700 focus-visible:outline-none"
                >
                  <UserCircle aria-hidden="true" className="size-4 text-slate-500" />
                  Cài đặt tài khoản
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-none"
                >
                  <LogOut aria-hidden="true" className="size-4 text-red-500" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="min-h-screen pt-16 md:ml-[280px]">{children}</main>

      {!isForbidden && (
        <nav className="fixed bottom-0 left-0 z-50 grid h-16 w-full grid-cols-4 border-t border-slate-200 bg-white shadow-[0_-4px_12px_rgba(15,23,42,0.05)] md:hidden">
          {navItems.slice(0, 4).map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                className={[
                  "flex flex-col items-center justify-center gap-1 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md",
                  active ? "text-sky-700" : "text-slate-500",
                ].join(" ")}
                href={item.href}
              >
                <Icon aria-hidden="true" className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-2">
      {compact && (
        <div className="grid size-8 place-items-center rounded-md bg-sky-700 text-sm font-bold text-white">
          G
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold leading-tight text-sky-800">
          GnoudCRM
        </h1>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
          Industrial Intelligence
        </p>
      </div>
    </div>
  );
}

function SidebarLink({
  item,
  active,
  disabled,
}: {
  item: NavItem;
  active: boolean;
  disabled: boolean;
}) {
  const Icon = item.icon;
  const className = [
    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1",
    active
      ? "border-r-4 border-sky-700 bg-sky-50 text-sky-700"
      : "text-slate-600 hover:bg-slate-50 hover:text-sky-700",
    disabled ? "pointer-events-none cursor-not-allowed opacity-45" : "",
  ].join(" ");

  return (
    <Link className={className} href={disabled ? "#" : item.href}>
      <Icon aria-hidden="true" className="size-5" />
      <span>{item.label}</span>
    </Link>
  );
}

function SearchBox({
  placeholder,
  disabled,
}: {
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? "pointer-events-none opacity-50" : ""}>
      <label htmlFor="global-search" className="relative block w-64">
        <span className="sr-only">Tìm kiếm hệ thống</span>
        <Search aria-hidden="true" className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        <input
          id="global-search"
          name="search"
          autoComplete="off"
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-500/10"
          disabled={disabled}
          placeholder={placeholder}
          type="text"
        />
      </label>
    </div>
  );
}

const BREADCRUMB_MAP: Record<string, string> = {
  "Máy móc": "/machinery",
  "Lịch trình": "/assignments",
  "Nhật ký bảo trì": "/maintenance",
  "Cài đặt": "/profile",
  "Tài khoản": "/accounts",
};

function Breadcrumbs({
  items,
  disabled,
}: {
  items: string[];
  disabled?: boolean;
}) {
  const homeLink = disabled ? "#" : "/dashboard";

  return (
    <div
      className={[
        "flex items-center gap-2 text-sm font-semibold text-slate-600",
        disabled ? "opacity-50" : "",
      ].join(" ")}
    >
      <Link href={homeLink} className="hover:text-sky-700 transition">
        <Home aria-hidden="true" className="size-4" />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const href = BREADCRUMB_MAP[item];

        return (
          <span className="flex items-center gap-2" key={item}>
            <ChevronRight aria-hidden="true" className="size-4 text-slate-400" />
            {isLast || !href || disabled ? (
              <span className={isLast ? "text-sky-700" : ""}>
                {item}
              </span>
            ) : (
              <Link href={href} className="hover:text-sky-700 transition">
                {item}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

function IconButton({
  children,
  disabled,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      className={[
        "relative grid size-9 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1",
        disabled ? "pointer-events-none cursor-not-allowed opacity-50" : "",
        className,
      ].join(" ")}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}
