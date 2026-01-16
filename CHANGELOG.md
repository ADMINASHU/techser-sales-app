# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.2.1](https://github.com/ADMINASHU/techser-sales-app/compare/v2.2.0...v2.2.1) (2026-01-16)


### Bug Fixes

* resolve user filter issue and optimize caching ([610346a](https://github.com/ADMINASHU/techser-sales-app/commit/610346a7a41b9a9df169a544c8d1ab1f356d9153))

## [2.2.0](https://github.com/ADMINASHU/techser-sales-app/compare/v2.1.2...v2.2.0) (2026-01-09)


### Features

* Add admin entry detail page, user verification and decline actions with FCM notifications, and email utility. ([86eb1b3](https://github.com/ADMINASHU/techser-sales-app/commit/86eb1b3d7f66d39fb9ebe3e596ce1b751706548b))
* Add entry management components including details modals, filters, infinite list, and associated actions. ([fd93aec](https://github.com/ADMINASHU/techser-sales-app/commit/fd93aec75a6fb837c12f3e69409a086664e768e4))
* Implement admin settings page for location management and enhance navbar with role-based links. ([d2a19b2](https://github.com/ADMINASHU/techser-sales-app/commit/d2a19b2e96134aaa381bc15f69028f411a9b735f))
* Implement customer log and entry management system with new pages, components, actions, and location seeding. ([fdddf0c](https://github.com/ADMINASHU/techser-sales-app/commit/fdddf0cc3778cc22f3811dcd21bbbcb691de94b3))
* introduce core data models for User, Customer, and Entry, and implement server actions for customer management. ([40a022d](https://github.com/ADMINASHU/techser-sales-app/commit/40a022da28f991dbd6481d08db002b2926dab8b1))
* Introduce global CSS with a custom Tailwind theme and glassmorphism components while removing unused dependencies. ([34ddd69](https://github.com/ADMINASHU/techser-sales-app/commit/34ddd693cf5184f57f673a567d8e58616921e4ad))
* Introduce Mongoose models for User, Customer, and Entry, and add server actions for report generation, raw entry fetching, filter options, and system statistics. ([a13dda0](https://github.com/ADMINASHU/techser-sales-app/commit/a13dda0f7e53d3b44c0755ea6ec9d1396af58f8f))
* Introduce new support and features pages, implement server actions for customer, admin, and user management, and remove obsolete development files. ([904f76d](https://github.com/ADMINASHU/techser-sales-app/commit/904f76de3d4e55d77fb04b679d54cd2821b11940))
* Introduce NotificationBell for unread notifications, EntryFilters for dynamic data filtering, and create Navbar component. ([dd4565c](https://github.com/ADMINASHU/techser-sales-app/commit/dd4565cc717a129ad530d69f9e1b2f09414059d2))
* Introduce user management actions, entry list with filtering and infinite scroll, and authentication configuration. ([98fc467](https://github.com/ADMINASHU/techser-sales-app/commit/98fc4671e89a3841cba3ad96abbdf34e625e5701))
* update UI components, features page, legal docs, and fix lint errors ([339d512](https://github.com/ADMINASHU/techser-sales-app/commit/339d5122f342fbbc3cd1b66f877a448dde5060b0))

### [2.1.2](https://github.com/ADMINASHU/techser-sales-app/compare/v2.1.1...v2.1.2) (2026-01-07)


### Bug Fixes

* resolve redirect loops, notification permissions, and session sync ([58d970c](https://github.com/ADMINASHU/techser-sales-app/commit/58d970c73b8425906d48321d8487979002fcb94e))

### [2.1.1](https://github.com/ADMINASHU/techser-sales-app/compare/v2.1.0...v2.1.1) (2026-01-07)


### Bug Fixes

* prefill region filter to admin's region on user management page ([3ea51f3](https://github.com/ADMINASHU/techser-sales-app/commit/3ea51f3460732499cd72b51b4b74cfe3452b1dc8))
* resolve hydration errors, add duration display, optimize mobile performance ([61a723f](https://github.com/ADMINASHU/techser-sales-app/commit/61a723f1727951c9384c3381a4a013848330c14d))

## [2.1.0](https://github.com/ADMINASHU/techser-sales-app/compare/v2.0.1...v2.1.0) (2026-01-06)


### Features

* Add Firebase Cloud Messaging (FCM) for push notifications, including a service worker and server-side admin alerts for stamp events. ([a423f35](https://github.com/ADMINASHU/techser-sales-app/commit/a423f3525b326bbd1b8fb8c06e717b579d6832a4))
* implement `AdminUserList` component with search, region/branch filtering, and infinite scroll. ([f58210e](https://github.com/ADMINASHU/techser-sales-app/commit/f58210e8875182642aa2ab9598107a3d10cc5f93))
* Implement Firebase Cloud Messaging (FCM) for push notifications, including server-side sending, client-side service worker, and admin action integration. ([f5e418e](https://github.com/ADMINASHU/techser-sales-app/commit/f5e418ecc6c9dd8e845d4e748ec159fab49a9017))
* implement real-time session management via FCM notifications ([c3e7d5f](https://github.com/ADMINASHU/techser-sales-app/commit/c3e7d5fba684aa6824f3cc0d06819a9284193e8f))

### [2.0.1](https://github.com/ADMINASHU/techser-sales-app/compare/v2.0.0...v2.0.1) (2026-01-06)

## [2.0.0](https://github.com/ADMINASHU/techser-sales-app/compare/v1.5.1...v2.0.0) (2026-01-06)


### ⚠ BREAKING CHANGES

* Users must re-grant notification permissions and configure FCM environment variables

### Features

* Add clear all notifications feature ([8fd666f](https://github.com/ADMINASHU/techser-sales-app/commit/8fd666f51320f75f7145796ab6833f42f3c308ed))
* add EntryMap component to visualize customer and stamp locations with distance calculations ([deccd00](https://github.com/ADMINASHU/techser-sales-app/commit/deccd0065d305b46de187993ccc72e0dd335e3f8))
* add Knock client provider for real-time and push notification management ([2e5e234](https://github.com/ADMINASHU/techser-sales-app/commit/2e5e2343b6a3cdae32804d78e9f7e46e6e4ef1fd))
* Add Knock client provider to enable in-app and push notifications. ([dc9f605](https://github.com/ADMINASHU/techser-sales-app/commit/dc9f605a5b9d0bce1960931a2b72fb38f4b43675))
* Add Knock notification provider with push notification management and real-time listening. ([06e2f35](https://github.com/ADMINASHU/techser-sales-app/commit/06e2f35af49279ca2b5c143c50c34ac0317fce8e))
* Add KnockClientProvider for integrating Knock notification services, including push notification registration and realtime listening. ([7d90cb0](https://github.com/ADMINASHU/techser-sales-app/commit/7d90cb05e1981a1fb08857687985e4bcb4c76b75))
* Add KnockClientProvider to initialize Knock notification services and register push notifications. ([29c13c4](https://github.com/ADMINASHU/techser-sales-app/commit/29c13c4be579ad05b0f537a6cc73e7516736fb70))
* add protected layout with authentication and profile setup checks ([3fa952b](https://github.com/ADMINASHU/techser-sales-app/commit/3fa952b03dbc5e5bc35493180ae0da1c381018d9))
* complete notification system migration and entry UI refinement ([6ac9fb1](https://github.com/ADMINASHU/techser-sales-app/commit/6ac9fb10ba6c3df945623eaa6b5522eed30b14d9))
* Enforce permissions for stamping actions ([ae1d5bd](https://github.com/ADMINASHU/techser-sales-app/commit/ae1d5bda78a19fafa47a1bd32d54c2a578a99b60))
* integrate Knock for real-time notifications, including push notification registration and a listener for user account and role updates. ([4b7bdf7](https://github.com/ADMINASHU/techser-sales-app/commit/4b7bdf7e661ca1597ba46784138138401435419a))
* Introduce KnockClientProvider to set up real-time and push notification services. ([562676b](https://github.com/ADMINASHU/techser-sales-app/commit/562676b85600b9926c6d2b959d91b58d503d185a))
* Replace Knock notifications with FCM push notifications ([b56019a](https://github.com/ADMINASHU/techser-sales-app/commit/b56019a4d80605d32bdaec4834fa2025f86017fb))
* Send FCM notification to admins on stamp out with entry link ([647dcf1](https://github.com/ADMINASHU/techser-sales-app/commit/647dcf17b9bc223be77391e95a857524af36a8bc))


### Bug Fixes

* Add missing Bell icon import to NotificationDropdown ([cc24ebd](https://github.com/ADMINASHU/techser-sales-app/commit/cc24ebde800dba5ab185837ec6ee448973f5c8fc))
* move KnockFeedProvider to component level to prevent WebSocket loop ([816a1c5](https://github.com/ADMINASHU/techser-sales-app/commit/816a1c50c4e9bd5122454886186b5fed0d79b9d2))
* only render NotificationFeedPopover when visible to prevent WebSocket loop ([4055a61](https://github.com/ADMINASHU/techser-sales-app/commit/4055a614ccde153e3e8e59f23b88a615107f5051))
* remove isClient check to fix useKnockFeed context error ([266ea6a](https://github.com/ADMINASHU/techser-sales-app/commit/266ea6a62f99773ef5e9e81bdbccc1ad3b0c48f4))
* remove useKnockFeed from NotificationFeed to prevent WebSocket loop ([ecaa45b](https://github.com/ADMINASHU/techser-sales-app/commit/ecaa45be0674116410fdb0caafb3425f60370e25))
* Replace Knock imports with FCM in server actions ([3f72796](https://github.com/ADMINASHU/techser-sales-app/commit/3f727967fb10d57ffeb8c5a1c421e75f5db89384))
* revert to v1.0.0 Knock implementation ([32551c4](https://github.com/ADMINASHU/techser-sales-app/commit/32551c48b63cd20d2c3b1a8cf50d1a4ab17ff318))
* revert to v1.3.0 Knock implementation that was working ([10950a7](https://github.com/ADMINASHU/techser-sales-app/commit/10950a7e7bc1fab36f0bac2dcb90e0540d7fb598))
* Serialize notification _id to id for React key compatibility ([0f184c8](https://github.com/ADMINASHU/techser-sales-app/commit/0f184c8add96827ce2b8e2853a93f22584df054e))

### [1.5.1](https://github.com/ADMINASHU/techser-sales-app/compare/v1.5.0...v1.5.1) (2026-01-03)


### Bug Fixes

* resolve admin log display issues, map distance formatting, and accessibility errors ([6a5075a](https://github.com/ADMINASHU/techser-sales-app/commit/6a5075abc5e3fd4f547dbee2403984db2f1dcfa9))

## [1.5.0](https://github.com/ADMINASHU/techser-sales-app/compare/v1.4.0...v1.5.0) (2026-01-03)


### Features

* Add new Navbar and CustomerActionCard components for site navigation and customer check-in/out functionality. ([80fda8f](https://github.com/ADMINASHU/techser-sales-app/commit/80fda8f8081d0515fcb891add59a5723715bd29c))
* Implement EntryMap component displaying Google Maps with location, stamp markers, and distance info. ([3cd7580](https://github.com/ADMINASHU/techser-sales-app/commit/3cd75804a830ecabda7cfdcfad471e31371377e2))
* implement NextAuth authentication with Google and credentials providers, and a dynamic Navbar component. ([57de77d](https://github.com/ADMINASHU/techser-sales-app/commit/57de77dd06bcf5ba7ef00d0b2d4132a6e15a88e1))


### Performance Improvements

* optimize network performance and fix authentication issues ([f175ec3](https://github.com/ADMINASHU/techser-sales-app/commit/f175ec308c286c882f9c207a1f4497eeae650fb2))

### [1.3.1](https://github.com/ADMINASHU/techser-sales-app/compare/v1.3.0...v1.3.1) (2026-01-02)


### Bug Fixes

* remove stamp actions from detail views to enforce customer log workflow ([3d16de1](https://github.com/ADMINASHU/techser-sales-app/commit/3d16de1d50220905e462f043af10d3e7bfb02341))


### Performance Improvements

* optimize stampOut speed by moving sync to background ([9ff61ed](https://github.com/ADMINASHU/techser-sales-app/commit/9ff61ed912d8f841b9d14132276a4df63c7e12ac))

## [1.3.0](https://github.com/ADMINASHU/techser-sales-app/compare/v1.2.0...v1.3.0) (2026-01-02)


### Features

* Add server actions for entry management, customer stamp in/out, and Google Sheets integration. ([6540915](https://github.com/ADMINASHU/techser-sales-app/commit/65409159d1ffecbf5ddcccabdb8e16b27f9dbe20))
* Implement initial authentication, login page, core sales entry management (create, update, stamp-in), and related UI and admin actions. ([afb25e7](https://github.com/ADMINASHU/techser-sales-app/commit/afb25e74cfd4a07d29e41d7823e81e3b9d0611d6))
* Implement NextAuth for user authentication with Google and Credentials providers, including JWT and session management. ([1f9946b](https://github.com/ADMINASHU/techser-sales-app/commit/1f9946b0b8ad573f0e4c02f8a373cc2351171c04))
* Implement unified customer stamp actions and new entry creation with Google Sheets integration and Zod validation. ([82e6251](https://github.com/ADMINASHU/techser-sales-app/commit/82e625107a1638fd108bfe6cf00b88f20a8ab35a))
* restrict features page access to admin only ([c094af1](https://github.com/ADMINASHU/techser-sales-app/commit/c094af1fce748207070e2f7cff3e587c91493643))
* update check-in label to check-in/out ([be49c8c](https://github.com/ADMINASHU/techser-sales-app/commit/be49c8c997055b9372e48f935eef443cfdbb0854))


### Performance Improvements

* optimize stamp actions for mobile and async sheet sync ([17dc7e9](https://github.com/ADMINASHU/techser-sales-app/commit/17dc7e97830f3daa98427e68c3d80c4354920741))

## [1.2.0](https://github.com/ADMINASHU/techser-sales-app/compare/v1.0.1...v1.2.0) (2026-01-01)


### Features

* Add duplicate customer detection and active/inactive status toggle ([0a17128](https://github.com/ADMINASHU/techser-sales-app/commit/0a1712859e5cab20dcfbe69d47dbd779fe546b91))
* Add entry details and admin details modals with dynamic map, location tracking, and new report actions. ([49dd6ae](https://github.com/ADMINASHU/techser-sales-app/commit/49dd6aecc13ce175b170e24a7ca2fa5cef0db10d))
* Add global styling, customer action card for stamping, and infinite list components. ([db80035](https://github.com/ADMINASHU/techser-sales-app/commit/db8003565fea7e18ec329e8d121f45a0e00f69fd))
* Implement comprehensive entry management with data model, server actions, UI components, and Google Sheets integration. ([6ca10fa](https://github.com/ADMINASHU/techser-sales-app/commit/6ca10fa950db8219d8ee93472afeb20be76c7c44))
* Introduce user login page, authentication actions, and initial user and admin dashboard components. ([1d15e54](https://github.com/ADMINASHU/techser-sales-app/commit/1d15e54aaf70ae9dbe9c1054a17060b63e4c5068))


### Bug Fixes

* ensure live sync setting is respected and optimize stamp actions ([5947f4f](https://github.com/ADMINASHU/techser-sales-app/commit/5947f4f8d5e3491bb89542f7e7e17b98e827c23b))

### [1.1.3](https://github.com/ADMINASHU/techser-sales-app/compare/v1.1.2...v1.1.3) (2026-01-01)

### Features

- Performance: Removed redundant database fetch in `stampIn` action for faster response times.
- Cleanup: Removed "Created Entry" notification to reduce alert noise.
- Cleanup: Removed unused "New Entry" button code from Entry Log page.

### Bug Fixes

- DuplicateCustomerWarning: Fixed unescaped apostrophe causing build errors.
- LocationPicker: Removed redundant lint suppression.

### [1.1.2](https://github.com/ADMINASHU/techser-sales-app/compare/v1.1.1...v1.1.2) (2026-01-01)

### Features

- Global Live Sync Toggle: Added a global Admin setting to toggle real-time Google Sheet synchronization ON/OFF.
- Performance: Parallelized notification and sync tasks in `stampIn`, `stampOut`, and `createEntry` for faster UI response.

### Bug Fixes

- Data Integrity: Fixed missing customer details (Address, Contact) in Google Sheet syncs by enforcing data population before upload.
- LocationPicker: Fixed `useEffect` dependency warnings to prevent build errors and excessive re-renders.

### [1.1.1](https://github.com/ADMINASHU/techser-sales-app/compare/v1.1.0...v1.1.1) (2026-01-01)

### Features

- Features Page: Comprehensive update to "Features & Specifications" page including new capabilities (Duplicate Shield, Geospatial Intelligence, Lifecycle Management).
- Documentation: Clarified "Visit Location Verification" (event-based) vs. continuous tracking.

### Bug Fixes

- LocationPicker: Fixed infinite loop in `useEffect` causing excessive re-renders/geocoding calls.
- Cleanup: Removed unused imports and fixed Accordion numbering in Features page.
- Styling: Fixed CSS lint warnings in Features page.

### [1.1.0](https://github.com/ADMINASHU/techser-sales-app/compare/v1.0.3...v1.1.0) (2026-01-01)

### Features

- Removed "Purpose" column to streamline data.
- Updated Date format to `dd/MM/yyyy` (removed time component).
- Populated missing Customer Address and Contact details from Customer database.
- Excel Export: Updated export format to match Google Sheets (Date only, no Purpose).
- Dashboard: Renamed "Pending" status card to "In Process" for clarity.

### Bug Fixes

- Sync Stability: Fixed issue where sync reported "Failed" despite success (Row ID logic).
- Mobile UI: Fixed Admin Entry Details modal width and scrolling issues on mobile devices.

### [1.0.3](https://github.com/ADMINASHU/techser-sales-app/compare/v1.0.2...v1.0.3) (2026-01-01)

### Performance Improvements

- Implemented `react-virtuoso` for Infinite Entry and Customer lists, fixing scroll lag on large datasets.
- Replaced JS-based responsiveness with pure CSS (`lg:hidden` classes) to eliminate layout shifts.
- Disabled expensive `backdrop-blur` effects on mobile devices for improved GPU performance.
- Fixed "sticky" hover states on touch devices using `@media (hover: hover)`.
- Reduced initial data fetch limit from 18 to 10 items for faster load times.
- Memoized `EntryCard` and `CustomerCard` components to prevent unnecessary re-renders.
- Fixed duplicate CSS imports in `layout.js`.

### [1.0.2](https://github.com/ADMINASHU/techser-sales-app/compare/v1.0.1...v1.0.2) (2026-01-01)

### Features

- Duplicate Detection: Add proximity-based duplicate customer detection ([0a17128](https://github.com/ADMINASHU/techser-sales-app/commit/0a17128))

- Implemented 50-meter threshold using Haversine formula for accurate distance calculation
- Created warning dialog showing nearby customers with distances
- Added geospatial utilities and server actions for duplicate checking
- Integrated into customer form with loading states
- Skip duplicate check in edit mode to avoid false positives

- Customer Status: Add active/inactive status toggle for customer management ([0a17128](https://github.com/ADMINASHU/techser-sales-app/commit/0a17128))
- Added `isActive` field to Customer schema with database index
- Created interactive toggle switch in customer form and cards
- Implemented quick status toggle server action
- Updated check-in page to show only active customers
- Added activeOnly filter parameter to customer queries

### [1.0.1](https://github.com/ADMINASHU/techser-sales-app/compare/v1.0.0...v1.0.1) (2025-12-31)

### Features

- refine Admin Visit Details modal UI and fix map coordinates in Admin view ([cecc553](https://github.com/ADMINASHU/techser-sales-app/commit/cecc553331d3e0a2c0d725ebcdc937d35457788c))

## [1.0.0](https://github.com/ADMINASHU/techser-sales-app/compare/v0.2.13...v1.0.0) (2025-12-31)

### ⚠ BREAKING CHANGES

- User page layout significantly redesigned

### Features

- Add entry management with server actions for CRUD, stamping, Google Sheets integration, admin notifications, and new UI components. ([61beaec](https://github.com/ADMINASHU/techser-sales-app/commit/61beaecd8a22f5bf2ae4e581676bd3a374ebc23f))
- redesign profile page UI with icons and skeleton loading ([3870a93](https://github.com/ADMINASHU/techser-sales-app/commit/3870a93a59e5ee1ef7d5f29eb05eace0f2ee0196))

### [0.2.13](https://github.com/ADMINASHU/techser-sales-app/compare/v0.2.12...v0.2.13) (2025-12-31)

### Features

- add features and specifications page for the sales application. ([661799b](https://github.com/ADMINASHU/techser-sales-app/commit/661799b0d293f85f963d4ff546ee76a4eac81468))
- Implement core customer and entry management, user dashboards, and authentication features. ([5490fb8](https://github.com/ADMINASHU/techser-sales-app/commit/5490fb826211e24635aa04f6aa1a19ef4785902d))

### [0.2.12](https://github.com/ADMINASHU/techser-sales-app/compare/v0.2.11...v0.2.12) (2025-12-31)

### Features

- add comprehensive features and specifications page ([64c6d53](https://github.com/ADMINASHU/techser-sales-app/commit/64c6d5366bc499d50f1114c4fa667f8811b7aeb3))

### Bug Fixes

- optimize dashboard performance, fix layout shifts, and adjust logo sizing across auth pages ([25c24fd](https://github.com/ADMINASHU/techser-sales-app/commit/25c24fd295ed3c89530006cbcc269c78073c9065))

### [0.2.11](https://github.com/ADMINASHU/techser-sales-app/compare/v0.2.10...v0.2.11) (2025-12-31)

### Bug Fixes

- ensure stamp in/out date time matches IST local time ([586dd34](https://github.com/ADMINASHU/techser-sales-app/commit/586dd34fa7bfe88b99696b1f6d3f8014edee3fdc))

### [0.2.10](https://github.com/ADMINASHU/techser-sales-app/compare/v0.2.9...v0.2.10) (2025-12-30)

### Features

- Add email and Knock notification utilities, map components for entry and location picking, and real-time notification listener. ([b688ca7](https://github.com/ADMINASHU/techser-sales-app/commit/b688ca70d32a9b1065a6b837833928a3b4928348))
- implement user onboarding flow with profile setup, avatar upload, real-time notifications, and authentication. ([a76ab70](https://github.com/ADMINASHU/techser-sales-app/commit/a76ab708f251d56edcba53cc79c55a532f8431dc))

### [0.2.9](https://github.com/ADMINASHU/techser-sales-app/compare/v0.2.8...v0.2.9) (2025-12-30)

### Features

- Add Knock notification system with client provider, UI feed component, and real-time listener for toast notifications and session updates. ([f85dbd3](https://github.com/ADMINASHU/techser-sales-app/commit/f85dbd3c783c65a981fc772e9140bc1f14793533))
- Add RealtimeNotificationListener component to process real-time notifications from KnockFeed, managing user sessions and status updates. ([a11a603](https://github.com/ADMINASHU/techser-sales-app/commit/a11a60346608f0a23d89a00bc87b0d08aa0c4a92))
- Implement admin user management with Knock notification integration and a new User model. ([e3e1257](https://github.com/ADMINASHU/techser-sales-app/commit/e3e1257ce1f08999f43b665ad3703fd0232a1f4b))
- Implement admin user management, real-time notifications with session updates, and new server actions for user and entry data. ([87594f3](https://github.com/ADMINASHU/techser-sales-app/commit/87594f3a574d678a34d19a08769d14f9f71cfb34))
- implement entry management server actions including CRUD and stamping, and add a real-time notification listener. ([7a2f4bd](https://github.com/ADMINASHU/techser-sales-app/commit/7a2f4bdbd35595197757fd0919820b4c714bccca))
- Implement initial user profile setup, avatar upload, and account verification flow with new user-related components and actions. ([7f3b969](https://github.com/ADMINASHU/techser-sales-app/commit/7f3b9691de2b56bbe37f7b453eec2bf42ebef279))
- Introduce `RealtimeNotificationListener` component to process real-time notifications, update user sessions, and manage logout. ([af3ee8f](https://github.com/ADMINASHU/techser-sales-app/commit/af3ee8f1a9538ed27052a451b54d997e501e6775))
- Introduce admin dashboard with reporting, user management, and entry detail views. ([3e35bff](https://github.com/ADMINASHU/techser-sales-app/commit/3e35bff88ecf9b18b794a8eafa6f18c5164bf735))
- introduce server actions for user administration and entry management, integrating Google Sheets and notification services. ([32c4228](https://github.com/ADMINASHU/techser-sales-app/commit/32c4228a048df2f589f1de8bf1a94a520455457b))

### [0.2.8](https://github.com/ADMINASHU/techser-sales-app/compare/v0.2.7...v0.2.8) (2025-12-27)

### Performance Improvements

- implement streaming for entries and skeleton loaders for dashboard ([d14c9a5](https://github.com/ADMINASHU/techser-sales-app/commit/d14c9a5e86c17d4e7798faa04167265f75c255f5))

### [0.2.7](https://github.com/ADMINASHU/techser-sales-app/compare/v0.2.6...v0.2.7) (2025-12-27)

### Bug Fixes

- remove firebase, resolve duplicate entries and layout duplication ([62eda49](https://github.com/ADMINASHU/techser-sales-app/commit/62eda492b8a68f0b47c0dded9d4640fab5081339))

### [0.2.6](https://github.com/ADMINASHU/techser-sales-app/compare/v0.2.5...v0.2.6) (2025-12-27)

### Bug Fixes

- resolve lint errors, fix LocationPicker input, fix Navbar hydration, and add Knock provider ([a5d3744](https://github.com/ADMINASHU/techser-sales-app/commit/a5d374479c33f2942ade835e4887b0999a932199))

### [0.2.5](https://github.com/ADMINASHU/techser-sales-app/compare/v0.2.4...v0.2.5) (2025-12-26)

### Performance Improvements

- Application optimizations and Year Filter update (2025-2030) ([b6bf47b](https://github.com/ADMINASHU/techser-sales-app/commit/b6bf47b2b41d5a1efe7c74ab049877f3ebba0fad))

### [0.2.4](https://github.com/ADMINASHU/techser-sales-app/compare/v0.2.3...v0.2.4) (2025-12-26)

### Features

- Mobile optimizations, LoadingButton implementation, and bug fixes ([8206c0d](https://github.com/ADMINASHU/techser-sales-app/commit/8206c0d322b062a2438b8fb997a3721072a7008b))

### [0.2.3](https://github.com/ADMINASHU/techser-sales-app/compare/v0.2.2...v0.2.3) (2025-12-26)

### Bug Fixes

- Update sheet sync logic ([db33b5c](https://github.com/ADMINASHU/techser-sales-app/commit/db33b5c6d77fd2acb7a6c1a44e471b98ed4743dc))

### [0.2.2](https://github.com/ADMINASHU/techser-sales-app/compare/v0.2.1...v0.2.2) (2025-12-26)

### Bug Fixes

- Update login footer page UI ([48d0a49](https://github.com/ADMINASHU/techser-sales-app/commit/48d0a49c1c7eff9e63c458a77def28b99f644130))

### [0.2.1](https://github.com/ADMINASHU/techser-sales-app/compare/v0.2.0...v0.2.1) (2025-12-26)

### Bug Fixes

- Fixed version automate and Update releases page UI ([d93465b](https://github.com/ADMINASHU/techser-sales-app/commit/d93465b23dcd4b280ad10e02cf8ea2fd5be2086d))

## [0.2.0](https://github.com/ADMINASHU/techser-sales-app/compare/v0.1.1...v0.2.0) (2025-12-26)

### ⚠ BREAKING CHANGES

- update footer version display

### Features

- update footer version display ([03343e5](https://github.com/ADMINASHU/techser-sales-app/commit/03343e5da9785f42a6132cd54acf608834508608))

### 0.1.1 (2025-12-26)

### Features

- Add `KnockClientProvider` to integrate Knock notification services with session management and custom dark theming. ([5e6b976](https://github.com/ADMINASHU/techser-sales-app/commit/5e6b9769aabb1bed24796a24388dcf72b96244c5))
- add Accordion UI component and its Radix dependency ([ecc1a27](https://github.com/ADMINASHU/techser-sales-app/commit/ecc1a2776bd8a0c7833fb5d44713ab0f4b639dfe))
- add Calendar and Popover UI components along with their dependencies ([be9893f](https://github.com/ADMINASHU/techser-sales-app/commit/be9893f51bca81a954c3053ca24635f6738b9269))
- Add core application layout, navigation, and real-time notification system with Knock integration. ([2e0d6bf](https://github.com/ADMINASHU/techser-sales-app/commit/2e0d6bfa6eb120e570e15dcac56039f2460a3898))
- Add entry detail page with map visualization for entry, stamp-in, and stamp-out locations. ([d52aa8a](https://github.com/ADMINASHU/techser-sales-app/commit/d52aa8a2dedbd5dbe03a0984fdced8a543cf337a))
- Add initial authentication pages, core UI components, and global dark theme styling. ([6e38474](https://github.com/ADMINASHU/techser-sales-app/commit/6e38474e08ba31c841589aed474c190807f1f80a))
- add KnockClientProvider component and axios dependency, and update react-day-picker overrides ([12c8ad4](https://github.com/ADMINASHU/techser-sales-app/commit/12c8ad44606a6c495003e535f692b69e53fe14b9))
- add new server actions for report generation and system statistics, and implement a responsive Navbar component. ([f5e6542](https://github.com/ADMINASHU/techser-sales-app/commit/f5e654252c367e5422c41559cd8556596debf577))
- add package override for `date-fns` within `react-day-picker` ([69ab4c8](https://github.com/ADMINASHU/techser-sales-app/commit/69ab4c8634d2d3b3a8e764ceecc3285d3fde8f54))
- add password reset functionality including forgot and reset password pages, and server-side actions. ([1f35d4e](https://github.com/ADMINASHU/techser-sales-app/commit/1f35d4e778818d2eda81d7d6550ce74ca173133f))
- Add user and admin actions with Knock notifications and a notification feed component. ([bb6af60](https://github.com/ADMINASHU/techser-sales-app/commit/bb6af6061d1b7447240d33dea917c4ee1038be5d))
- Add user profile management, navigation bar, and new entry page. ([6ca56b8](https://github.com/ADMINASHU/techser-sales-app/commit/6ca56b80a6bc4ac4fc72c7c18360f3578c6da9e9))
- Add user profile page, avatar upload component, and Knock notification utility. ([e4a605e](https://github.com/ADMINASHU/techser-sales-app/commit/e4a605e823de85065289becc7e1df8b74a290038))
- Add web app manifest for PWA support. ([dcabc00](https://github.com/ADMINASHU/techser-sales-app/commit/dcabc000c1b014850564402c0a1809f5af94667e))
- Implement a dedicated authentication layout and a responsive, session-aware global navigation bar. ([7397794](https://github.com/ADMINASHU/techser-sales-app/commit/7397794bac4ca90925eb2d17d44a6472155cb634))
- Implement a dynamic dashboard with user and admin views, server actions for reporting and system stats, and Google Sheets integration. ([5212206](https://github.com/ADMINASHU/techser-sales-app/commit/52122064b2322e654ccfb3756f3f2694fcbfc08c))
- Implement a new Footer component and integrate standard-version for automated release management. ([da8fd09](https://github.com/ADMINASHU/techser-sales-app/commit/da8fd09524f6d8e3119545fdce99637238974be0))
- Implement admin and user dashboards, entry detail page, and integrate SWR for data fetching. ([447422a](https://github.com/ADMINASHU/techser-sales-app/commit/447422ab71efe1a583801e8b94522ecb5d8eeee8))
- Implement comprehensive entry management with Knock and Firebase push notification integration. ([310d475](https://github.com/ADMINASHU/techser-sales-app/commit/310d4757ea7d7afc357f77d6021eaefcc8a62ba2))
- Implement comprehensive entry management with location tracking, mapping, and a user dashboard. ([760dd1d](https://github.com/ADMINASHU/techser-sales-app/commit/760dd1d9f558d51bf89b822750a3336c951456c5))
- Implement comprehensive sales entry management with CRUD operations, status updates, filtered retrieval, admin notifications, and Google Sheets integration. ([4845b65](https://github.com/ADMINASHU/techser-sales-app/commit/4845b652756ee7f4e959719df957139ad9c1df78))
- Implement core application layout, navigation, authentication, PWA support, and initial server actions. ([2b8bebc](https://github.com/ADMINASHU/techser-sales-app/commit/2b8bebcd1ed9867a8f44d5d7c79e6490e565736e))
- Implement core application layout, responsive navigation bar with user authentication, and an entry log page with filtering capabilities. ([d6b4e99](https://github.com/ADMINASHU/techser-sales-app/commit/d6b4e9942eda003674e5e24ab4326e484cf22351))
- Implement core application structure including authentication, navigation, footer, and static information pages. ([09513da](https://github.com/ADMINASHU/techser-sales-app/commit/09513da2156b6041caf5d5c2735e12df3508c421))
- implement core application structure including authentication, UI components, and data models. ([08b8913](https://github.com/ADMINASHU/techser-sales-app/commit/08b8913034e55737e68c9b519ff07127e3218ab5))
- Implement dashboard and entries pages with filtering, pagination, and view toggle functionality. ([5262289](https://github.com/ADMINASHU/techser-sales-app/commit/52622896f1ef5ed8f2794fc5fd7fc563d6114da7))
- Implement entry detail and user profile pages, including avatar upload, entry actions, and a new Navbar. ([d9a7d16](https://github.com/ADMINASHU/techser-sales-app/commit/d9a7d16af8155e06fbcbc1efbd0e0b9ecae560dd))
- implement entry filtering and dashboard views for users and admins. ([b36652f](https://github.com/ADMINASHU/techser-sales-app/commit/b36652fb36a5c02dac1638b43752387ebf9fe253))
- Implement entry management with server actions, infinite scrolling list, and dedicated entries page. ([374b516](https://github.com/ADMINASHU/techser-sales-app/commit/374b51630b75a575ac2ca9e804de8cff5963b7cb))
- Implement entry tracking, user dashboard, and admin user management features. ([a8488d7](https://github.com/ADMINASHU/techser-sales-app/commit/a8488d7f21045c23ec1ae4df44fcfd022a9ea261))
- Implement full authentication flow including login, registration, password reset, and add core UI components and Entry model. ([0242511](https://github.com/ADMINASHU/techser-sales-app/commit/02425113d052efc833ca947eabfae5881e28e2ef))
- Implement full CRUD functionality for visit entries including creation, listing, filtering, and deletion. ([890cec9](https://github.com/ADMINASHU/techser-sales-app/commit/890cec92bdbe6d84400574400a5846d67a40201c))
- Implement Google Sheets integration for entry data, admin settings, and notification system. ([4321aa5](https://github.com/ADMINASHU/techser-sales-app/commit/4321aa55467e51e650bfe7596e249813e7a5d3af))
- Implement Knock notification and feed providers, including push notification registration and service worker setup. ([ab51e7e](https://github.com/ADMINASHU/techser-sales-app/commit/ab51e7e650b9cbad3a94c09be890b612e495e286))
- Implement protected admin dashboard with entry filtering, data export, and system statistics. ([5602fa1](https://github.com/ADMINASHU/techser-sales-app/commit/5602fa14d18c7d242a4501112200e230ef234a85))
- implement protected layout and entry log page with filtering and pagination ([fb932ef](https://github.com/ADMINASHU/techser-sales-app/commit/fb932ef48f7812840fca6d0841dde37960e3ec9c))
- Implement root layout and integrate Vercel Analytics, Speed Insights, theme provider, and Knock client. ([4dc2c8f](https://github.com/ADMINASHU/techser-sales-app/commit/4dc2c8fde6a798665d5245e2c9549f309780bfa4))
- Implement user authentication flows including login, registration, forgot password, and initial profile setup. ([dbd5a07](https://github.com/ADMINASHU/techser-sales-app/commit/dbd5a071b9f41a359226720924f647705a32c586))
- Implement user profile management, password change functionality, and a new Navbar with user menu and notifications. ([95bf522](https://github.com/ADMINASHU/techser-sales-app/commit/95bf522a8c9b034649f6932b636b38ab91fe99ab))
- Implement user profile page with avatar upload and location entry map component ([83f2d19](https://github.com/ADMINASHU/techser-sales-app/commit/83f2d198c7d180856887068a56b47571786b7589))
- implement view toggle for entries page, allowing grid and list displays with dedicated components for each layout. ([3e5a11d](https://github.com/ADMINASHU/techser-sales-app/commit/3e5a11de26dd4d60337e742babba1bae2ce676f3))
- Introduce a new Navbar component with navigation and user authentication, alongside an app icon and a placeholder service worker. ([ed231d4](https://github.com/ADMINASHU/techser-sales-app/commit/ed231d4d22929fe5a385c8b09d3f27b824d18aa5))
- Introduce admin dashboard, user management, entry management, and reporting features with new UI components and server actions. ([b1aba6b](https://github.com/ADMINASHU/techser-sales-app/commit/b1aba6b7735e3acc46441c9287ddd8e99d1a98d7))
- Introduce comprehensive user and location management, entry creation, reporting, and admin dashboards with initial data seeding. ([01da2c3](https://github.com/ADMINASHU/techser-sales-app/commit/01da2c32f6e27ecfc82650a5825b381bacd56b65))
- Set up NextAuth for user authentication and create a protected entries log with filtering, pagination, and role-based access. ([796c6c8](https://github.com/ADMINASHU/techser-sales-app/commit/796c6c84288f8dd4fef93124f005091e7f208179))

### Bug Fixes

- Add trustHost for Vercel OAuth HTTPS redirect ([c868c90](https://github.com/ADMINASHU/techser-sales-app/commit/c868c90d16b09fc1248600537156b87667816681))
- Rename middleware.js to proxy.js for Next.js 16 ([841a309](https://github.com/ADMINASHU/techser-sales-app/commit/841a3095d0ea3dcd07cc7aef6098351ccd80de9e))
