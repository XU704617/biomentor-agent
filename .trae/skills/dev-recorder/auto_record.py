#!/usr/bin/env python3
import os
import json
import datetime
from pathlib import Path
from typing import List, Dict, Any


class AutoRecorder:
    def __init__(self, log_dir: str = "work_logs"):
        self.project_root = Path(__file__).parent.parent.parent.parent
        self.log_dir = self.project_root / log_dir
        self.log_dir.mkdir(exist_ok=True)

    def scan_all_changes(self) -> Dict[str, Any]:
        result = {
            "scan_time": datetime.datetime.now().isoformat(),
            "project": str(self.project_root),
            "statistics": {},
            "recent_files": [],
            "frontend_files": [],
            "backend_files": [],
            "docs_files": []
        }

        all_files = []

        for dir_path, dir_names, file_names in os.walk(self.project_root):
            if any(skip in dir_path for skip in ['.git', 'node_modules', '__pycache__', '.next', 'venv', '.venv']):
                continue

            rel_dir = Path(dir_path).relative_to(self.project_root)
            if str(rel_dir).startswith('.trae'):
                continue

            for file_name in file_names:
                if file_name.endswith(('.pyc', '.pyo', '.pyd', '.log')):
                    continue

                file_path = Path(dir_path) / file_name
                rel_path = str(file_path.relative_to(self.project_root))

                try:
                    stat = file_path.stat()
                    modified = datetime.datetime.fromtimestamp(stat.st_mtime)

                    file_info = {
                        "path": rel_path,
                        "size": stat.st_size,
                        "modified": modified.isoformat()
                    }

                    all_files.append(file_info)

                    if rel_path.startswith('frontend'):
                        result["frontend_files"].append(file_info)
                    elif rel_path.startswith('backend'):
                        result["backend_files"].append(file_info)
                    elif rel_path.startswith('docs'):
                        result["docs_files"].append(file_info)

                except (OSError, PermissionError):
                    continue

        result["recent_files"] = sorted(all_files, key=lambda x: x["modified"], reverse=True)[:20]

        ext_counts = {}
        for f in all_files:
            ext = Path(f["path"]).suffix or "no_ext"
            ext_counts[ext] = ext_counts.get(ext, 0) + 1

        result["statistics"] = {
            "total_files": len(all_files),
            "frontend_count": len(result["frontend_files"]),
            "backend_count": len(result["backend_files"]),
            "docs_count": len(result["docs_files"]),
            "by_extension": ext_counts
        }

        return result

    def save_snapshot(self, snapshot_name: str = "") -> str:
        if not snapshot_name:
            snapshot_name = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

        snapshot = self.scan_all_changes()
        snapshot["snapshot_name"] = snapshot_name

        snapshot_file = self.log_dir / f"snapshot_{snapshot_name}.json"
        with open(snapshot_file, 'w', encoding='utf-8') as f:
            json.dump(snapshot, f, ensure_ascii=False, indent=2)

        return str(snapshot_file)

    def compare_snapshots(self, old_snapshot: Dict, new_snapshot: Dict) -> Dict:
        old_files = {f["path"]: f for f in old_snapshot.get("recent_files", [])}
        new_files = {f["path"]: f for f in new_snapshot.get("recent_files", [])}

        added = [path for path in new_files if path not in old_files]
        removed = [path for path in old_files if path not in new_files]
        modified = [
            path for path in new_files
            if path in old_files and new_files[path]["modified"] != old_files[path]["modified"]
        ]

        return {
            "added": added,
            "removed": removed,
            "modified": modified,
            "summary": f"新增{len(added)}个，删除{len(removed)}个，修改{len(modified)}个"
        }


def main():
    import sys

    recorder = AutoRecorder()

    if len(sys.argv) > 1 and sys.argv[1] == "compare":
        print("请提供两个快照文件名进行对比")
        print("用法: python auto_record.py compare <snapshot1> <snapshot2>")
        sys.exit(1)

    print("正在扫描项目变更...")
    snapshot = recorder.scan_all_changes()

    print(f"\n=== 项目快照 ===")
    print(f"扫描时间: {snapshot['scan_time']}")
    print(f"\n文件统计:")
    print(f"  总文件数: {snapshot['statistics']['total_files']}")
    print(f"  前端文件: {snapshot['statistics']['frontend_count']}")
    print(f"  后端文件: {snapshot['statistics']['backend_count']}")
    print(f"  文档文件: {snapshot['statistics']['docs_count']}")

    print(f"\n按扩展名统计:")
    for ext, count in sorted(snapshot["statistics"]["by_extension"].items(), key=lambda x: -x[1])[:10]:
        print(f"  {ext}: {count}")

    print(f"\n最近修改的文件 (前10个):")
    for f in snapshot["recent_files"][:10]:
        print(f"  {f['path']} - {f['modified'][:19]}")

    snapshot_file = recorder.save_snapshot()
    print(f"\n快照已保存到: {snapshot_file}")


if __name__ == "__main__":
    main()
