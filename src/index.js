import { program } from "commander";

import path from "path";

import { fileURLToPath } from "url";

import { copyFiles } from "./actions/copyFiles.js";
import { updatePackageJson } from "./actions/updatePackageJson.js";
import { addRoute } from "./actions/addRoute.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize command
program
    .command("init")
    .description("Initialize TanStack Router in React project")
    .option("-p, --project <path>", "Path to src/app", "src/app")
    .action(async (options, command) => {
        try {
            const projectPath = command.optsWithGlobals().project || "src/app";
            const target = path.resolve(process.cwd(), projectPath);

            console.log("📦 Copy templates...");

            await copyFiles(path.join(__dirname, "../templates"), target);

            console.log("📘 Update package.json...");

            await updatePackageJson(process.cwd());

            console.log("✨ TanStack Router successfully installed!");
        } catch (error) {
            console.error("❌ Error:", error.message);
            process.exit(1);
        }
    });

// Add route command
program
    .command("add-route <name>")
    .option(
        "-p, --project <path>",
        "Path to app directory (routes will be created inside)",
        "src/app",
    )
    .description("Add a new route to the project")
    .action(async (name, options, command) => {
        try {
            const projectPath = command.optsWithGlobals().project || "src/app";
            const appPath = path.resolve(process.cwd(), projectPath);
            const routesPath = path.join(appPath, "routes");
            const result = await addRoute(routesPath, name);

            console.log(`✨ Route '${result.name}' added successfully!`);
            console.log(`📁 Location: ${result.path}`);
        } catch (error) {
            console.error("❌ Error:", error.message);
            process.exit(1);
        }
    });

program.parse(process.argv);
