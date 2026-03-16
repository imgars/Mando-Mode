const { withAndroidManifest } = require("expo/config-plugins");

function withOverlayPermission(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (!manifest["uses-permission"]) {
      manifest["uses-permission"] = [];
    }

    const hasPermission = manifest["uses-permission"].some(
      (perm) =>
        perm.$?.["android:name"] === "android.permission.SYSTEM_ALERT_WINDOW",
    );

    if (!hasPermission) {
      manifest["uses-permission"].push({
        $: { "android:name": "android.permission.SYSTEM_ALERT_WINDOW" },
      });
    }

    const hasForegroundService = manifest["uses-permission"].some(
      (perm) =>
        perm.$?.["android:name"] ===
        "android.permission.FOREGROUND_SERVICE",
    );

    if (!hasForegroundService) {
      manifest["uses-permission"].push({
        $: { "android:name": "android.permission.FOREGROUND_SERVICE" },
      });
    }

    return config;
  });
}

module.exports = withOverlayPermission;
