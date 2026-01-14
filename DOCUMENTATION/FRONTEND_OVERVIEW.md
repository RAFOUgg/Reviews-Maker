# Frontend Overview (client/)

This document provides a detailed overview of the frontend application, located in the `client/` directory. It covers its purpose, technology stack, key subdirectories, local development instructions, and important conventions.

## 1. Purpose and Technology Stack

The `client/` directory houses the user-facing application of Reviews-Maker. It's built as a Single Page Application (SPA) using modern web technologies to provide a rich and interactive user experience.

*   **Framework**: React (with hooks)
*   **Build Tool**: Vite
*   **State Management**: `zustand`
*   **Routing**: `react-router`
*   **Internationalization**: `i18next`
*   **Styling**: Tailwind CSS, PostCSS
*   **Export Libraries**: `html-to-image`, `jspdf`, `jszip`

## 2. Key Subdirectories and Their Roles

*   **`client/public/`**: Contains static assets that are served directly without being processed by Vite. This includes `debug-legal.js`, `gif.worker.js`, `reset-storage.html`, `test-legal.html`, `test-workflow-legal.html`, and the `assets/` folder for images, fonts, etc.
*   **`client/src/`**: This is the core source code directory for the React application.
    *   `App.jsx`: The main application component, often containing the primary routing logic and layout.
    *   `main.jsx`: The entry point of the React application, responsible for rendering the `App` component into the DOM.
    *   `index.css`: Global styles for the application.
    *   `index-data.js`, `mobile-components.js`: These might contain shared data structures or components specific to mobile views, requiring further investigation.
    *   `client/src/components/`: Houses reusable UI components.
        *   `client/src/components/export/ExportMaker.jsx`: Critical component responsible for handling the logic of generating different export formats (PNG, JPEG, PDF, SVG, CSV, JSON, HTML) using `html-to-image`, `jspdf`, and `jszip`.
        *   `client/src/components/legal/`: Components related to age verification and legal consent.
    *   `client/src/pages/`: Contains page-level components, typically corresponding to different routes in the application.
        *   `client/src/pages/ReviewForm*`: These files are likely responsible for rendering the various review forms for different product types (Fleurs, Hash, Concentrés, Comestibles).

## 3. How to Run Locally

To run the frontend application locally, follow these steps from a shell opened in the `client/` directory:

1.  **Install Dependencies**: If you haven't already, install the necessary Node.js packages:
    ```bash
    npm install
    ```
2.  **Start Development Server**: Launch the Vite development server:
    ```bash
    npm run dev
    ```
    The application will typically be accessible at `http://localhost:5173`.

## 4. Important Repository Conventions & Domain Patterns

When making changes to the frontend, it's crucial to adhere to the following project-specific conventions and domain patterns:

*   **Domain-first UI (PipeLine Model)**: Most forms utilize selectors and structured inputs instead of free text entry. This constraint should be preserved when modifying existing forms or creating new ones.
*   **Export Pipeline (`ExportMaker.jsx`)**: The export functionality relies heavily on the DOM structure for `html-to-image` to function correctly. Avoid making changes to the DOM structure that could inadvertently break the export code.
*   **Data-driven Lists (`data/*.json`)**: Dynamic lists (e.g., aromas, effects, tastes, terpenes) are sourced from JSON files in the top-level `data/` directory. When adding new options, update these JSON files rather than hardcoding strings directly in the UI components.
*   **Account Tiers**: The UI and export permissions enforce three distinct role behaviors: `Amateur`, `Producteur` (paid), and `Influenceur` (paid). Ensure that any new features or modifications respect these permission checks in the frontend guards.
*   **Legal / KYC**: Age verification and optional KYC uploads are handled by components in `client/src/components/legal/`. Be mindful of these components when making changes related to user legal information.
*   **Pipeline Export Expectations**: The curing/maturation pipeline stores time-series measurements. When adding new fields, verify that export templates and serializers (CSV/JSON) are updated to include these mappings.

## 5. Next Steps for Frontend Documentation

Following this overview, the frontend documentation will delve deeper into specific areas:

*   **`FRONTEND_COMPONENTS.md`**: Detailed analysis of key React components.
*   **`FRONTEND_STATE_MANAGEMENT.md`**: In-depth look at `zustand` implementation.
*   **`FRONTEND_ROUTING.md`**: Explanation of `react-router` usage.
*   **`FRONTEND_EXPORT_LOGIC.md`**: Detailed breakdown of the export generation process.
