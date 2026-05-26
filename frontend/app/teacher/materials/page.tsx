"use client";

import { useState } from "react";
import {
  Search,
  Download,
  Eye,
  FileText,
  Video,
  FileSpreadsheet,
  Link2,
  Upload,
  Filter,
} from "lucide-react";
import { materials } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

const typeIcon: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-4 h-4 text-rust" />,
  video: <Video className="w-4 h-4 text-sage" />,
  ppt: <FileSpreadsheet className="w-4 h-4 text-rust" />,
  link: <Link2 className="w-4 h-4 text-amber" />,
};

const typeLabel: Record<string, string> = {
  pdf: "PDF",
  video: "视频",
  ppt: "PPT",
  link: "链接",
};

export default function MaterialsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>课程资料库</h1>
          <p>管理所有课程相关的教学资料</p>
        </div>
        <button className="btn-amber text-sm">
          <Upload className="w-4 h-4" />
          上传资料
        </button>
      </div>

      <div className="lab-card p-4 flex items-center gap-4 animate-reveal">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <input
            type="text"
            placeholder="搜索资料名称或课程..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="lab-input pl-10"
          />
        </div>
        <button className="btn-ghost">
          <Filter className="w-4 h-4" />
          筛选
        </button>
      </div>

      <div className="lab-card overflow-hidden animate-reveal">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left py-3 px-5 text-ink-faint font-medium">名称</th>
                <th className="text-left py-3 px-5 text-ink-faint font-medium">类型</th>
                <th className="text-left py-3 px-5 text-ink-faint font-medium">课程</th>
                <th className="text-left py-3 px-5 text-ink-faint font-medium hidden md:table-cell">章节</th>
                <th className="text-left py-3 px-5 text-ink-faint font-medium hidden sm:table-cell">大小</th>
                <th className="text-left py-3 px-5 text-ink-faint font-medium hidden lg:table-cell">上传日期</th>
                <th className="text-left py-3 px-5 text-ink-faint font-medium">下载</th>
                <th className="text-right py-3 px-5 text-ink-faint font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-border-subtle hover:bg-surface-field transition-colors"
                >
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2.5">
                      {typeIcon[m.type]}
                      <span className="text-ink font-medium">{m.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    <span className="badge badge-muted text-[11px]">
                      {typeLabel[m.type]}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-ink-muted">{m.course}</td>
                  <td className="py-3 px-5 text-ink-faint hidden md:table-cell">{m.chapter}</td>
                  <td className="py-3 px-5 text-ink-faint hidden sm:table-cell stat-number">{m.size}</td>
                  <td className="py-3 px-5 text-ink-faint hidden lg:table-cell stat-number">
                    {formatDate(m.uploadedAt)}
                  </td>
                  <td className="py-3 px-5 text-ink-muted stat-number">{m.downloads}次</td>
                  <td className="py-3 px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-surface-field transition-colors">
                        <Eye className="w-4 h-4 text-ink-faint" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-surface-field transition-colors">
                        <Download className="w-4 h-4 text-ink-faint" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-border-subtle flex items-center justify-between text-[12px] text-ink-faint">
          <span>共 {filtered.length} 项资料</span>
          <span className="stat-number">1-{filtered.length} / {filtered.length}</span>
        </div>
      </div>
    </div>
  );
}
