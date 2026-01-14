# Codebase Overview and Documentation Plan for AI Agents

This document aims to provide an exhaustive and structured overview of the Reviews-Maker codebase, designed specifically for AI agents to easily understand its architecture, functionalities, and interdependencies. The documentation will be broken down into logical phases, detailing each significant component and its underlying code.

## 1. Project Architecture Summary

The Reviews-Maker project is composed of a frontend, a backend, data/asset management, and deployment scripts.

### Frontend: `client/`
*   **Technologies**: Vite + React (hooks, `zustand` for state management, `react-router` for navigation, `i18next` for internationalization).
*   **Key Functionality**: User interface, form handling (`ReviewForm*` pages), data display, and export generation (`ExportMaker.jsx`).
*   **Export Mechanism**: Uses `html-to-image`, `jspdf`, `jszip` to generate various export formats.
*   **Location**: `client/` directory.

### Backend: `server-new/`
*   **Technologies**: Express.js, Passport.js for authentication, Prisma for ORM.
*   **Key Functionality**: API routes (`server-new/routes/`), user authentication (Passport strategies), session management (`server-new/session-options.js`), database interaction (Prisma), file uploads (`multer`).
*   **Data Seeding**: `server-new/seed-templates.js`.
*   **Location**: `server-new/` directory.

### Data & Assets
*   **Static Data**: `data/` for lookup JSON files (e.g., `aromas.json`, `effects.json`, `tastes.json`, `terpenes.json`).
*   **User Uploads**: `db/review_images/` for review-related images, `db/kyc_documents/` for KYC uploads.
*   **Static Files**: `public/` for general static assets.

### Deployment & Scripts
*   **Deployment**: Top-level `deploy*.sh` scripts.
*   **Process Management**: `ecosystem.config.cjs` (PM2 configuration).
*   **Web Server**: `nginx-terpologie.conf` (Nginx configuration).
*   **Utilities**: `scripts/` for diagnostics and VPS helpers.

## 2. Documentation Plan and Structure

The documentation will be structured as follows, with dedicated markdown files for each major component, offering an in-depth analysis of its code and functionalities.

*   **`CODEBASE_OVERVIEW.md` (This file)**: High-level architecture, technology stack, and documentation plan.
*   **`FRONTEND_OVERVIEW.md`**: Detailed breakdown of the `client/` directory.
    *   **`FRONTEND_COMPONENTS.md`**: Analysis of key React components (e.g., `ExportMaker.jsx`, `ReviewForm*`).
    *   **`FRONTEND_STATE_MANAGEMENT.md`**: Details on `zustand` implementation.
    *   **`FRONTEND_ROUTING.md`**: Explanation of `react-router` usage.
    *   **`FRONTEND_EXPORT_LOGIC.md`**: In-depth look at the export generation process.
*   **`BACKEND_OVERVIEW.md`**: Detailed breakdown of the `server-new/` directory.
    *   **`BACKEND_API_ROUTES.md`**: Documentation of API endpoints and their handlers.
    *   **`BACKEND_AUTH.md`**: Passport.js and session management details.
    *   **`BACKEND_DATABASE.md`**: Prisma schema and interaction logic.
    *   **`BACKEND_FILE_UPLOADS.md`**: `multer` configuration and usage.
*   **`DATA_STRUCTURES.md`**: Description of JSON data files and database schemas.
*   **`DEPLOYMENT_GUIDE.md`**: Detailed explanation of deployment scripts, PM2, and Nginx.
*   **`DOMAIN_PATTERNS.md`**: In-depth explanation of core project conventions and domain-specific rules (e.g., PipeLine model, account tiers, export templates).
*   **`DEBUGGING_AND_TOOLS.md`**: Common debugging steps and utility scripts.

Each of these files will contain:
*   **Purpose**: What the component/module does.
*   **Key Files**: Important files within the component/module.
*   **Detailed Functionality**: A line-by-line or block-by-block explanation of the code, including logic, data flow, and interactions with other parts of the system.
*   **Dependencies**: Internal and external dependencies.

This iterative process will ensure a thorough and digestible documentation for any AI agent seeking to understand or modify the Reviews-Maker codebase.

## 3. Getting Started for AI Agents

To begin a deep dive, an AI agent should:
1.  Read this `CODEBASE_OVERVIEW.md` for a high-level understanding.
2.  Navigate to `FRONTEND_OVERVIEW.md` or `BACKEND_OVERVIEW.md` based on the task's focus.
3.  Refer to `DOMAIN_PATTERNS.md` for project-specific rules and constraints.
4.  Utilize `DEBUGGING_AND_TOOLS.md` for local setup and troubleshooting.
