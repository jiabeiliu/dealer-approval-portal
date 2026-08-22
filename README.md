# SchoolSell dealer portal

A two-view prototype for submitting and reviewing dealer requests to sell a product to a school. Data is stored in the browser with `localStorage`; there is no server or login flow.

## Run locally

```bash
pnpm install
pnpm run dev
```

## Product flow

- **Dealer portal:** submit dealer, school, product, quantity, and request context.
- **Admin review:** search and filter every request, then approve or deny it.
- **Persistence:** seeded examples and new decisions are saved on the current device.

## AI build log

### Prompt 1 — product brief

> Develop a framework for a dealer portal webpage where dealers can submit requests for permission to sell a specific product to a school. Include an admin page where staff can view all incoming requests and approve or deny them. Two simple pages are sufficient; no server or login checks; save all data locally.

### Prompt 2 — implementation plan derived from the brief

> Build a polished, responsive two-view portal in the existing React/Next scaffold. Use a professional education-partner visual system. Add a complete dealer request form, success confirmation, seeded realistic requests, an admin summary, status filters, search, and approve/deny actions. Persist requests with localStorage and keep the implementation accessible and dependency-free.

### Progress

1. Inspected the existing site scaffold and retained its build system.
2. Replaced the previous demo with the dealer submission and admin review views.
3. Added local persistence, sample requests, validation, filters, search, and decisions.
4. Updated metadata and responsive styling.
5. Ran final code and production-build checks; the local build runner did not complete within the validation window.
6. Verified locally: the development server starts successfully, dealer requests can be submitted and reviewed, and approval status persists after refresh.
