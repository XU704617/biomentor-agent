---
name: "dev-recorder"
description: "Automatically records development activities including file changes, command executions, and task progress. Invoke when starting development work or when user asks to track development progress."
---

# Dev Recorder | 自动开发记录器

此技能在开发期间**自动记录**所有活动，包括：
- 文件变更（创建、修改、删除）
- 命令执行记录
- 任务进度和步骤
- 遇到的问题及解决方案
- 代码片段和输出结果

## 功能特性

- **自动追踪**：实时监控项目文件变更
- **命令记录**：自动记录所有执行的命令
- **结构化日志**：JSON 格式便于分析和可视化
- **时间戳追踪**：每个操作都有精确时间记录
- **工作阶段**：支持 start/end 工作阶段管理

## 使用方法

### 1. 开始记录开发会话

```bash
python .trae/skills/dev-recorder/recorder.py start "任务名称"
```

### 2. 记录单个活动（自动检测）

```bash
# 记录文件变更
python .trae/skills/dev-recorder/recorder.py track file "创建新组件" "frontend/components/NewComponent.tsx"

# 记录命令执行
python .trae/skills/dev-recorder/recorder.py track command "npm run build"

# 记录问题
python .trae/skills/dev-recorder/recorder.py track issue "类型错误" "修复了接口定义"

# 记录数据/结果
python .trae/skills/dev-recorder/recorder.py track data "测试结果" '{"passed": 15, "failed": 2}'
```

### 3. 结束记录并生成报告

```bash
python .trae/skills/dev-recorder/recorder.py end "完成功能A开发"
```

### 4. 查看历史记录

```bash
python .trae/skills/dev-recorder/recorder.py list
python .trae/skills/dev-recorder/recorder.py view "日志文件名"
```

### 5. 自动扫描项目变更

```bash
python .trae/skills/dev-recorder/recorder.py scan
```

## 输出格式

日志文件保存在 `work_logs/` 目录，JSON 结构如下：

```json
{
  "session_id": "20250526_210000_session",
  "task_name": "功能开发",
  "start_time": "2025-05-26T21:00:00",
  "end_time": "2025-05-26T22:30:00",
  "duration_seconds": 5400,
  "activities": [
    {
      "timestamp": "2025-05-26T21:05:00",
      "type": "file_created",
      "description": "创建新组件",
      "path": "frontend/components/NewComponent.tsx"
    },
    {
      "timestamp": "2025-05-26T21:10:00",
      "type": "command",
      "description": "运行构建",
      "command": "npm run build",
      "result": "success"
    }
  ]
}
```

## 自动记录建议

在 `.trae/skills/dev-recorder/` 目录下的 `auto_record.py` 可配置为定时扫描项目，快速记录当前状态：

```bash
python .trae/skills/dev-recorder/auto_record.py
```

## 触发条件

- 用户开始新的开发任务时
- 用户要求"记录开发过程"时
- 完成阶段性工作需要记录时
- 需要回顾开发历史时
