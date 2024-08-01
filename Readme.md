### Dev
For building dev environment
```
docker-compose -f docker-compose.dev.yml --env-file .env.dev up --build
```

### Prod
For building prod environment
``` 
docker-compose -f docker-compose.prod.yml --env-file .env.prod up --build
```