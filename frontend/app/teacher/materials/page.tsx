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
  Filter,
} from "lucide-react";
import { materials } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

const typeIcon: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-4 h-4 text-danger" />,
  video: <Video className="w-4 h-4 text-purple-400" />,
  ppt: <FileSpreadsheet className="w-4 h-4 text-warning" />,
  link: <Link2 className="w-4 h-4 text-primary-light" />,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">课程资料库</h1>
          <p className="text-text-muted mt-1">管理所有课程相关的教学资料</p>
        </div>
        <button className="btn-primary text-sm">+ 上传资料</button>
      </div>

      <div className="glass-card p-4 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="搜索资料名称或课程..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm text-text-secondary hover:text-text-primary transition-colors">
          <Filter className="w-4 h-4" />
          筛选
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-3 px-4 text-text-muted font-medium">名称</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">类型</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">课程</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium hidden md:table-cell">章节</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium hidden sm:table-cell">大小</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium hidden lg:table-cell">上传日期</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">下载</th>
                <th className="text-right py-3 px-4 text-text-muted font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {typeIcon[m.type]}
                      <span className="text-text-primary font-medium">{m.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-secondary">
                      {typeLabel[m.type]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{m.course}</td>
                  <td className="py-3 px-4 text-text-muted hidden md:table-cell">{m.chapter}</td>
                  <td className="py-3 px-4 text-text-muted hidden sm:table-cell">{m.size}</td>
                  <td className="py-3 px-4 text-text-muted hidden lg:table-cell">
                    {formatDate(m.uploadedAt)}
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{m.downloads}次</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        <Eye className="w-4 h-4 text-text-muted" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        <Download className="w-4 h-4 text-text-muted" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-white/5 flex items-center justify-between text-xs text-text-muted">
          <span>共 {filtered.length} 项资料</span>
          <span>1-{filtered.length} / {filtered.length}</span>
        </div>
      </div>
    </div>
  );
}
