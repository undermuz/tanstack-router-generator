import fs from "fs-extra";
import path from "path";

export async function updatePackageJson(root) {
    const pkgPath = path.join(root, "package.json");
    const pkg = await fs.readJson(pkgPath);

    pkg.dependencies = {
        ...pkg.dependencies,
        "@tanstack/react-router": "^1.0.0",
        "@tanstack/react-router-devtools": "^1.0.0",
        "framer-motion": "^11.0.0",
    };

    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
}
