# exam-system-backend

This backend was created from the official Kit template:

```bash
neil new io.github.kit-clj/kit zhaoyul/exam-system-backend
```

Kit's default template is backend-only: `kit-core` plus `kit-undertow`. If this project needs to be regenerated, run the repository wrapper from the repository root:

```bash
scripts/new-kit-project --name zhaoyul/exam-system-backend --target-dir backend --backend-only
```

The wrapper also supports proxy testing:

```bash
scripts/new-kit-project --name zhaoyul/exam-system-backend --target-dir backend --backend-only --proxy http://127.0.0.1:7890
```

On this machine, `127.0.0.1:6696` has been verified for GitHub and Maven traffic:

```bash
scripts/new-kit-project --name zhaoyul/exam-system-backend --target-dir backend --backend-only --proxy http://127.0.0.1:6696
```

The wrapper exports both normal proxy variables and temporary Git proxy config, because `neil` delegates template fetching to `tools.gitlibs`, which shells out to `git fetch`.

The local `127.0.0.1:7890` port accepts TCP connections, but GitHub HTTPS through it fails during TLS negotiation, so do not use it for Kit generation unless its upstream is fixed. The generated Kit layout is preserved: `src/clj`, `resources/system.edn`, Integrant components, Undertow edge, Reitit routes, and Kit dev REPL helpers.

## Run locally

```bash
cd backend
clojure -M:dev -m zhaoyul.exam-system-backend.core
```

Default server: `http://127.0.0.1:8080`

- Swagger UI: `http://127.0.0.1:8080/api/docs/`
- OpenAPI JSON: `http://127.0.0.1:8080/api/swagger.json`
- Health: `http://127.0.0.1:8080/api/health`

Seed accounts:

- `cgnzx001` / `cs@13311331`
- `Csyxgs001` / `cs@13311331`

## Database profiles

Development uses SQLite:

```bash
DB_PROFILE=sqlite JDBC_URL=jdbc:sqlite:./data/exam-system-dev.db clojure -M:dev -m zhaoyul.exam-system-backend.core
```

Dameng deployment uses the same code path and switches by environment:

```bash
DB_PROFILE=dm \
DB_DRIVER=dm.jdbc.driver.DmDriver \
JDBC_URL=jdbc:dm://127.0.0.1:5236/EXAM_SYSTEM \
DB_USERNAME=EXAM_SYSTEM \
DB_PASSWORD=your-password \
clojure -M:dev -m zhaoyul.exam-system-backend.core
```

Put the Dameng JDBC jar on the runtime classpath or add it through a deployment alias after confirming the driver jar version used by the target server.

Migration SQL files use `--;;` as the statement delimiter. Keep one complete SQL statement before each delimiter.

## API shape

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/catalog/menus`
- `GET /api/certification/organizations`
- `GET /api/certification/plans`
- `GET /api/certification/execution/exam-rooms`
- `GET /api/question-bank/theory-subjects`
- `GET /api/experts`
- `GET /api/traceability/cases`
- `GET /api/resources/{resource}`
