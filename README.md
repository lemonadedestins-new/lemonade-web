# Lemonade Destinations

A responsive South India travel marketplace frontend built with React, JavaScript, and Vite. Planners publish the packages they offer; customers browse a destination, compare packages from different planners, and enquire about the package that fits them.

## Get started

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env` to configure the API URL and mock mode. Mock mode is on by default, so the account experience works without a backend. Build the static application with `npm run build`.

### Sample accounts

Choose **Try traveler login** or **Try planner login** on `/login` to fill a preview account. Both use `TravelDemo1!` when entering the credentials manually. You can also create an account and choose a role on `/register`.

Preview users, password digests, access tokens, trip requests, quotes, drafts, and preferences exist only in memory. Reloading the page signs you out and resets the preview. Signing out clears customer and partner caches and unfinished form values; saved mock records remain associated with their owner until reload. Preview password recovery displays a success state without sending email. No real marketplace accounts, planner communications, bookings, or payments are created.

The sample traveler has a Munnar request with two proposals, an Alleppey trip with a sample planner selection, and an editable Coorg draft. Sample dates are relative to the current day. New accounts begin with an empty trip list.

The sample catalog contains Munnar, Ooty, Coorg, Alleppey, Hampi, and Pondicherry packages from fictional South India planners. The sample planner, Green Trail Holidays, can manage its package listings and has assigned enquiries. Newly registered planners have no listings or assigned enquiries. To try the marketplace, browse Munnar, open a package, log in as the sample traveler, and submit an enquiry. To publish a listing, use **Try planner login**, open **My packages**, and add or edit a package.

## Routes

- `/` — public home page
- `/explore` — South India package catalog with destination, planner, budget, duration, and search filters
- `/packages/:id` — package itinerary, inclusions, planner profile, and enquiry CTA
- `/planners/:id` — planner profile and all published packages
- `/login`, `/register`, `/forgot-password` — authentication flows
- `/customer/dashboard` — welcome, trip statistics, recent activity, and upcoming trips
- `/customer/trips` — searchable trip cards with status filters
- `/customer/trips/new` — three-step request form: essentials, preferences, and review
- `/customer/trips/:id` — travel brief, status, timeline, and planner proposals
- `/customer/trips/:id/edit` — resume a saved draft
- `/customer/profile` — name and default departure city
- `/customer/settings` — default accommodation and transportation preferences
- `/partner/dashboard` — package catalog summary, enquiry and quote statistics, available leads, and recent activity
- `/partner/packages` — publish, edit, filter, and archive package listings
- `/partner/packages/new` and `/partner/packages/:id/edit` — package editor with itinerary, pricing, inclusions, exclusions, and terms
- `/partner/leads` — assigned enquiries with search and status filters
- `/partner/leads/:id` — travel requirements and the planner's proposal
- `/partner/leads/:leadId/quotes/new` — four-step quote form, private drafts, itinerary editor, and final review
- `/partner/quotes` — searchable quotes with status filters
- `/partner/quotes/:id` — proposal details, draft resumption, and confirmed withdrawal
- `/partner/profile` — business name, city, specialties, and description
- `/partner/settings` — default quote validity and terms
- `/about`, `/contact`, `/privacy`, `/terms` — public information pages

Customers can browse published South India packages, compare planner offerings, view complete itineraries, and submit date-based package enquiries. Planners can publish package listings, save drafts, edit published packages, archive listings, and continue using the separate enquiry and quotation workspace. Package prices are indicative per adult on twin sharing; dates, availability, final prices, and terms are confirmed with the planner. No booking or payment is created.

## Structure

```text
src/
  api/                    Axios client, auth/customer/trip/partner/quote services, mock repositories
  components/common/      Shared buttons, logos, statistics, feedback, confirmation dialog
  components/forms/       Accessible form fields
  components/layout/      Public navigation, footer, route effects
  constants/              Route and role definitions
  features/auth/          Account pages, role selector, Zustand auth store
  features/home/          Destination data, home and information pages
  features/customer/      Dashboard, profile, preferences, workspace styles
  features/trips/         Request form, trip list/details, validation, scoped Zustand store
  features/packages/      Public catalog, planner profiles, package details, enquiries, and package editor
  features/partner/       Planner dashboard, enquiries, profile/settings, scoped Zustand store
  features/quotes/        Quote form, list/details, validation, reusable proposal views
  hooks/                  Role-aware planning links
  layouts/                Public, authentication, and shared customer/partner workspace layouts
  routes/                 Protected, role-protected, and guest routes
  store/                  Notifications
  styles/                 Design tokens and global styles
```

## Authentication and API

`VITE_API_BASE_URL` supplies the API base. The authentication service calls `POST /auth/register`, `/auth/login`, `/auth/logout`, `/auth/refresh`, `/auth/forgot-password`, and `GET /auth/me`. The shared Axios client attaches in-memory access tokens, uses credentialed requests for the server-managed refresh cookie, retries concurrent expired requests through a shared refresh, and clears the session after failed refresh. Backend endpoints remain responsible for authorization.

Set `VITE_USE_MOCK_API=true` for the local in-memory adapter or `VITE_USE_MOCK_API=false` to use the configured backend. The live API should use an HttpOnly, secure, appropriately scoped refresh cookie and enforce roles and permissions server-side. Passwords are never stored in application or browser storage.

`ROLES.ADMIN` and the central role-to-route mapping provide an extension point for a future administrator role.

## Customer API contract

All paths below are relative to `VITE_API_BASE_URL` (normally `/api`). Requests use the same authenticated Axios client as account endpoints.

| Method | Path | Response / behavior |
| --- | --- | --- |
| GET | `/trips` | `{ trips: [...] }`, scoped to the authenticated customer |
| GET | `/trips/:id` | `{ trip }`, including `quotes` and `timeline` arrays |
| POST | `/trips` | `{ trip }` with status 201; creates a draft or submitted request |
| PATCH | `/trips/:id` | `{ trip }`; updates or submits an owned draft |
| PATCH | `/customer/profile` | `{ user }`; accepts `name` and `homeCity` |
| PATCH | `/customer/preferences` | `{ user }`; accepts `accommodation` and `transportation` |

Trip writes accept `destination`, `departureCity`, `startDate`, `endDate`, `adults`, `children`, `budget`, `tripType`, `accommodation`, `transportation`, `interests`, `specialRequirements`, `notes`, and `status` (`DRAFT` or `SUBMITTED`). Dates use `YYYY-MM-DD`; budgets and quote prices are total INR for the whole group. A draft requires a destination; submitted requests require complete essential details and travel preferences. Validate any nonempty draft fields too. The server must set owner, identity, quotes, and timeline; clients cannot assign these fields.

Expected failures: 401 unauthenticated, 403 incorrect role, 404 missing or unowned trip, 409 editing a submitted request, and 422 validation errors (`{ code, fields: { fieldName: message } }`). The mock enforces these rules for realistic UI behavior; it is not a security boundary. Real backends must independently validate ownership, roles, inputs, and status transitions. Production POST handling should support idempotency for retries after an uncertain network outcome.

## Package and partner API contract

Public package endpoints are intentionally readable without authentication:

| Method | Path | Response / behavior |
| --- | --- | --- |
| GET | `/packages` | `{ packages: [...] }`, published South India listings |
| GET | `/packages/:id` | `{ package }`, including planner profile and full itinerary |
| GET | `/planners/:id` | `{ planner }`, including all published packages |
| POST | `/packages/:id/enquiries` | `{ trip }` with status 201; requires a customer session and creates a selected-package enquiry |

Planner package endpoints require an authenticated `BUSINESS_OWNER`:

| Method | Path | Response / behavior |
| --- | --- | --- |
| GET | `/partner/packages` | `{ packages: [...] }`, including the planner’s drafts and archived listings |
| GET | `/partner/packages/:id` | `{ package }`, owned listing only |
| POST | `/partner/packages` | `{ package }` with status 201; creates a draft or published listing |
| PATCH | `/partner/packages/:id` | `{ package }`; updates an owned listing |

Published listings require a supported destination, package title, summary, per-person price, duration, pickup city, stay, transport, meals, inclusions, exclusions, terms, and one itinerary entry per day. Drafts may omit incomplete details but remain private. Archive removes a package from public search while keeping it in the planner’s collection.

Customer package enquiries store the selected package, planner, price snapshot, dates, and estimated total on the customer’s trip record. The planner receives the enquiry through its assigned leads. The mock adapter is ephemeral and does not send external messages.

### Quote and lead endpoints

Partner endpoints require an authenticated `BUSINESS_OWNER`. Leads expose the travel brief and the current planner's quote, excluding customer identity and competing proposals.

| Method | Path | Response / behavior |
| --- | --- | --- |
| GET | `/partner/leads` | `{ leads: [...] }`, scoped to assigned enquiries |
| GET | `/partner/leads/:id` | `{ lead }`, including `canQuote` and the planner's `quote` |
| GET | `/partner/quotes` | `{ quotes: [...] }`, scoped to the authenticated planner |
| GET | `/partner/quotes/:id` | `{ quote }`, including derived status and `canEdit` |
| POST | `/partner/leads/:leadId/quotes` | `{ quote }` with status 201; creates a private draft or submitted quote |
| PATCH | `/partner/quotes/:id` | `{ quote }`; updates or submits an owned draft |
| POST | `/partner/quotes/:id/withdraw` | `{ quote }`; withdraws a submitted or expired proposal |
| PATCH | `/partner/profile` | `{ user }`; accepts `name`, `businessName`, `city`, `specialties`, and `description` |
| PATCH | `/partner/settings` | `{ user }`; accepts `validityDays` (1–30) and `defaultTerms` |

Quote writes accept `title`, `price`, `days`, `nights`, `accommodation`, `transportation`, `meals`, `activities`, `inclusions`, `exclusions`, `terms`, `validUntil`, `notes`, `itinerary`, and `status` (`DRAFT` or `SUBMITTED`). An itinerary entry contains `day`, `title`, and `description`; inclusion/exclusion values are arrays of strings. Prices are total INR, dates are `YYYY-MM-DD`, and submitted itinerary length must match `days` with `nights = days - 1`. Drafts require a package title and validate any nonempty fields. Expiry cannot precede today or exceed the travel start date.

The server owns IDs, planner/lead association, business name, timestamps, and status transitions. One quote per assigned planner/enquiry is supported. Customer drafts never become leads. Closed or past enquiries reject quote writes; accepted and withdrawn quotes cannot be withdrawn. Expected failures are 401 unauthenticated, 403 incorrect role, 404 missing/unowned/unassigned resources, 409 closed enquiry or invalid transition, and 422 field validation errors. The mock shares trip records across customer and partner repositories, so submissions and withdrawals update both sides together. Real backend authorization and validation remain required.

The trip and partner stores share list data and in-progress form values, clear on account changes, and ignore late responses from prior sessions. Partner leads and quotes live in one store because they update together. Step and dialog state stay local. Customer and partner pages are lazy loaded; the public landing bundle does not eagerly load either workspace or the mock repository.

## Verification

```sh
npm test
npm run build
```

The Node test suite covers draft-to-submitted transitions, numeric/date validation, ownership, role restrictions, input allowlisting, detached API responses, seeded quotation data, service/store integration, logout cleanup, late responses, preferences, and safe return routes. Partner coverage adds assignment privacy, quote draft isolation, itinerary normalization, closed-enquiry protection, expiry, withdrawal, business settings, and the customer-to-planner service flow. No additional test dependencies are required.

All 41 automated checks pass, including the package catalog, planner profile, package validation, and customer enquiry flows. Browser-based visual and breakpoint verification remains pending because the browser host was unavailable. Responsive styles cover mobile, tablet, and desktop layouts, but those layouts have not been visually certified in this session.

## Destination image credits

All six photographs are served from Unsplash, whose [license](https://unsplash.com/license) permits free use, including commercial use, without required attribution. Artist and subject links are included here as a courtesy.

- [Munnar tea hills](https://unsplash.com/photos/rows-of-tea-plants-on-a-hillside-with-trees-Su8guWN5-_M) (hero image)
- [Ooty hillside lake](https://unsplash.com/photos/a-lush-green-hillside-with-a-lake-in-the-distance-6qUltw7SjzM)
- [Coorg mountain forest](https://unsplash.com/photos/green-trees-and-mountains-during-daytime-B5CZBhaz8CY)
- [Alleppey backwaters](https://unsplash.com/photos/boat-on-water-near-green-trees-during-daytime-W6nTFusoEzE)
- [Hampi landscape](https://unsplash.com/photos/landscape-photography-of-green-grass-field-and-green-coconut-palm-trees-03JtNfCubFw)
- [Pondicherry coast](https://unsplash.com/photos/an-aerial-view-of-a-beach-and-a-city-i3FLO6Nthw4)
