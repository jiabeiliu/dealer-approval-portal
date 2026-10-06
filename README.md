# SchoolSell dealer portal

A two-view prototype for submitting and reviewing dealer requests to sell a product to a school. Data is stored in the browser with `localStorage`; there is no server or login flow.

Deployment note: `.openai/hosting.json` currently contains a project ID for an unrelated site. Do not deploy using that manifest until the portal has its own hosting project ID.

## Run locally

```bash
pnpm install
pnpm run dev
```
Requirements:
- Node.js >= 22.13

Run the production build and smoke test with `pnpm test`.


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
5. Confirmed the production build and a server-rendered smoke test pass locally.
6. Verified locally: the development server starts successfully, dealer requests can be submitted and reviewed, and approval status persists after refresh.
   
## Screenshots

<img width="2532" height="1936" alt="4d50ff853c8ac6e65c8a66575dad3a9c" src="https://github.com/user-attachments/assets/79378332-d9ea-4024-9a99-3f5100e0b204" />
<img width="1932" height="1936" alt="e6b0cc81a6390896ddfa46c5c3b62aef" src="https://github.com/user-attachments/assets/7c67517c-b749-4e1c-abe6-9493dd9af9ee" />
<img width="1932" height="1936" alt="3d89d4155863305c1c86da42d36bcdc1" src="https://github.com/user-attachments/assets/0532d135-d9f1-4403-8917-d4af3a9066cb" />
<img width="2532" height="1936" alt="cc60aa9aacc0b98747fb9b62ac3d80de" src="https://github.com/user-attachments/assets/d3c0abee-ae6f-4f11-b23c-eda477e9f86b" />
