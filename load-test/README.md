# Load Testing Container

This container generates 100,000 unique users using the OpenAI API and then runs a k6 script that registers each user through the gateway. Before starting, a health check verifies Elasticsearch, Kibana, and the gateway are reachable. Test metrics are pushed to Elasticsearch.

## Usage

Build and run using Docker Compose. The service expects a `.env.loadtest` file
containing your OpenAI API key:

```bash
OPENAI_API_KEY=sk-... docker compose -f docker-compose.loadtest.yml --env-file .env.loadtest up --build loadtest
```

Environment variables:

- `OPENAI_API_KEY` - API key used to generate user data
- `TARGET_URL` - Base URL of the gateway (default `http://express:8000`)
- `USER_COUNT` - Number of users to generate (default `100000`)
