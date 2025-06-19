# Load Testing Container

This container generates 100,000 unique users using the OpenAI API and then runs a k6 script that registers each user through the gateway. Before starting, a health check verifies Elasticsearch, Kibana, and the gateway are reachable. Test metrics are pushed to Elasticsearch.

## Usage

Build and run using Docker Compose. The service expects a `.env.loadtest` file
containing the environment variables used by the scripts:

```bash
OPENAI_API_KEY=sk-... docker compose \
  -f docker-compose.loadtest.yml \
  --env-file .env.loadtest up --build loadtest
```

Environment variables:

- `OPENAI_API_KEY` - API key used to generate user data
- `TARGET_URL` - Base URL of the gateway (default `http://localhost:8000`)
- `ELASTIC_URL` - Elasticsearch endpoint to store k6 results (default `http://localhost:9200`)
- `EXPRESS_HEALTH_URL` - URL checked before tests (default `http://localhost:8000/api/v1/admin/health`)
- `ELASTICSEARCH_HEALTH_URL` - URL used to verify Elasticsearch (default `http://localhost:9200/_cluster/health`)
- `KIBANA_HEALTH_URL` - URL to check Kibana (default `http://localhost:5601/api/status`)
- `USER_COUNT` - Number of users to generate (default `100000`)
