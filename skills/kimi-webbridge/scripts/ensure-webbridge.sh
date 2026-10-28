#!/usr/bin/env bash
# ensure-webbridge.sh — 确保 Kimi WebBridge 守护进程可用。
# 流程：status 检查 -> running 则退出；否则 start；二进制缺失则先跑官方安装器再 start。
# 判断依据是 `kimi-webbridge status` 的 JSON（running 字段），不用 /health HTTP 端点。
# 仅供 agent 在工具调用失败时自愈使用；不做 stop/restart/upgrade/uninstall。

set -u

BIN="$HOME/.kimi-webbridge/bin/kimi-webbridge"

get_status() {
    [ -x "$BIN" ] || { echo ""; return; }
    "$BIN" status 2>/dev/null | grep -o '{.*}' | head -1
}

is_running() {
    local status="$1"
    [ -n "$status" ] && echo "$status" | grep -q '"running"[[:space:]]*:[[:space:]]*true'
}

status="$(get_status)"
if is_running "$status"; then
    port="$(echo "$status" | grep -oE '"port"[[:space:]]*:[[:space:]]*[0-9]+' | grep -oE '[0-9]+' | head -1)"
    ext="$(echo "$status" | grep -oE '"extension_connected"[[:space:]]*:[[:space:]]*(true|false)' | grep -oE '(true|false)')"
    echo "OK: daemon already running at http://127.0.0.1:${port:-10086} (extension_connected=${ext:-unknown})"
    exit 0
fi

if [ ! -x "$BIN" ]; then
    echo "kimi-webbridge binary not found, running official installer..."
    curl -fsSL https://cdn.kimi.com/webbridge/install.sh | bash
fi

if [ ! -x "$BIN" ]; then
    echo "FAIL: installer ran but binary still missing at $BIN"
    exit 1
fi

"$BIN" start >/dev/null 2>&1
sleep 1

status="$(get_status)"
if is_running "$status"; then
    port="$(echo "$status" | grep -oE '"port"[[:space:]]*:[[:space:]]*[0-9]+' | grep -oE '[0-9]+' | head -1)"
    ext="$(echo "$status" | grep -oE '"extension_connected"[[:space:]]*:[[:space:]]*(true|false)' | grep -oE '(true|false)')"
    echo "OK: daemon is up at http://127.0.0.1:${port:-10086} (extension_connected=${ext:-unknown})"
    exit 0
fi

echo "FAIL: daemon did not come up. Run: $BIN status"
exit 1
