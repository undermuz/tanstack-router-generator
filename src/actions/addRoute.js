import fs from "fs-extra";
import path from "path";

// Template for page.tsx
const pageTemplate = (routeName) => {
    const displayName = routeName.replace(/-/g, " ");
    const capitalizedName = displayName
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");

    return `import { Link } from "@tanstack/react-router";

export default function ${capitalizedName}Page() {
    return (
        <div>
            <Link to="/">Home page</Link>
            <h1>${displayName}</h1>
        </div>
    );
}
`;
};

// Template for routes.tsx
const routesTemplate = (routeName) => {
    const camelCaseName = routeName
        .split("-")
        .map((part, i) =>
            i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
        )
        .join("");

    return `import { createRoute } from "@tanstack/react-router";

import { root } from "../index";

import Page from "./page";

export const ${camelCaseName}Route = createRoute({
    getParentRoute: () => root,
    path: "/${routeName}",
    component: Page,
});

export const tree = ${camelCaseName}Route;
`;
};

export async function addRoute(routesPath, routeName) {
    // Validate route name
    if (!routeName || typeof routeName !== "string") {
        throw new Error("Route name is required");
    }

    // Normalize route name (lowercase, kebab-case)
    const normalizedName = routeName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    if (!normalizedName) {
        throw new Error("Invalid route name");
    }

    // Create route directory
    const routePath = path.join(routesPath, normalizedName);

    // Check if route already exists
    if (await fs.pathExists(routePath)) {
        throw new Error(
            `Route '${normalizedName}' already exists: ${routePath}`,
        );
    }

    // Create route directory
    await fs.ensureDir(routePath);

    // Create page.tsx
    await fs.writeFile(
        path.join(routePath, "page.tsx"),
        pageTemplate(normalizedName),
    );

    // Create routes.tsx
    await fs.writeFile(
        path.join(routePath, "routes.tsx"),
        routesTemplate(normalizedName),
    );

    // Update main index.tsx
    const indexPath = path.join(routesPath, "index.tsx");
    let indexContent = await fs.readFile(indexPath, "utf-8");

    // Extract the camelCase name for the import
    const camelCaseName = normalizedName
        .split("-")
        .map((part, i) =>
            i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
        )
        .join("");

    // Check if import already exists
    if (indexContent.includes(`* as ${camelCaseName}`)) {
        throw new Error(`Route '${normalizedName}' is already imported`);
    }

    // Add import statement - find the last import and add after it
    const importLines = indexContent.split("\n");
    let lastImportIndex = -1;

    for (let i = 0; i < importLines.length; i++) {
        if (importLines[i].trim().startsWith("import ")) {
            lastImportIndex = i;
        }
    }

    if (lastImportIndex === -1) {
        throw new Error("Could not find import statements in index.tsx");
    }

    const newImportLine = `import * as ${camelCaseName} from "./${normalizedName}/routes";`;
    importLines.splice(lastImportIndex + 1, 0, newImportLine);
    indexContent = importLines.join("\n");

    // Add route to tree - find the root.addChildren call and add the new route
    const treeRegex =
        /export const tree = root\.addChildren\(\[([\s\S]*?)\]\);/;
    const match = indexContent.match(treeRegex);

    if (!match) {
        throw new Error("Could not find tree definition in index.tsx");
    }

    const currentRoutes = match[1];
    let newRoutes;

    // Check if it's multiline (has newlines)
    if (currentRoutes.includes("\n")) {
        // Multiline format - find the last route line and remove its trailing comma
        const lines = currentRoutes.split("\n");
        // Find the last non-empty line
        let lastRouteIndex = -1;
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].trim()) {
                lastRouteIndex = i;
                break;
            }
        }
        if (lastRouteIndex >= 0) {
            // Remove trailing comma from the last route
            lines[lastRouteIndex] = lines[lastRouteIndex]
                .replace(/,\s*$/, "")
                .trim();
        }
        const cleanRoutes = lines.join("\n");
        newRoutes = `${cleanRoutes},\n  ${camelCaseName}.tree`;
    } else {
        // Single line format - add after last item
        newRoutes = `${currentRoutes}, ${camelCaseName}.tree`;
    }

    indexContent = indexContent.replace(
        treeRegex,
        `export const tree = root.addChildren([${newRoutes}]);`,
    );

    // Write updated index.tsx
    await fs.writeFile(indexPath, indexContent);

    return {
        name: normalizedName,
        path: routePath,
    };
}
