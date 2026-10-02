# Graph Report - Absensi_PKM  (2026-09-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 276 nodes · 576 edges · 14 communities (11 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3056fe41`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- backend/package.json
- frontend/package.json
- App.tsx
- react
- Guru
- compilerOptions
- compilerOptions
- scripts
- devDependencies
- .oxlintrc.json
- tsconfig.json

## God Nodes (most connected - your core abstractions)
1. `react` - 34 edges
2. `Eskul` - 31 edges
3. `lucide-react` - 31 edges
4. `StudentProfile` - 19 edges
5. `compilerOptions` - 18 edges
6. `PresensiRecord` - 16 edges
7. `compilerOptions` - 15 edges
8. `Guru` - 13 edges
9. `PenilaianRecord` - 12 edges
10. `SesiPertemuan` - 12 edges

## Surprising Connections (you probably didn't know these)
- `AddEskulModalProps` --references--> `Eskul`  [EXTRACTED]
  frontend/src/components/modals/AddEskulModal.tsx → frontend/src/types/index.ts
- `EditEskulModalProps` --references--> `Eskul`  [EXTRACTED]
  frontend/src/components/modals/EditEskulModal.tsx → frontend/src/types/index.ts
- `AdminDashboardProps` --references--> `NavItemKey`  [EXTRACTED]
  frontend/src/components/dashboard/AdminDashboard.tsx → frontend/src/components/Sidebar.tsx
- `EskulManagementProps` --references--> `Eskul`  [EXTRACTED]
  frontend/src/components/dashboard/EskulManagement.tsx → frontend/src/types/index.ts
- `DynamicQrGeneratorProps` --references--> `SesiPertemuan`  [EXTRACTED]
  frontend/src/components/guru/DynamicQrGenerator.tsx → frontend/src/types/index.ts

## Import Cycles
- None detected.

## Communities (14 total, 3 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.11
Nodes (36): EskulManagement(), EskulManagementProps, ReportsManagement(), ReportsManagementProps, StudentManagement(), StudentManagementProps, DynamicQrGenerator(), DynamicQrGeneratorProps (+28 more)

### Community 1 - "backend/package.json"
Cohesion: 0.06
Nodes (35): dependencies, cors, dotenv, express, multer, @prisma/client, description, devDependencies (+27 more)

### Community 2 - "frontend/package.json"
Cohesion: 0.06
Nodes (31): dependencies, canvas-confetti, framer-motion, lucide-react, qrcode.react, react, react-dom, name (+23 more)

### Community 3 - "App.tsx"
Cohesion: 0.11
Nodes (24): AdminDashboard(), AdminDashboardProps, SettingsPage(), AddEskulModal(), AddEskulModalProps, EditEskulModal(), EditEskulModalProps, PembinaOption (+16 more)

### Community 4 - "react"
Cohesion: 0.16
Nodes (17): frontend_src_assets_logo_smk, DEMO_ACCOUNTS, DemoAccountItem, LoginPage(), LoginPageProps, WaliKelasDashboard(), WaliKelasDashboardProps, Header() (+9 more)

### Community 5 - "Guru"
Cohesion: 0.16
Nodes (14): GuruWaliManagement(), GuruWaliManagementProps, KelasManagement(), KelasManagementProps, PembinaManagement(), PembinaManagementProps, AddGuruModal(), AddGuruModalProps (+6 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 7 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 8 - "scripts"
Cohesion: 0.12
Nodes (15): description, devDependencies, concurrently, name, scripts, build:frontend, db:migrate, db:seed (+7 more)

### Community 9 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer, postcss, tailwindcss, @types/canvas-confetti, @types/node, @types/react, @types/react-dom (+3 more)

### Community 10 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

## Knowledge Gaps
- **118 isolated node(s):** `EskulScheduleItem`, `PrestasiLombaRecord`, `QrScannerModalProps`, `PembinaOption`, `ImportDataModalProps` (+113 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 126 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `index.ts`, `frontend/package.json`, `App.tsx`, `Guru`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `index.ts` to `frontend/package.json`, `App.tsx`, `react`, `Guru`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `frontend/package.json`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `EskulScheduleItem`, `PrestasiLombaRecord`, `QrScannerModalProps` to the rest of the system?**
  _118 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10714285714285714 - nodes in this community are weakly interconnected._
- **Should `backend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05668016194331984 - nodes in this community are weakly interconnected._
- **Should `frontend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._