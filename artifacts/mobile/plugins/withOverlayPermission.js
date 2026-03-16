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

    const requiredPermissions = [
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.FOREGROUND_SERVICE_SPECIAL_USE",
    ];

    for (const perm of requiredPermissions) {
      const exists = manifest["uses-permission"].some(
        (p) => p.$?.["android:name"] === perm,
      );
      if (!exists) {
        manifest["uses-permission"].push({
          $: { "android:name": perm },
        });
      }
    }

    return config;
  });
}

module.exports = withOverlayPermission;
