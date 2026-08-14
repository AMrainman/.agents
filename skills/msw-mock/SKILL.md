---
description: "根据 Torna 接口文档自动生成 MSW（Mock Service Worker）handler 代码"
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, AskUserQuestion
---

# MSW Mock 自动生成

根据 Torna 接口文档自动生成 MSW（Mock Service Worker）handler 代码。

## 触发方式

- **Slash command**：`/msw-mock <接口名称关键词或 docId>`
- **自然语言**：
  - `"帮我生成 [接口名] 的 mock"`
  - `"给这个接口写个 msw handler"`
  - `"根据接口文档生成 mock"`

## 使用流程

### 1. 解析用户意图

从用户输入中提取以下信息：

- **接口关键词**：如 `"用户列表"`、`"获取订单详情"`
- **docId**（可选）：Torna 接口文档 ID，如 `P811Eg8q`

若用户提供了 docId，直接进入步骤 3；否则进入步骤 2。

### 2. 检索接口文档

调用 `torna_search_docs`，传入用户提供的接口名称关键词。

- 搜索结果为空 → 提示用户确认接口名称，或提供 docId
- 搜索结果唯一 → 直接进入步骤 3
- 搜索结果多个 → 列出前 5 个候选接口（名称 + URL），让用户选择

### 3. 读取接口详情

调用 `torna_get_doc_detail`，获取接口完整定义：

- HTTP 方法（GET / POST / PUT / DELETE）
- 请求 URL
- 请求参数（用于生成注释，不写入 handler body）
- 响应参数结构（核心，用于生成 mock 数据）
- 示例值（优先使用）

### 4. 生成 MSW Handler

根据接口详情生成 MSW v2 TypeScript handler 代码。

#### 4.1 响应结构推断

读取响应参数的根结构，判断属于以下哪种：

| 结构类型 | 特征                                      | 处理方式                                 |
| -------- | ----------------------------------------- | ---------------------------------------- |
| 标准包装 | 含 `code` + `data` + `message`            | 保留包装，只填充 `data`                  |
| 分页包装 | 含 `page` + `pageSize` + `total` + `list` | 补充分页字段，填充 `list`                |
| 纯数组   | 根类型为 `array`                          | 直接返回数组作为 `data`                  |
| 纯对象   | 根类型为 `object`                         | 直接返回对象作为 `data`                  |
| 无定义   | 响应参数为空                              | 生成 `{}` 并标注 `// TODO: 补充响应字段` |

#### 4.2 Mock 数据生成

按以下优先级为每个响应字段生成值：（如果项目架构没有使用 TypeScript ，则跳过3）

1. **示例值**（Torna 文档中的 `example`）→ 直接用
2. **字段名语义识别** → 按字段名模式推断真实感数据（详见 `references/semantic-defaults.md`）
3. **类型默认值** → 按字段类型生成（详见 `references/type-mapping.md`）

数组类型字段生成 1~2 个元素，元素递归按上述规则生成。

#### 4.3 代码模板

生成的 handler 必须遵循 `references/msw-template.md` 中的格式规范。

### 5. 定位 mock 目录

按以下优先级查找项目中的 mock 目录：

1. `src/mocks/handlers/`
2. `mock/`
3. `__mocks__/`

未找到时，询问用户是否创建 `src/mocks/handlers/`。

### 6. 写入文件

#### 6.1 确定目标文件

- 按接口 URL 前缀推断业务模块名，如 `/api/users` → `user.ts`
- 若目标文件已存在 → 追加 handler 到数组末尾，不覆盖已有内容
- 若目标文件不存在 → 新建文件

#### 6.2 写入操作

使用 `Write` 或 `Edit` 工具写入文件。写入后向用户返回：

- 生成/修改的文件路径
- 接口 URL 和 HTTP 方法
- 生成的 mock 数据摘要（前 3 个字段）
- 注意事项（如是否有 `// TODO` 待补充字段）

## 边界处理

| 场景                          | 处理策略                                                |
| ----------------------------- | ------------------------------------------------------- |
| 接口为文件上传/下载           | 暂不支持，提示用户手动编写                              |
| 接口为 GraphQL                | 暂不支持，仅支持 REST API                               |
| 同一 URL 已有 handler         | 追加而非覆盖，或在追加前询问用户                        |
| 响应参数嵌套层级过深（>5 层） | 第 5 层及以下用 `{ /* ... */ }` 占位，避免生成过大 mock |

## 依赖

- 项目或全局已配置 Torna MCP（`torna_search_docs`、`torna_get_doc_detail`）
- 项目已安装 MSW v2
