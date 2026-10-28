# ensure-webbridge.ps1 — 确保 Kimi WebBridge 守护进程可用。
# 流程：status 检查 -> running 则退出；否则 start；二进制缺失则先跑官方安装器再 start。
# 判断依据是 `kimi-webbridge status` 的 JSON（running 字段），不用 /health HTTP 端点。
# 仅供 agent 在工具调用失败时自愈使用；不做 stop/restart/upgrade/uninstall。

$ErrorActionPreference = 'Continue'

$bin = "$env:USERPROFILE\.kimi-webbridge\bin\kimi-webbridge.exe"

function Get-Status {
    if (-not (Test-Path $bin)) { return $null }
    try {
        $out = & $bin status 2>&1 | Out-String
        return ($out | ConvertFrom-Json)
    } catch { return $null }
}

function Test-Running($status) {
    return ($null -ne $status -and $status.running -eq $true)
}

$status = Get-Status
if (Test-Running $status) {
    Write-Output ("OK: daemon already running at http://127.0.0.1:{0} (extension_connected={1})" -f $status.port, $status.extension_connected)
    exit 0
}

if (-not (Test-Path $bin)) {
    Write-Output "kimi-webbridge binary not found, running official installer..."
    irm https://cdn.kimi.com/webbridge/install.ps1 | iex
}

if (-not (Test-Path $bin)) {
    Write-Output "FAIL: installer ran but binary still missing at $bin"
    exit 1
}

& $bin start | Out-Null
Start-Sleep -Seconds 1

$status = Get-Status
if (Test-Running $status) {
    Write-Output ("OK: daemon is up at http://127.0.0.1:{0} (extension_connected={1})" -f $status.port, $status.extension_connected)
    exit 0
}

Write-Output "FAIL: daemon did not come up. Run: & `"$bin`" status"
exit 1
