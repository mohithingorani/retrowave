.PHONY: dev dev-backend dev-frontend dev-db build prod stop logs clean setup seed db-shell redis-shell

# Start everything for local development
dev: dev-db
	@echo "Starting backend and frontend in parallel..."
	@$(MAKE) dev-backend &
	@sleep 3
	@$(MAKE) dev-frontend

dev-backend:
	cd backend && DATABASE_URL="postgresql://retrowave:retrowave_pass@localhost:5432/retrowave" npx tsx src/index.ts

dev-frontend:
	cd frontend && NODE_ENV=development npx next dev

build:
	cd frontend && npm run build

prod:
	docker compose up -d --build

stop:
	docker compose down

logs:
	docker compose logs -f

clean:
	docker compose down -v
	rm -rf frontend/.next
	rm -rf backend/dist

# First-time setup: create database and seed data
setup: dev-db
	@sleep 3
	cd backend && DATABASE_URL="postgresql://retrowave:retrowave_pass@localhost:5432/retrowave" npx prisma db push --accept-data-loss
	cd backend && DATABASE_URL="postgresql://retrowave:retrowave_pass@localhost:5432/retrowave" npx tsx src/seed.ts
	@echo "\nDone! Run 'make dev' to start the app."

# Seed the database with Internet Archive royalty-free music
seed:
	cd backend && DATABASE_URL="postgresql://retrowave:retrowave_pass@localhost:5432/retrowave" npx tsx src/seed.ts

dev-db:
	docker compose up -d db redis

db-shell:
	docker compose exec db psql -U retrowave -d retrowave

redis-shell:
	docker compose exec redis redis-cli
