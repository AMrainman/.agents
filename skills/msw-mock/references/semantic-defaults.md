# 字段名语义识别规则

当 Torna 接口文档中字段没有提供 `example` 值时，按字段名模式推断具有真实感的 mock 数据。

## 身份标识类

| 字段名模式                      | 生成值                                   | 示例字段                      |
| ------------------------------- | ---------------------------------------- | ----------------------------- |
| `id` / `*Id` / `*ID`            | `1`、`1001`、`10001`                     | `userId`, `orderId`, `id`     |
| `uuid` / `*Uuid`                | `"550e8400-e29b-41d4-a716-446655440000"` | `requestUuid`                 |
| `code` / `*Code`（非业务 code） | `"ABC123"`                               | `verifyCode`, `promoCode`     |
| `token` / `*Token`              | `"mock_token_xxx"`                       | `accessToken`, `refreshToken` |

## 人名与联系方式

| 字段名模式                            | 生成值                             | 示例字段                   |
| ------------------------------------- | ---------------------------------- | -------------------------- |
| `name` / `*Name` / `title` / `*Title` | `"mock_name"`、`"Mock Name"`       | `userName`, `productTitle` |
| `nickname` / `*Nickname`              | `"mock_nickname"`                  | `userNickname`             |
| `email` / `*Email` / `mail`           | `"test@example.com"`               | `userEmail`, `contactMail` |
| `phone` / `mobile` / `tel`            | `"13800138000"`                    | `phoneNumber`, `mobile`    |
| `avatar` / `*Avatar` / `portrait`     | `"https://example.com/avatar.png"` | `userAvatar`               |

## 地址与位置

| 字段名模式                        | 生成值                          | 示例字段                         |
| --------------------------------- | ------------------------------- | -------------------------------- |
| `address` / `*Address`            | `"北京市朝阳区 Mock 街道 1 号"` | `homeAddress`, `shippingAddress` |
| `url` / `*Url` / `link` / `*Link` | `"https://example.com"`         | `detailUrl`, `shareLink`         |
| `ip` / `*Ip` / `ipAddress`        | `"192.168.1.1"`                 | `clientIp`                       |

## 时间类

| 字段名模式                                         | 生成值                   | 示例字段                  |
| -------------------------------------------------- | ------------------------ | ------------------------- |
| `createdAt` / `createTime` / `*Time` / `gmtCreate` | `"2024-01-01T00:00:00Z"` | `createdAt`, `updateTime` |
| `updatedAt` / `updateTime` / `gmtModified`         | `"2024-06-01T12:00:00Z"` | `updatedAt`, `modifyTime` |
| `date` / `*Date` / `day`                           | `"2024-01-01"`           | `startDate`, `birthday`   |
| `timestamp` / `*Timestamp`                         | `1704067200000`          | `loginTimestamp`          |

## 状态与类型

| 字段名模式                             | 生成值      | 示例字段                   |
| -------------------------------------- | ----------- | -------------------------- |
| `status` / `*Status` / `state`         | `"active"`  | `orderStatus`, `userState` |
| `type` / `*Type` / `kind` / `category` | `"default"` | `businessType`, `category` |
| `platform`                             | `"web"`     | `sourcePlatform`           |
| `channel` / `*Channel`                 | `"app"`     | `marketingChannel`         |

## 分页与数量

| 字段名模式                              | 生成值        | 示例字段                     |
| --------------------------------------- | ------------- | ---------------------------- |
| `page` / `currentPage` / `pageNo`       | `1`           | `currentPage`                |
| `pageSize` / `size` / `limit`           | `10`          | `pageSize`, `limit`          |
| `total` / `totalCount` / `totalSize`    | `100`         | `totalCount`                 |
| `count` / `*Count` / `num` / `quantity` | `1`           | `likeCount`, `stockQuantity` |
| `index` / `seq` / `sort`                | `0`、`1`、`2` | `sortIndex`                  |

## 内容类

| 字段名模式                                                        | 生成值                            | 示例字段                        |
| ----------------------------------------------------------------- | --------------------------------- | ------------------------------- |
| `content` / `*Content` / `body` / `text` / `desc` / `description` | `"This is mock content."`         | `articleContent`, `productDesc` |
| `remark` / `*Remark` / `comment` / `note`                         | `"mock remark"`                   | `adminRemark`, `customerNote`   |
| `image` / `*Image` / `pic` / `photo` / `cover`                    | `"https://example.com/image.png"` | `mainImage`, `coverPhoto`       |

## 金额与价格

| 字段名模式                                                 | 生成值            | 示例字段                   |
| ---------------------------------------------------------- | ----------------- | -------------------------- |
| `price` / `*Price` / `amount` / `*Amount` / `fee` / `cost` | `99.99`、`100.00` | `unitPrice`, `totalAmount` |
| `currency`                                                 | `"CNY"`           | `paymentCurrency`          |

## 开关与标志

| 字段名模式                                     | 生成值           | 示例字段                     |
| ---------------------------------------------- | ---------------- | ---------------------------- |
| `is*` / `has*` / `can*` / `should*` / `need*`  | `true` / `false` | `isDeleted`, `hasPermission` |
| `enabled` / `disabled` / `visible` / `deleted` | `true` / `false` | `isEnabled`, `isVisible`     |

## 匹配优先级

1. 先匹配最具体的模式（如 `createdAt` 优先于 `*Time`）。
2. 字段名**包含**模式时匹配（如 `userName` 匹配 `*Name`）。
3. 大小写不敏感匹配。
4. 多个模式同时命中时，取定义文件中排在前面的规则。
