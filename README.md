# Lemonade Destinations

A responsive travel marketplace frontend built with React, JavaScript, and Vite. This release completes **Phase 1**: destination discovery, account creation and login, role-aware routes, and the API foundation for a future service.

## Get started

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env` to configure the API URL and mock mode. Mock mode is on by default, so the account experience works without a backend. Build the static application with `npm run build`.

### Sample accounts

Choose **Try traveler login** or **Try planner login** on `/login` to fill a preview account. Both use `TravelDemo1!` when entering the credentials manually. You can also create an account and choose a role on `/register`.

Preview users, password digests, and access tokens exist only in memory. Reloading the page signs you out and clears accounts you created. Preview password recovery displays a success state without sending email. Preview account creation and login do not create real marketplace accounts or send personal information to a server.

## Routes

- `/` — public home page
- `/explore` — destination filters and trip inspiration
- `/login`, `/register`, `/forgot-password` — authentication flows
- `/customer/dashboard`, `/partner/dashboard` — protected Phase 1 account welcome pages
- `/about`, `/contact`, `/privacy`, `/terms` — public information pages

Phase 1 stops at the account welcome page. Customer trip requests and partner lead/quotation dashboards are planned for subsequent phases.

## Structure

```text
src/
  api/                    Axios client, token manager, auth service, mock adapter
  components/common/      Shared buttons, logos, feedback, confirmation dialog
  components/forms/       Accessible form fields
  components/layout/      Public navigation, footer, route effects
  constants/              Route and role definitions
  features/auth/          Account pages, role selector, Zustand auth store
  features/home/          Destination data, home and information pages
  layouts/                Public and authentication layouts
  routes/                 Protected, role-protected, and guest routes
  store/                  Notifications
  styles/                 Design tokens and global styles
```

## Authentication and API

`VITE_API_BASE_URL` supplies the API base. The authentication service calls `POST /auth/register`, `/auth/login`, `/auth/logout`, `/auth/refresh`, `/auth/forgot-password`, and `GET /auth/me`. The shared Axios client attaches in-memory access tokens, uses credentialed requests for the server-managed refresh cookie, retries concurrent expired requests through a shared refresh, and clears the session after failed refresh. Backend endpoints remain responsible for authorization.

Set `VITE_USE_MOCK_API=true` for the local in-memory adapter or `VITE_USE_MOCK_API=false` to use the configured backend. The live API should use an HttpOnly, secure, appropriately scoped refresh cookie and enforce roles and permissions server-side. Passwords are never stored in application or browser storage.

`ROLES.ADMIN` and the central role-to-route mapping provide an extension point for a future administrator role.

## Destination image credits

All seven photographs are served from Unsplash, whose [license](https://unsplash.com/license) permits free use, including commercial use, without required attribution. Artist and subject links are included here as a courtesy.

- [Shawn — aerial view of Ao Nang](https://unsplash.com/photos/birds-eye-view-photography-of-island-dd_hrEMsF2o) (hero image)
- [Mohamed Alaau — Vilufushi, Maldives](https://unsplash.com/photos/an-aerial-view-of-a-tropical-island-with-palm-trees-dFyi9Mxd4g4)
- [Hello World — Bali rice terraces](https://unsplash.com/photos/rice-terraces-and-lush-trees-fill-this-landscape-AdNQ7YlCjhY)
- [Yasser Mir — Thajwas Glacier, Kashmir](https://unsplash.com/photos/a-mountain-range-covered-in-snow-and-green-grass-qudRJqC4HjY)
- [Kunal Kalra — Alleppey, Kerala](https://unsplash.com/photos/boat-on-water-near-green-trees-during-daytime-W6nTFusoEzE)
- [Fabien BELLANGER — Dubai skyline](https://unsplash.com/photos/burj-khalifa-skyline-in-dubai-WyfXOHgI49s)
- [Nopparuj Lamaikul — Krabi, Thailand](https://unsplash.com/photos/a-group-of-boats-floating-on-top-of-a-body-of-water-ZA4V1cBpj_w)
