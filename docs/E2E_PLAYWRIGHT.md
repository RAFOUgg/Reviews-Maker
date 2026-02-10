# Playwright E2E tests

This project includes an end-to-end test that checks the Pipeline grid layout for wrapping and absence of horizontal scroll.

## How to run locally

1. Install dependencies (from repo root):
   - npm install
2. Install Playwright browsers:
   - npm run test:e2e:install
3. Start the frontend dev server (client):
   - cd client && npm run dev (default port: 5173)
4. In repo root run the tests:
   - npm run test:e2e

Note: The tests expect the dev server to be available at http://localhost:5173.
