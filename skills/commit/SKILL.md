---
description: "生成标准化的 git commit message"
user-invocable: true
allowed-tools: Bash, Read, AskUserQuestion
---

# Commit Message 生成器

根据可选的补充说明和当前 git 变更，自动生成规范的 commit message 并**直接提交**（无需用户确认）。提交后如存在远端仓库则推送。

## 用法

```bash
/commit [补充说明]
```

- 提供参数时，先分析参数内容（需求背景、问题描述、改动目标等），作为理解代码改动的上下文。
- 未提供参数时，直接根据代码改动生成 commit message。

**示例：**
```bash
/commit
/commit 修复登录页手机号校验不通过的问题
```

---

## 执行步骤

收到 `/commit [补充说明]` 指令后，请按以下步骤执行：

### Step 1：分析参数（如有）

- **带参数模式**：阅读并分析参数内容，提炼本次改动的背景、目标或要解决的问题，作为后续分析代码改动的参考。
  - 参数内容**仅作背景参考**，不直接作为 commit subject。
  - 若当前对话上下文已有相关信息，可与参数内容结合理解。
- **无参数模式**：跳过本步骤，直接进入 Step 2。

### Step 2：分析 git 变更

依次执行以下 bash 命令：

```bash
# 获取变更文件列表
git diff HEAD --name-status 2>/dev/null || git diff --cached --name-status

# 获取详细 diff
git diff HEAD 2>/dev/null || git diff --cached
```

分析每处改动：

- **带参数模式**：对照参数背景，判断哪些是核心改动、哪些是配套调整。
- **无参数模式**：仅根据代码变更本身，判断改动的类型与范围。

### Step 3：生成 commit message

按以下格式生成：

```
{type}: {改动总结}

- {要点1}
- {要点2}
- {要点N}
```

- `{type}` 根据改动类型自动选择：`feat` / `fix` / `refactor` / `docs` / `test` / `perf` / `style` / `chore`。
- `{改动总结}` 必须是对本次**代码改动的精炼概括**。

**写作规则：**
- 每条要点优先体现**业务价值**，其次才是技术手段
- 错误示例：「修改 UserForm.vue，添加 validatePhone 方法」
- 正确示例：「新增手机号格式校验，防止用户输入非法号码」
- 要点不超过 6 条，相似改动合并
- 全部使用中文

### Step 4：展示并直接提交

将生成的 commit message 展示给用户，然后**直接执行提交**，无需确认。

展示格式：

```
📝 生成的 Commit Message：

────────────────────────────────────────
fix: 修复手机号格式校验不通过的问题

- 新增手机号格式校验，防止用户输入非法号码
- 优化表单提交错误提示
────────────────────────────────────────
```

直接执行：

```bash
git commit -a -m "<commit_message>"
```

提交成功后运行 `git log --oneline -1` 展示提交结果。

### Step 5：是否推送

提交成功后，判断是否存在远端仓库：

- 若存在，直接推送
- 若不存在，结束流程
