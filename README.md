### Fynd Core API

#### Logging

This service ships with a Winston-based logger that can optionally forward JSON lines to Logstash over TCP. Configure via environment variables:

- `LOG_LEVEL`: Log level (default `info`).
- `SERVICE_NAME`: Name reported in logs (default `fynd-core-api`).
- `LOGSTASH_URL`: Optional `host:port` or URL (e.g. `tcp://logstash:5000`). When set, logs stream to Logstash with reconnect/backpressure handling.

#### HTTP endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/users/:id/tastes` | Returns all tastes registered for a given user or `404` when the user does not exist. |