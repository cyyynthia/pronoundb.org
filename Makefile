
.PHONY: dev
dev:
	docker-compose up -d

.PHONY: dev-rebuild
dev-rebuild:
	docker-compose up --build -d

.PHONY: down
down:
	docker-compose down

.PHONY: lint
lint:
	pnpm run lint -r

.PHONY: build
build:
	pnpm run build -r
