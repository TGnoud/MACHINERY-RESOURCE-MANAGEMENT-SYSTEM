"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Download,
  Eye,
  Filter,
  MoreVertical,
  Pencil,
  Plus,
} from "lucide-react";

import { Card, PagePad } from "../_components/ui";
import { getStoredUser } from "@/lib/api";

const equipmentRows = [
  {
    name: "Máy xúc Komatsu PC200",
    serial: "EXC-200-A1",
    category: "Máy xúc",
    manufacturer: "Komatsu",
    year: "2019",
    location: "Kho trung tâm",
    status: "Sẵn sàng",
    statusClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC68h0cKSLsNjOwACYgXqr7yRKmMV5YlaQ6l2-OM2giS9tdxdwiDCdXT8Jvv24WqNxFGB2PTZJ2xoEMJyQlxcuc_8dRkB2M9bvP5KRg5i3F-_Uak3uf3sMY-7Jv7aFm8Myy9QeF4lQSj2pI-sPoLH-vIouP6BqpfYbehzLWoAqDaZeTSD06MAyecqeeQ9LqLsLqM-xnJVebP97X2M5dlrQfCNe9IfvGYfNKXdh-9ezFDIVdQbc5Zuqv4vtrCAAaMcfMCcbkaE4ywZc",
  },
  {
    name: "Cẩu tháp Liebherr 112 EC-H",
    serial: "EQ-CT-04",
    category: "Cần cẩu",
    manufacturer: "Liebherr",
    year: "2020",
    location: "Dự án VSIP",
    status: "Đang thuê",
    statusClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    name: "Xe nâng Komatsu 3 Tấn",
    serial: "EQ-XN-12",
    category: "Xe nâng",
    manufacturer: "Komatsu",
    year: "2021",
    location: "Kho Cát Lái",
    status: "Đang thuê",
    statusClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    name: "Xe tải Hino 15 Tấn",
    serial: "EQ-XT-08",
    category: "Xe tải",
    manufacturer: "Hino",
    year: "2018",
    location: "Công trường Thủ Thiêm",
    status: "Bảo trì",
    statusClass: "bg-red-50 text-red-700 border-red-200",
  },
  {
    name: "Máy phát điện Cummins",
    serial: "EQ-MP-07",
    category: "Máy phát",
    manufacturer: "Cummins",
    year: "2022",
    location: "Kho dự phòng",
    status: "Sẵn sàng",
    statusClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
];

const filters = ["Tất cả", "Sẵn sàng", "Đang thuê", "Bảo trì"];

export default function MachineryPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <PagePad>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Quản lý thiết bị
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Danh sách máy móc và trạng thái vận hành hiện tại.
            </p>
          </div>
          {user?.role === "ADMIN" && (
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-sky-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-800"
              href="/machinery/new"
            >
              <Plus className="size-4" />
              Thêm thiết bị
            </Link>
          )}
        </div>

        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter, index) => (
                <button
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-semibold transition",
                    index === 0
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                  key={filter}
                  type="button"
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50">
                <Filter className="size-4" />
              </button>
              <button className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50">
                <Download className="size-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-4">Ảnh</th>
                  <th className="px-4 py-4">Tên thiết bị</th>
                  <th className="px-4 py-4">Số serial</th>
                  <th className="px-4 py-4">Danh mục</th>
                  <th className="px-4 py-4">Hãng sản xuất</th>
                  <th className="px-4 py-4">Năm mua</th>
                  <th className="px-4 py-4">Vị trí</th>
                  <th className="px-4 py-4">Trạng thái</th>
                  <th className="px-4 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {equipmentRows.map((row, index) => (
                  <tr className="transition hover:bg-slate-50" key={row.serial}>
                    <td className="px-4 py-4">
                      {row.image ? (
                        <div
                          aria-label={row.name}
                          className="size-12 rounded-lg bg-cover bg-center"
                          role="img"
                          style={{ backgroundImage: `url(${row.image})` }}
                        />
                      ) : (
                        <div className="grid size-12 place-items-center rounded-lg bg-sky-50 text-sky-700">
                          {index + 1}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        className="font-bold text-slate-950 transition hover:text-sky-700"
                        href="/machinery/exc-200-a1"
                      >
                        {row.name}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        Mã: {row.serial}
                      </p>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-700">
                      {row.serial}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{row.category}</td>
                    <td className="px-4 py-4 text-slate-600">
                      {row.manufacturer}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{row.year}</td>
                    <td className="px-4 py-4 text-slate-600">{row.location}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${row.statusClass}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1 text-slate-500">
                        <Link
                          className="grid size-8 place-items-center rounded-md transition hover:bg-slate-100 hover:text-sky-700"
                          href="/machinery/exc-200-a1"
                        >
                          <Eye className="size-4" />
                        </Link>
                        {user?.role === "ADMIN" && (
                          <button className="grid size-8 place-items-center rounded-md transition hover:bg-slate-100 hover:text-sky-700">
                            <Pencil className="size-4" />
                          </button>
                        )}
                        <button className="grid size-8 place-items-center rounded-md transition hover:bg-slate-100">
                          <MoreVertical className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Hiển thị 1 đến 5 trong số 120 kết quả
            </p>
            <div className="flex items-center gap-1">
              {["1", "2", "3", "..."].map((page, index) => (
                <button
                  className={[
                    "grid size-9 place-items-center rounded text-sm font-semibold",
                    index === 0
                      ? "bg-sky-500 text-white"
                      : "text-slate-600 hover:bg-white",
                  ].join(" ")}
                  key={page + index}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </PagePad>
  );
}
