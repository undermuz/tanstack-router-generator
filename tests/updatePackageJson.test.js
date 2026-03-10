import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "path";
import fs from "fs-extra";
import os from "os";
import { updatePackageJson } from "../src/actions/updatePackageJson.js";

describe("updatePackageJson", () => {
    let tempDir;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "updatePkg-"));
    });

    afterEach(async () => {
        await fs.remove(tempDir).catch(() => {});
    });

    it("adds TanStack Router dependencies to package.json", async () => {
        const pkg = {
            name: "test-app",
            version: "1.0.0",
            dependencies: { react: "^18.0.0" },
        };
        await fs.writeJson(path.join(tempDir, "package.json"), pkg, { spaces: 2 });

        await updatePackageJson(tempDir);

        const updated = await fs.readJson(path.join(tempDir, "package.json"));
        expect(updated.dependencies["@tanstack/react-router"]).toBe("^1.0.0");
        expect(updated.dependencies["@tanstack/react-router-devtools"]).toBe("^1.0.0");
        expect(updated.dependencies["framer-motion"]).toBe("^11.0.0");
        expect(updated.dependencies.react).toBe("^18.0.0");
    });

    it("preserves existing dependencies when merging", async () => {
        const pkg = {
            name: "test-app",
            dependencies: { "some-lib": "1.0.0" },
        };
        await fs.writeJson(path.join(tempDir, "package.json"), pkg, { spaces: 2 });

        await updatePackageJson(tempDir);

        const updated = await fs.readJson(path.join(tempDir, "package.json"));
        expect(updated.dependencies["some-lib"]).toBe("1.0.0");
        expect(updated.dependencies["@tanstack/react-router"]).toBeDefined();
    });

    it("writes package.json with 2-space formatting", async () => {
        const pkg = { name: "test", dependencies: {} };
        await fs.writeJson(path.join(tempDir, "package.json"), pkg, { spaces: 2 });

        await updatePackageJson(tempDir);

        const raw = await fs.readFile(path.join(tempDir, "package.json"), "utf-8");
        expect(raw).toMatch(/\s{2}"@tanstack\/react-router"/);
    });
});
