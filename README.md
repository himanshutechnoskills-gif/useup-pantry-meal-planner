# UseUp — Pantry & Meal Planner

A practical household app for keeping track of ingredients, using food before it expires, finding meals from what is already at home, planning dinners and maintaining a shared-style shopping checklist.

**Stack:** React, Vite, Node.js, Express, plain JavaScript, JSON-file persistence.

> This is a local portfolio project and learning application. It is not a nutrition or food-safety product. Expiry dates are user-entered reminders, not safety guarantees.

## Why this project?

The daily problem is familiar: people forget what is in the fridge, buy duplicates, let ingredients go unused and spend time deciding what to cook. UseUp brings those jobs into one simple workflow:

1. Add ingredients and their quantities, storage location and best-before date.
2. See what should be used soon.
3. Browse recipes ranked by how many ingredients are already in the pantry.
4. Add missing recipe ingredients to the shopping list without duplicating existing entries.
5. Plan a dinner for the next seven days.
6. Mark a recipe as cooked; compatible pantry quantities are reduced when the units match and there is enough stock.

The recommendation is intentionally transparent and rule-based: `matched ingredients / total recipe ingredients`. It does not use an AI model or make nutritional claims.

## Main features

- **Overview:** pantry count, items due soon, open shopping count, upcoming meals and a meal suggestion.
- **Pantry:** add/remove ingredients, adjust quantities, categories, storage locations and optional expiry dates.
- **Recipe finder:** search, filter by meal type, view ingredients and cooking steps, see pantry-match percentage.
- **Meal planner:** plan or replace one dinner slot per day for the next seven days.
- **Shopping list:** add items, tick purchased items and remove entries.
- **Persistent local data:** Express writes changes to `server/data/store.json`, which is created on first run.

## Requirements

- Node.js 18 or newer
- npm
- VS Code or another code editor

No external database or API key is required.

## Run locally

From the project root (the folder containing this README):

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. The Express API runs at **http://localhost:5000**.

Check the backend status at:

```text
http://localhost:5000/api/health
```

For a production frontend build:

```bash
npm run build
```

Run the backend logic tests:

```bash
npm test
```

To reset the sample pantry and shopping list, stop the server and delete `server/data/store.json`. The server will recreate it with sample data on the next start. Your local store file is ignored by Git.

## Validation status

The included backend logic suite currently contains six tests covering calendar-date handling, expiry labels, recipe matching and ranking, duplicate-safe shopping-list additions, and conservative pantry quantity deductions. Run it with `npm test`.

The source was also checked for Node.js syntax errors, and the React JSX files were transpiled for syntax validation. A full Vite production build and browser/API integration run still need to be completed on a machine where npm can download the declared dependencies. In the packaging environment, requests to `registry.npmjs.org` failed with a DNS `EAI_AGAIN` error, so dependency installation could not complete there. After installing locally, run `npm run build` and start the app with `npm run dev`.

## Project structure

```text
useup/
├── client/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx          # Pages, state and user interactions
│       ├── api.js           # Small fetch helper
│       ├── main.jsx         # React entry point
│       └── styles.css       # Responsive visual design
├── server/
│   ├── data/                # Local JSON store is created here
│   ├── src/
│   │   ├── index.js         # Express routes
│   │   ├── logic.js         # Recipe matching, expiry and quantity rules
│   │   ├── recipes.js       # Editable recipe starter data
│   │   └── store.js         # File persistence
│   └── tests/
│       └── logic.test.js
├── .gitignore
├── package.json
└── README.md
```

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API health check |
| GET | `/api/dashboard` | Overview statistics and suggestions |
| GET | `/api/pantry` | List pantry ingredients |
| POST | `/api/pantry` | Add an ingredient |
| PATCH | `/api/pantry/:id` | Update an ingredient |
| DELETE | `/api/pantry/:id` | Remove an ingredient |
| GET | `/api/recipes` | Recipes with pantry-match scores |
| POST | `/api/recipes/:id/add-missing` | Add missing recipe ingredients to shopping |
| POST | `/api/recipes/:id/cook` | Record cooking and reduce compatible stock |
| GET | `/api/shopping` | List shopping items |
| POST | `/api/shopping` | Add a shopping item |
| PATCH | `/api/shopping/:id` | Mark purchased / update item |
| DELETE | `/api/shopping/:id` | Remove a shopping item |
| GET | `/api/meal-plan` | List planned meals |
| PUT | `/api/meal-plan/:date` | Create or replace a dinner plan |
| DELETE | `/api/meal-plan/:id` | Remove a planned meal |

## Important implementation decisions

- Components use familiar React patterns: `useState`, `useEffect`, props, controlled forms and array methods.
- The frontend never writes directly to the data file. Changes go through Express routes.
- API inputs are validated before records are saved.
- File writes are queued and written through a temporary file before rename, reducing the chance of partially written data when requests arrive close together.
- Recipe stock is reduced only when ingredient names match, measurement units are compatible and available quantity is sufficient. The app skips uncertain conversions instead of guessing.
- Recipe matching is deterministic, easy to inspect and easy to test.

## Current limitations

- This starter version is designed for one local household/workspace. It does not include user accounts, cloud sync or multi-user access control.
- Data is stored in a local JSON file, not PostgreSQL/MySQL. A database migration is a sensible next step for a deployed multi-user version.
- The recipe collection is starter content, not a complete food database. Quantities are illustrative and recipes may need user adjustment.
- Expiry reminders are shown in the app; browser push notifications and email alerts are not included.
- Cooking only subtracts stock when measurement units can be safely compared. It does not perform cup-to-gram or other ingredient-specific conversions.
- No payment, grocery delivery or external retailer integration is included.

## Good next improvements

1. Add user accounts and household sharing.
2. Move persistence from JSON to PostgreSQL or MySQL.
3. Add notifications for items approaching their best-before date.
4. Add recipe creation and import from a URL.
5. Add barcode scanning and a mobile-friendly installable PWA.
6. Add integration tests for API routes and deploy the app.

## Portfolio note

Describe only features you have run and can explain. Be ready to explain the recipe score, duplicate handling in grocery additions, the stock-unit safety rule, Express validation and the local persistence approach.
