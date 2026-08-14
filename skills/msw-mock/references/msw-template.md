# MSW Handler 代码模板与格式规范

## 版本要求

- **MSW v2** 语法
- **TypeScript**（优先）或 JavaScript

## 单文件模板

```ts
// src/mocks/handlers/{module}.ts
import { http, HttpResponse } from "msw";

export const {module}Handlers = [
  http.{method}("{url}", () => {
    return HttpResponse.json({responseBody});
  }),
];
```

### 占位符说明

| 占位符           | 来源                           | 示例                           |
| ---------------- | ------------------------------ | ------------------------------ |
| `{module}`       | 接口 URL 前缀推断              | `/api/users` → `user`          |
| `{method}`       | Torna 文档中的 HTTP 方法       | `get`, `post`, `put`, `delete` |
| `{url}`          | Torna 文档中的请求 URL         | `/api/users`                   |
| `{responseBody}` | 按生成规则构造的 mock 数据对象 | 见下方示例                     |

## 追加到已有文件的格式

当目标文件已存在时，将新 handler 追加到数组末尾：

```ts
// 追加前已有内容
export const userHandlers = [
  http.get("/api/users", () => { ... }),
];

// 追加后
export const userHandlers = [
  http.get("/api/users", () => { ... }),

  // 新增：{接口描述}
  http.post("/api/users", () => {
    return HttpResponse.json({ ... });
  }),
];
```

追加时应：

- 与前一个 handler 之间保留一个空行。
- 添加一行注释说明新增接口（可选但推荐）。

## 响应体格式规范

### 标准包装结构

```ts
{
  code: 0,
  data: { /* 实际业务数据 */ },
  message: "success"
}
```

- `code` 固定为 `0`（表示成功）。
- `message` 固定为 `"success"`。
- `data` 按接口实际响应结构填充。

### 分页包装结构

```ts
{
  code: 0,
  data: {
    list: [
      { /* 元素 1 */ },
      { /* 元素 2 */ }
    ],
    page: 1,
    pageSize: 10,
    total: 100
  },
  message: "success"
}
```

- `list` 为实际数据数组。
- `page`、`pageSize`、`total` 按语义规则生成。

### 纯数组 / 纯对象

若接口未使用包装结构，直接返回业务数据：

```ts
// 纯数组
return HttpResponse.json([{ id: 1, name: "mock_name" }]);

// 纯对象
return HttpResponse.json({ id: 1, name: "mock_name" });
```

## 代码风格

- 使用**双引号**字符串（与 Prettier 默认一致）。
- 缩进为 **2 个空格**。
- 尾部逗号（trailing comma）启用。
- 箭头函数简写（单行无花括号仅在极其简单时使用，mock handler 统一使用花括号）。
- 导入语句使用 `"msw"` 包名。

## 注释规范

- 无响应参数文档时，在 `data` 内生成 `// TODO: 补充响应字段`。
- 追加 handler 时，可在上方添加 `// 新增：{接口名称}` 注释。
- 不要生成无意义的注释（如 `// mock data`）。

## 完整示例

```ts
// src/mocks/handlers/user.ts
import { http, HttpResponse } from "msw";

export const userHandlers = [
  http.get("/api/users", () => {
    return HttpResponse.json({
      code: 0,
      data: {
        list: [
          {
            id: 1,
            name: "mock_name",
            email: "test@example.com",
            avatar: "https://example.com/avatar.png",
            createdAt: "2024-01-01T00:00:00Z",
            status: "active",
          },
          {
            id: 2,
            name: "mock_name_2",
            email: "test2@example.com",
            avatar: "https://example.com/avatar.png",
            createdAt: "2024-01-01T00:00:00Z",
            status: "active",
          },
        ],
        page: 1,
        pageSize: 10,
        total: 100,
      },
      message: "success",
    });
  }),

  http.get("/api/users/:id", () => {
    return HttpResponse.json({
      code: 0,
      data: {
        id: 1,
        name: "mock_name",
        email: "test@example.com",
        phone: "13800138000",
        address: "北京市朝阳区 Mock 街道 1 号",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-06-01T12:00:00Z",
      },
      message: "success",
    });
  }),
];
```
