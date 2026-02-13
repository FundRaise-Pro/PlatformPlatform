import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const appRoot = process.cwd();
const lockPath = join(appRoot, ".next", "dev", "lock");

if (process.platform === "win32") {
  try {
    execSync(
      `powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'node|npm|cmd' -and $_.CommandLine -match 'public-site\\\\WebApp' -and $_.CommandLine -match 'next dev' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"`,
      { stdio: "ignore" }
    );
  } catch {
  }
}

if (existsSync(lockPath)) {
  rmSync(lockPath, { force: true });
  console.info("[public-site] removed stale Next.js lock");
}
