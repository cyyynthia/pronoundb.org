
.PHONY: dev
dev:
	USER_ID="$$(id -u)" GROUP_ID="$$(id -g)" docker compose up -d

.PHONY: down
down:
	USER_ID="$$(id -u)" GROUP_ID="$$(id -g)" docker compose down

.PHONY: lint
lint:
	pnpm run lint -r

.PHONY: build
build:
	pnpm run build -r
