You are a senior React performance engineer specializing in Create React App (CRA), Webpack, Babel, React, and frontend build tooling.

Your task is to perform a COMPLETE audit of this entire codebase to determine why the development server (`npm start`) is slow to start and why localhost takes several seconds before becoming available.

Do NOT give generic React performance advice.

Instead, inspect the entire project and identify the ACTUAL bottlenecks.

## Goals

Determine:

1. Why `npm start` initialization is slow.
2. Why Webpack compilation is taking longer than expected.
3. Whether the project structure itself contributes to startup time.
4. Which dependencies are slowing down startup.
5. Which imports execute expensive code during boot.
6. Whether unnecessary work happens before the first render.
7. Whether Create React App configuration is the limiting factor.
8. Whether migrating to Vite, Rspack, or another bundler would significantly improve development performance.

---

## Analyze the following

### 1. Project Structure

Inspect:

- folder organization
- number of files
- generated assets
- large JSON files
- static assets
- SVGs
- images
- fonts
- localization files
- configuration files

Look for anything unnecessarily included in the bundle.

---

### 2. package.json

Analyze:

- all dependencies
- all devDependencies

Identify:

- heavy libraries
- duplicate libraries
- deprecated packages
- unnecessary packages
- packages that increase startup time
- packages that slow HMR
- packages that should be lazy loaded

Estimate which packages are most expensive during development startup.

---

### 3. CRA Configuration

Inspect:

- react-scripts version
- Babel configuration
- Browserslist
- environment variables
- webpack overrides (if any)
- CRACO
- react-app-rewired

Determine whether CRA itself is the primary bottleneck.

---

### 4. Entry Point Analysis

Inspect:

- index.js
- index.tsx
- App.js
- App.tsx

Look for:

- expensive initialization
- synchronous API calls
- large imports
- providers
- contexts
- Redux initialization
- MobX
- Zustand
- Query clients
- Firebase initialization
- analytics
- authentication
- localization loading
- icon libraries

Measure how much work occurs before React renders.

---

### 5. Import Graph

Analyze every import.

Identify:

- barrel exports
- circular dependencies
- importing entire libraries instead of individual modules
- importing huge icon packages
- importing entire lodash
- importing all Material UI icons
- importing all date-fns
- importing all moment locales

Recommend precise replacements.

---

### 6. Webpack Bundle

Estimate:

- largest modules
- slowest modules
- compile-heavy packages

Explain why they slow development compilation.

---

### 7. React Components

Find:

- massive components
- components imported on startup but not immediately used
- components suitable for React.lazy()
- unnecessary eager loading

Recommend code splitting opportunities.

---

### 8. Routing

Inspect routing.

Determine:

- whether routes are lazily loaded
- whether every page loads initially
- opportunities for dynamic imports

---

### 9. Assets

Inspect:

- images
- videos
- SVGs
- fonts

Look for:

- assets imported during startup
- oversized files
- assets better loaded on demand

---

### 10. CSS

Inspect:

- CSS imports
- SCSS
- Tailwind
- Bootstrap
- Material UI
- Emotion

Look for excessive global styles.

---

### 11. Build-Time Bottlenecks

Determine whether startup time is caused by:

- Babel
- Webpack
- TypeScript
- ESLint
- source maps
- hot reload
- cache invalidation
- file watching
- antivirus-sensitive directories

---

### 12. Network Requests

Determine whether localhost appears slow because startup waits for:

- authentication
- APIs
- Firebase
- analytics
- remote configuration
- feature flags

---

### 13. Development Performance

Identify:

- expensive hooks
- expensive Context providers
- synchronous computations
- large JSON parsing
- expensive initialization logic

---

### 14. Windows-Specific Issues (if applicable)

Check for:

- Windows Defender scanning
- node_modules performance
- long file paths
- symbolic links
- OneDrive directories

---

### 15. Migration Feasibility

Evaluate whether migrating from CRA to:

- Vite
- Rspack
- Rsbuild
- Parcel

would reduce startup time.

Estimate expected startup improvements.

---

## Deliverables

Provide:

### A. Executive Summary

Overall assessment of why startup is slow.

---

### B. Ranked Bottlenecks

Rank every issue by impact.

Example:

1. CRA Webpack compilation
2. Material UI icon imports
3. Large localization bundle
4. Redux initialization
5. Firebase startup

Include estimated impact (High / Medium / Low).

---

### C. File-by-File Findings

For every problematic file:

- path
- issue
- why it hurts performance
- recommended fix

---

### D. Concrete Code Improvements

Whenever possible, provide exact code replacements.

Do not merely describe improvements.

---

### E. Quick Wins

List fixes that take less than 30 minutes.

---

### F. Medium Improvements

List improvements requiring 1–3 hours.

---

### G. Long-Term Improvements

List architectural improvements.

---

### H. Migration Recommendation

Based on this project, state whether migrating away from CRA is worthwhile.

If yes, estimate:

- current startup time
- expected Vite startup time
- expected Rspack startup time

---

Finally, produce a prioritized action plan sorted by estimated performance gain versus implementation effort.

Base every conclusion on evidence found in the codebase. If evidence is missing, explicitly state that instead of making assumptions.