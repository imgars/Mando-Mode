import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

const APK_DIR = path.join(process.cwd(), "apk");

function findApkFile(): string | null {
  if (!fs.existsSync(APK_DIR)) return null;
  const files = fs.readdirSync(APK_DIR).filter((f) => f.endsWith(".apk"));
  return files.length > 0 ? path.join(APK_DIR, files[0]) : null;
}

router.get("/apk/info", (_req, res) => {
  const apkPath = findApkFile();
  if (!apkPath) {
    res.json({ available: false });
    return;
  }
  const stat = fs.statSync(apkPath);
  const sizeMB = (stat.size / (1024 * 1024)).toFixed(1);
  res.json({
    available: true,
    filename: path.basename(apkPath),
    sizeMB,
  });
});

router.get("/apk/download", (_req, res) => {
  const apkPath = findApkFile();
  if (!apkPath) {
    res.status(404).json({ error: "APK no disponible" });
    return;
  }
  const filename = path.basename(apkPath);
  res.setHeader("Content-Type", "application/vnd.android.package-archive");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", fs.statSync(apkPath).size);
  fs.createReadStream(apkPath).pipe(res);
});

export default router;
