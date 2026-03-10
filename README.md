# @undermuz/tanstack-router-generator

A lightweight CLI tool that automatically sets up **TanStack Router** in any React or Nx-based project.
It installs required dependencies, generates routing structure, and configures a ready-to-use router setup.

---

## 🚀 Features

- Adds TanStack Router to any React project
- Generates a complete routing structure:
  - Root layout
  - Index page
  - Nested page example
  - Router configuration
  - Router provider `<RouterProvider />`
- Updates `package.json` with required dependencies
- Works in Nx and non-Nx environments
- Zero configuration required

---

## 🛠 Usage

### Initialize TanStack Router

Run the generator inside your React project:

```sh
# Simple react project
npx @undermuz/tanstack-router-generator@latest init

# NX-like project
npx @undermuz/tanstack-router-generator@latest init --project=./apps/web-app/src/app
```

By default, it installs routing files into:

```
<cwd>/src/app
<cwd>/package.json
```

To specify a custom path:

```sh
npx @undermuz/tanstack-router-generator init --project=apps/web-app/src/app

<cwd>/apps/web-app/src/app
<cwd>/package.json
```

### Add a new route

After initialization, you can add new routes using:

```sh
npx @undermuz/tanstack-router-generator add-route <name>

<cwd>/src/app/routes/<name>
```

Examples:

```sh
# Add a "settings" route (uses default src/app)
npx @undermuz/tanstack-router-generator add-route settings

# Add a "user-profile" route  
npx @undermuz/tanstack-router-generator add-route user-profile

# Specify custom app path (routes directory will be created inside)
npx @undermuz/tanstack-router-generator add-route dashboard --project=apps/web-app/src/app
```

The command will:
- Create a new directory for the route inside the app's `routes/` directory
- Generate `page.tsx` component
- Generate `routes.tsx` with route configuration
- Automatically update the main `index.tsx` to include the new route

---

## 📁 What gets generated

### Initial structure
```
routes/
  provider.tsx
  layout.tsx
  page.tsx
  index.tsx
  nested-page/
    routes.tsx
    page.tsx
```

### Adding new routes
When you add a new route using `add-route`, the following files are created:

```
routes/
  my-new-route/
    page.tsx         # Route component
    routes.tsx       # Route configuration
  index.tsx          # (automatically updated)
```

---

## 📚 Dependencies added automatically

- @tanstack/react-router
- @tanstack/react-router-devtools
- framer-motion

---

## 🧩 Requirements

- Node.js 18+
- npm or yarn
- React project (Vite, CRA, Nx, etc.)

---

## 📦 Installation (local development)

Clone the repository and link it globally:

```sh
npm install
npm link
````

Now the CLI is available system-wide:

```sh
tanstack-router-generator
```

---

## 🧪 Testing

```sh
npm test
```

Runs unit tests with [Vitest](https://vitest.dev). Tests cover:

- **copyFiles** — copying templates without overwriting existing files
- **updatePackageJson** — adding TanStack Router dependencies to `package.json`
- **addRoute** — route creation, name normalization, `index.tsx` updates, and error validation

Watch mode (re-run on file changes):

```sh
npm run test:watch
```

Coverage report:

```sh
npm run test:coverage
```

---

## 📄 License

MIT