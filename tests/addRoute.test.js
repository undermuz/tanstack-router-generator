import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "path";
import fs from "fs-extra";
import os from "os";
import { addRoute } from "../src/actions/addRoute.js";

const createFakeIndexTsx = (routes = ["nestedPage"]) => {
    const routeToPath = (r) => r.replace(/([A-Z])/g, (m) => "-" + m.toLowerCase()).replace(/^-/, "");
    const imports = routes
        .map((r) => `import * as ${r} from "./${routeToPath(r)}/routes";`)
        .join("\n");
    return `import { createRootRoute, createRoute } from "@tanstack/react-router";

import { RootLayout } from "./layout";
${routes.length ? imports + "\n" : ""}import { IndexPage } from "./page";

export const root = createRootRoute({
    component: RootLayout,
});

export const indexRoute = createRoute({
    getParentRoute: () => root,
    path: "/",
    component: IndexPage,
});

export const tree = root.addChildren([indexRoute${routes.map((r) => `, ${r}.tree`).join("")}]);
`;
};

describe("addRoute", () => {
    let tempDir;
    let routesPath;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "addRoute-"));
        routesPath = path.join(tempDir, "routes");
        await fs.ensureDir(routesPath);
        await fs.writeFile(
            path.join(routesPath, "index.tsx"),
            createFakeIndexTsx(["nestedPage"]),
        );
    });

    afterEach(async () => {
        await fs.remove(tempDir).catch(() => {});
    });

    it("creates route directory with page.tsx and routes.tsx", async () => {
        const result = await addRoute(routesPath, "settings");

        expect(result.name).toBe("settings");
        expect(result.path).toBe(path.join(routesPath, "settings"));

        const pagePath = path.join(routesPath, "settings", "page.tsx");
        const routesPathFile = path.join(routesPath, "settings", "routes.tsx");
        expect(await fs.pathExists(pagePath)).toBe(true);
        expect(await fs.pathExists(routesPathFile)).toBe(true);

        const pageContent = await fs.readFile(pagePath, "utf-8");
        expect(pageContent).toContain("SettingsPage");
        expect(pageContent).toContain("settings");

        const routesContent = await fs.readFile(routesPathFile, "utf-8");
        expect(routesContent).toContain("settingsRoute");
        expect(routesContent).toContain('path: "/settings"');
    });

    it("normalizes route name to kebab-case", async () => {
        const result = await addRoute(routesPath, "UserProfile");

        expect(result.name).toBe("userprofile");
        expect(await fs.pathExists(path.join(routesPath, "userprofile", "page.tsx"))).toBe(true);
    });

    it("updates index.tsx with new import and tree", async () => {
        await addRoute(routesPath, "dashboard");

        const indexContent = await fs.readFile(path.join(routesPath, "index.tsx"), "utf-8");
        expect(indexContent).toContain('import * as dashboard from "./dashboard/routes";');
        expect(indexContent).toMatch(/dashboard\.tree/);
    });

    it("throws if route name is empty or only spaces/symbols", async () => {
        await expect(addRoute(routesPath, "")).rejects.toThrow("Route name is required");
        await expect(addRoute(routesPath, "!!!")).rejects.toThrow("Invalid route name");
    });

    it("throws if route already exists", async () => {
        await addRoute(routesPath, "settings");
        await expect(addRoute(routesPath, "settings")).rejects.toThrow("already exists");
    });

    it("throws if index.tsx has no import block", async () => {
        await fs.writeFile(path.join(routesPath, "index.tsx"), "export const tree = 1;");
        await expect(addRoute(routesPath, "foo")).rejects.toThrow("Could not find import statements");
    });

    it("throws if index.tsx has no tree definition", async () => {
        await fs.writeFile(
            path.join(routesPath, "index.tsx"),
            'import x from "./x";\nexport const tree = null;',
        );
        await expect(addRoute(routesPath, "foo")).rejects.toThrow("Could not find tree definition");
    });

    it("handles single-line tree in index.tsx", async () => {
        await fs.writeFile(
            path.join(routesPath, "index.tsx"),
            `import { createRootRoute } from "@tanstack/react-router";
import * as nestedPage from "./nested-page/routes";
export const root = createRootRoute({});
export const indexRoute = {};
export const tree = root.addChildren([indexRoute, nestedPage.tree]);`,
        );
        const result = await addRoute(routesPath, "single");
        expect(result.name).toBe("single");
        const indexContent = await fs.readFile(path.join(routesPath, "index.tsx"), "utf-8");
        expect(indexContent).toContain("single.tree");
    });
});
