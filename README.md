# Obsidian Game Club

A production-ready Django game platform with 10 browser games, Apple Game Center-inspired UI.

## Games
1. ARCANA: Night City Tarot (Mystical)
2. Neon Blocks (Puzzle) — extracted from Pixel Realms
3. Neural Grid (Strategy) — extracted from Pixel Realms
4. Tic-Tac-Toe (Classic) — extracted from Pixel Realms
5. CheckMate (Chess)
6. CosmoDrome (Racing)
7. Skyfold Aviary (Arcade) — extracted from Driftline Arcade
8. VoidRunner (Action) — extracted from Driftline Arcade
9. Monarch Room (Card)
10. Aurum Maze (Arcade)

## Setup (local development)

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py seed              # loads the game catalog (safe to re-run)
python manage.py createsuperuser
python manage.py collectstatic
python manage.py runserver
```

## Adding a New Game

1. Copy game folder into `games_static/`
2. Create Genre if needed (Django admin or fixture)
3. Create Game via admin at `/admin/` or add to `fixtures/initial_data.json`
   - Set `game_folder` = path relative to `games_static/`
   - Set `game_entry` = entry HTML file (usually `index.html`)
   - Set `thumbnail`/`banner` to a `.webp` cover path relative to `games_static/`
4. Run `python manage.py collectstatic`

## Brand

Site name and tagline are centralized in `obsidian/settings.py` (`SITE_NAME`,
`SITE_TAGLINE`, `SITE_FULL_NAME`) and exposed to every template via
`store.context_processors.global_context`. Update those three values to
re-brand the whole site without touching individual templates.

## Deploying to Railway

This repo is Railway-ready out of the box — a `railway.json` and `Procfile`
are already included, and settings.py reads everything from environment
variables with safe production defaults.

1. Push this folder to a GitHub repo (or use `railway up` from the CLI).
2. In Railway: **New Project → Deploy from GitHub repo**, pick this repo.
3. *(Recommended)* Add a **PostgreSQL** plugin — Railway sets `DATABASE_URL`
   automatically and the app will pick it up on the next deploy. Without it,
   the app falls back to local SQLite, which is fine for a demo but resets
   on every redeploy since the filesystem isn't persistent.
4. Set these variables under the service's **Variables** tab (see
   `.env.example` for the full list with descriptions):
   - `SECRET_KEY` — any long random string
   - `DEBUG` — `False`
   - `DJANGO_SUPERUSER_USERNAME` / `DJANGO_SUPERUSER_EMAIL` / `DJANGO_SUPERUSER_PASSWORD`
     — creates your admin login automatically on first deploy
5. Deploy. Railway builds with Nixpacks (Python auto-detected via
   `requirements.txt` + `.python-version`) and runs the start command from
   `railway.json`, which on every boot: applies migrations, seeds the game
   catalog **only if empty**, bootstraps the admin user **only if missing**,
   collects static files, then starts Gunicorn. All of these steps are
   idempotent, so redeploys never fail on "already exists" errors.
6. Visit `https://<your-app>.up.railway.app/admin/` and sign in with the
   superuser credentials you set in step 4.

No `ALLOWED_HOSTS` or `CSRF_TRUSTED_ORIGINS` configuration is required for
the default Railway domain — it's detected automatically via the
`RAILWAY_PUBLIC_DOMAIN` variable Railway injects. Only set those two
variables if you're attaching a custom domain.

## Admin
URL: `/admin/`  Local dev default: create one with `python manage.py createsuperuser`
