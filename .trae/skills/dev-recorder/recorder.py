#!/usr/bin/env python3
import os
import json
import datetime
import uuid
import sys
from pathlib import Path
from typing import Optional, List, Dict, Any


class DevRecorder:
    def __init__(self, log_dir: str = "work_logs"):
        self.project_root = Path(__file__).parent.parent.parent.parent
        self.log_dir = self.project_root / log_dir
        self.log_dir.mkdir(exist_ok=True)
        self.current_session: Optional[Dict] = None
        self._session_marker = self.log_dir / ".current_session"

    def _get_session_file(self, session_id: str) -> Path:
        return self.log_dir / f"{session_id}.json"

    def _load_current_session(self) -> bool:
        if self._session_marker.exists():
            try:
                with open(self._session_marker, 'r', encoding='utf-8') as f:
                    session_id = f.read().strip()
                session_file = self._get_session_file(session_id)
                if session_file.exists():
                    with open(session_file, 'r', encoding='utf-8') as f:
                        self.current_session = json.load(f)
                    return True
            except Exception:
                pass
        self.current_session = None
        return False

    def _save_current_session_marker(self):
        if self.current_session:
            with open(self._session_marker, 'w', encoding='utf-8') as f:
                f.write(self.current_session["session_id"])
        elif self._session_marker.exists():
            self._session_marker.unlink()

    def start_session(self, task_name: str, description: str = "") -> str:
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        session_id = f"{timestamp}_{uuid.uuid4().hex[:8]}"

        self.current_session = {
            "session_id": session_id,
            "task_name": task_name,
            "description": description,
            "start_time": datetime.datetime.now().isoformat(),
            "activities": []
        }

        self._save_session()
        self._save_current_session_marker()
        print(f"[DevRecorder] 开始记录: {task_name}")
        print(f"[DevRecorder] Session ID: {session_id}")
        return session_id

    def track_activity(self, activity_type: str, description: str, detail: Any = None):
        self._load_current_session()
        if not self.current_session:
            print("[DevRecorder] 错误: 没有活动的开发会话，请先调用 start_session()")
            return

        activity = {
            "timestamp": datetime.datetime.now().isoformat(),
            "type": activity_type,
            "description": description
        }

        if detail:
            activity["detail"] = detail

        self.current_session["activities"].append(activity)
        self._save_session()
        self._save_current_session_marker()
        print(f"[DevRecorder] 已记录: [{activity_type}] {description}")

    def end_session(self, result: str = "") -> Dict:
        self._load_current_session()
        if not self.current_session:
            print("[DevRecorder] 错误: 没有活动的开发会话")
            return {}

        self.current_session["end_time"] = datetime.datetime.now().isoformat()
        self.current_session["result"] = result

        start = datetime.datetime.fromisoformat(self.current_session["start_time"])
        end = datetime.datetime.fromisoformat(self.current_session["end_time"])
        duration = end - start
        self.current_session["duration_seconds"] = duration.total_seconds()

        self._save_session()

        print(f"[DevRecorder] 会话已结束: {self.current_session['task_name']}")
        print(f"[DevRecorder] 总耗时: {duration}")
        print(f"[DevRecorder] 记录的活动数: {len(self.current_session['activities'])}")

        summary = self.current_session.copy()
        self.current_session = None
        self._save_current_session_marker()
        return summary

    def _save_session(self):
        if self.current_session:
            session_file = self._get_session_file(self.current_session["session_id"])
            with open(session_file, 'w', encoding='utf-8') as f:
                json.dump(self.current_session, f, ensure_ascii=False, indent=2)

    def list_sessions(self) -> List[Dict]:
        sessions = []
        for log_file in sorted(self.log_dir.glob("*.json"), reverse=True):
            try:
                with open(log_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    sessions.append({
                        "file": log_file.name,
                        "session_id": data.get("session_id", ""),
                        "task": data.get("task_name", ""),
                        "start": data.get("start_time", ""),
                        "end": data.get("end_time", "进行中"),
                        "duration": data.get("duration_seconds", 0),
                        "activities_count": len(data.get("activities", []))
                    })
            except (json.JSONDecodeError, KeyError):
                continue
        return sessions

    def view_session(self, session_id: str) -> Optional[Dict]:
        session_file = self._get_session_file(session_id)
        if not session_file.exists():
            for f in self.log_dir.glob("*.json"):
                if session_id in f.name:
                    session_file = f
                    break

        if session_file.exists():
            with open(session_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None

    def scan_project_changes(self) -> List[Dict]:
        changes = []
        gitkeep_file = self.project_root / "frontend" / "data" / ".gitkeep"

        if gitkeep_file.exists():
            changes.append({
                "type": "file_exists",
                "path": str(gitkeep_file.relative_to(self.project_root)),
                "note": "data目录存在"
            })

        frontend_dir = self.project_root / "frontend"
        backend_dir = self.project_root / "backend"

        for dir_path, dir_names, file_names in os.walk(self.project_root):
            if '.git' in dir_path or 'node_modules' in dir_path or '__pycache__' in dir_path:
                continue

            rel_dir = Path(dir_path).relative_to(self.project_root)
            if str(rel_dir).startswith('.trae'):
                continue

            for file_name in file_names:
                if file_name.endswith(('.pyc', '.pyo', '.pyd')):
                    continue
                file_path = Path(dir_path) / file_name
                rel_path = file_path.relative_to(self.project_root)

                stat = file_path.stat()
                modified = datetime.datetime.fromtimestamp(stat.st_mtime)

                changes.append({
                    "type": "file",
                    "path": str(rel_path),
                    "modified": modified.isoformat(),
                    "size": stat.st_size
                })

        return changes


def print_usage():
    print("""
DevRecorder - 自动开发记录器

用法:
    python recorder.py <command> [args]

命令:
    start <任务名称> [描述]    - 开始新的记录会话
    track <类型> <描述> [详情] - 记录单个活动
    end [结果]                 - 结束当前会话并生成报告
    list                       - 列出所有记录会话
    view <session_id>          - 查看指定会话详情
    scan                       - 扫描项目当前状态

活动类型 (track 命令):
    file_created   - 文件创建
    file_modified  - 文件修改
    file_deleted    - 文件删除
    command         - 命令执行
    issue           - 问题记录
    solution        - 解决方案
    data            - 数据/结果
    note            - 笔记
    milestone       - 里程碑

示例:
    python recorder.py start "开发用户登录功能"
    python recorder.py track file_created "创建用户模型" "backend/app/models/user.py"
    python recorder.py track command "运行测试" "pytest tests/"
    python recorder.py track issue "遇到类型错误" "已修复接口定义"
    python recorder.py end "功能开发完成"
    python recorder.py list
    python recorder.py scan
""")


def main():
    if len(sys.argv) < 2:
        print_usage()
        sys.exit(1)

    recorder = DevRecorder()
    command = sys.argv[1].lower()

    if command == "start":
        if len(sys.argv) < 3:
            print("错误: 请提供任务名称")
            sys.exit(1)
        task_name = sys.argv[2]
        description = sys.argv[3] if len(sys.argv) > 3 else ""
        recorder.start_session(task_name, description)

    elif command == "track":
        if len(sys.argv) < 4:
            print("错误: 请提供活动类型和描述")
            sys.exit(1)
        activity_type = sys.argv[2]
        description = sys.argv[3]
        detail = sys.argv[4] if len(sys.argv) > 4 else None
        recorder.track_activity(activity_type, description, detail)

    elif command == "end":
        result = sys.argv[2] if len(sys.argv) > 2 else ""
        recorder.end_session(result)

    elif command == "list":
        sessions = recorder.list_sessions()
        if not sessions:
            print("没有找到任何记录会话")
        else:
            print("\n=== 开发记录会话列表 ===")
            print(f"{'任务名':<30} {'开始时间':<25} {'时长':<12} {'活动数':<8}")
            print("-" * 80)
            for s in sessions:
                duration_min = s["duration"] / 60 if s["duration"] > 0 else 0
                print(f"{s['task']:<30} {s['start']:<25} {duration_min:.1f}分钟 {s['activities_count']:<8}")

    elif command == "view":
        if len(sys.argv) < 3:
            print("错误: 请提供 session_id")
            sys.exit(1)
        session = recorder.view_session(sys.argv[2])
        if session:
            print(json.dumps(session, ensure_ascii=False, indent=2))
        else:
            print(f"未找到会话: {sys.argv[2]}")

    elif command == "scan":
        changes = recorder.scan_project_changes()
        print(f"\n=== 项目当前状态 (共 {len(changes)} 个文件) ===")
        for c in changes[:50]:
            print(f"  {c['type']}: {c['path']}")

    elif command in ["help", "--help", "-h"]:
        print_usage()

    else:
        print(f"未知命令: {command}")
        print_usage()
        sys.exit(1)


if __name__ == "__main__":
    main()
