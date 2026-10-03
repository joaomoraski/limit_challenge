# Fleet Maintenance API Take-home Challenge

Build a REST API for managing a fleet of vehicles and their maintenance history.

Use Python, Django and Django REST Framework.

The API does not need authentication or a frontend.

## Domain

A company owns vehicles that are assigned to offices around the country.
Vehicles periodically receive maintenance services performed by mechanics.
A vehicle may have many maintenance records.
A mechanic may service many vehicles.
Each office has many vehicles.

Offices

An office has:
* name
* city

Vehicles

A vehicle has:
* VIN (Vehicle Identification Number)
* license plate
* make
* model
* year
* office
* active flag

A VIN must uniquely identify a vehicle.
A license plate cannot be shared by two active vehicles.

Provide CRUD endpoints.

A mechanic has:

name
certification number
active flag

Provide CRUD endpoints.

Maintenance Records

A maintenance record contains:

vehicle
mechanic
maintenance date
maintenance type
cost
notes

Provide CRUD endpoints.

## API endpoints

1. CRUD endpoints for offices, vehicles, mechanics and maintenance records.

2. Office summary

It should return every office together with:
* number of active vehicles
* total maintenance cost during the last 12 months
* date of the most recent maintenance performed on any vehicle in that office

Example:
[
    {
        "name": "New York",
        "city": "New York",
        "active_vehicle_count": 42,
        "maintenance_cost_last_year": 81250.50,
        "last_maintenance": "2025-02-18"
    }
]

3. Vehicle search

It should support optional filtering by any combination of:

* office
* active/inactive
* make
* model
* maintenance performed between two dates
* mechanic certification number

4. Vehicle details

Return vehicle details together with:
* office information
* complete maintenance history
* mechanic information for each maintenance record

The endpoint should perform well when a vehicle has hundreds of maintenance records.

5. Vehicle maintenance history

Provide an endpoint that returns the maintenance history for a single vehicle ordered from newest to oldest.

6. Assign vehicle

Provide an endpoint that moves a vehicle from one office to another.

The endpoint should record only the new office assignment.

7. Mechanic workload

It should return:
* mechanic name
* number of maintenance records completed during the current year
* total maintenance cost of work performed during the current year

Order mechanics from busiest to least busy.

8. Vehicles needing maintenance

It should return all active vehicles that satisfy either of the following:
* have never received maintenance
* last maintenance was more than 365 days ago

Order by oldest maintenance first.

9. Duplicate vehicle check

Given VIN and license plate, it should return whether another conflicting vehicle already exists and identifies the conflicting fields.

Example:

{
    "conflicts": [
        "vin",
        "license_plate"
    ]
}

## Front-end

If you know React, implement a front-end that uses the CRUD endpoints, the vehicle search one 
and another endpoint you choose.

The Next.js 16 + React 19 app in `frontend/` is pre-wired for this challenge. Material UI handles
layout, axios powers HTTP requests, and `@tanstack/react-query` is ready for data fetching. 

## Error Handling

Return appropriate HTTP status codes for invalid requests.
Validation errors should include meaningful messages.

## Project Structure

- `backend/`: Empty Django project.
- `frontend/`: Empty Next.js app.

## Getting Started

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Frontend

```bash
cd frontend
npm install
# NEXT_PUBLIC_API_BASE_URL defaults to http://localhost:8000/api
npm run dev
```

Visit `http://localhost:3000` in your web browser to run it.

## Deliverables

source code
database migrations
a Django management command that fills the database with dummy data to make manually testing your app easier (suggestion: use the faker Python library)
README describing:
  how to run the project
  how to run tests
  assumptions made
  chosen tradeoffs  
if front-end was implemented, record and share a brief video (max 2 minutes) demonstrating the frontend working end-to-end with the backend.

## Evaluation Criteria

- **Backend (50%)** – API design, database queries performance, appropriate use of Django and Django Rest Framework
- **Frontend (25%)** – UX clarity, filter UX tied to query params, state/data management, handling
  of loading/empty/error cases, and overall polish.
- **Code Quality (15%)** – Code structure, testing where it adds value, documentation/readability, naming
- **Product Thinking (10%)** – Workflow clarity, assumptions noted, and thoughtful UX details (if front-end is implemented)

## Optional Bonus

Authentication using JWT is not required but welcome if time allows.

---

## Solution

### Running the project

The project runs entirely in Docker. From `backend_focused/`:

```bash
docker compose up -d
```

This starts the backend (Django on port 8000) and frontend (Next.js on port 3000). On first run, the backend installs dependencies, runs migrations, and starts the dev server automatically.

To populate the database with sample data:

```bash
docker compose exec backend python manage.py seed
```

Use `--clear` to wipe existing data first. The command creates 5 offices, 30 vehicles, 10 mechanics, and 100+ maintenance records with realistic data.

To enter either container:

```bash
docker compose exec backend bash
docker compose exec frontend bash
```

### Running tests

```bash
docker compose exec backend python -m pytest fleet/tests/ -v
```

62 tests covering model constraints, CRUD operations, and all 9 specialized endpoints.

### API endpoints

All endpoints live under `/api/`. The DRF browsable API is available at `http://localhost:8000/api/`.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/offices/` | CRUD | Offices |
| `/api/offices/summary/` | GET | Office summary with vehicle counts and maintenance costs |
| `/api/vehicles/` | CRUD | Vehicles |
| `/api/vehicles/search/` | GET | Vehicle search with filters (office, is_active, make, model, maintenance dates, mechanic cert) |
| `/api/vehicles/{id}/` | GET | Vehicle detail with nested office and maintenance history |
| `/api/vehicles/{id}/maintenance-history/` | GET | Paginated maintenance history for a vehicle |
| `/api/vehicles/{id}/assign/` | POST | Reassign vehicle to a different office |
| `/api/vehicles/needing-maintenance/` | GET | Active vehicles never maintained or overdue (>365 days) |
| `/api/vehicles/duplicate-check/` | POST | Check for VIN/license plate conflicts before creating |
| `/api/mechanics/` | CRUD | Mechanics |
| `/api/mechanics/workload/` | GET | Mechanic workload ranked by records this year |
| `/api/maintenance-records/` | CRUD | Maintenance records |

### Architecture

The backend follows a service layer pattern:

- **Models** define the schema with database-level constraints (partial unique index on active license plates, composite indexes for frequent queries).
- **Services** (`fleet/services.py`) encapsulate complex query logic — aggregations, dynamic filters, annotated querysets. This keeps views thin and makes the query logic independently testable.
- **Views** handle HTTP concerns only. `ModelViewSet` for CRUD, `@action` decorators for specialized endpoints.
- **Serializers** handle validation and representation. Separate serializers where the input/output shapes differ (vehicle detail vs. vehicle list, office summary vs. office CRUD).

### Frontend

Built with the provided scaffold (Next.js 16 + React 19 + MUI v7 + React Query v5).

Pages implemented:
- **Dashboard** — stat cards (total vehicles, active, offices, needing maintenance) + quick action links
- **Vehicles** — search with 7 filters tied to URL query params (debounced text inputs), CRUD, pagination
- **Vehicle detail** — nested office info, maintenance history, reassign dialog, add maintenance record
- **Vehicles needing maintenance** — dedicated page for overdue vehicles
- **Duplicate check** — form to verify VIN/plate before registration
- **Offices** — summary cards (active vehicles, 12-month cost, last maintenance date) + manage tab with CRUD
- **Mechanics** — CRUD table + workload tab showing current year stats
- **Maintenance records** — CRUD with vehicle/mechanic dropdowns

The extra endpoint I chose for the frontend is **Office Summary** — it's the most visually informative, with aggregate counts, monetary values, and dates that translate well into summary cards.

### Assumptions

- **Single-tenant system.** The spec says "a company owns vehicles" — there's no multi-company model. All offices, vehicles, and mechanics belong to one organization.
- **VIN is globally unique.** Regardless of active/inactive status. A VIN identifies a physical vehicle — it can't be reused.
- **License plate uniqueness is scoped to active vehicles only.** An inactive vehicle's plate can be reused by a new active vehicle (common when a vehicle is decommissioned and its plate is reassigned).
- **"Last 12 months" means the last 365 days from today**, not a calendar year. This avoids edge cases around year boundaries.
- **Assigning a vehicle to its current office is a no-op**, not an error. The operation is idempotent.
- **Deleting an office or mechanic with associated records is blocked** (HTTP 409). This prevents accidental data loss. Vehicles must be reassigned or deleted first.
- **Deleting a vehicle cascades to its maintenance records.** Records don't make sense without the vehicle they belong to.
- **Maintenance dates cannot be in the future.** A maintenance record is something that happened, not a scheduled event.
- **VIN and license plate are normalized to uppercase on save.** Prevents case-sensitivity issues in uniqueness checks.
- **SQLite is kept as the database.** The challenge doesn't require PostgreSQL-specific features, and SQLite handles all the queries (including partial unique indexes) correctly.

### Tradeoffs

- **Service layer vs. fat views.** I extracted query logic into `services.py` instead of putting everything in viewsets. This adds a file but keeps each layer focused — views handle HTTP, services handle business queries. For a project this size, putting everything in views would also be reasonable.
- **Manual Q() filters vs. django-filter.** The vehicle search uses hand-built Q() chains instead of the django-filter library. The search has 6 optional parameters with custom logic (date ranges, cross-table joins via mechanic cert), and django-filter would need as much configuration as the manual approach while adding a dependency.
- **No authentication.** The spec says "The API does not need authentication." JWT auth would be the next step if this were production.
- **No admin panel.** Time was better spent on the API and frontend. The DRF browsable API serves the same purpose for manual data inspection.
- **Pagination is server-side only (page number).** Cursor pagination would be more efficient for large datasets, but page number pagination is simpler and matches what the frontend needs for "Page X of Y" display.
- **Frontend dropdowns fetch all items.** For selects (office, mechanic), the frontend requests all records via `?page_size=999` instead of implementing search-as-you-type. With the expected data volume (tens of offices, dozens of mechanics), this is simpler and performs fine. For thousands of records, an autocomplete with server-side search would be better.
