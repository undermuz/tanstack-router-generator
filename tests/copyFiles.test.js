import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "path";
import fs from "fs-extra";
import os from "os";
import { copyFiles } from "../src/actions/copyFiles.js";

describe("copyFiles", () => {
    let tempDir;
    let targetDir;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "copyFiles-"));
        targetDir = path.join(tempDir, "target");
        await fs.ensureDir(targetDir);
    });

    afterEach(async () => {
        await fs.remove(tempDir).catch(() => {});
    });

    it("copies template directory to target", async () => {
        const templatesDir = path.join(process.cwd(), "templates");
        await copyFiles(templatesDir, targetDir);

        const routesDir = path.join(targetDir, "routes");
        expect(await fs.pathExists(routesDir)).toBe(true);
        expect(await fs.pathExists(path.join(routesDir, "provider.tsx"))).toBe(true);
        expect(await fs.pathExists(path.join(routesDir, "layout.tsx"))).toBe(true);
        expect(await fs.pathExists(path.join(routesDir, "index.tsx"))).toBe(true);
        expect(await fs.pathExists(path.join(routesDir, "page.tsx"))).toBe(true);
        expect(await fs.pathExists(path.join(routesDir, "nested-page", "routes.tsx"))).toBe(true);
        expect(await fs.pathExists(path.join(routesDir, "nested-page", "page.tsx"))).toBe(true);
    });

    it("does not overwrite existing files (overwrite: false)", async () => {
        const templatesDir = path.join(process.cwd(), "templates");
        const existingFile = path.join(targetDir, "routes", "provider.tsx");
        await fs.ensureDir(path.dirname(existingFile));
        const originalContent = "// original content";
        await fs.writeFile(existingFile, originalContent);

        await copyFiles(templatesDir, targetDir);

        const content = await fs.readFile(existingFile, "utf-8");
        expect(content).toBe(originalContent);
    });
});
