# Запуск

```
docker compose up -d
```

# Полезные команды

```
// migrate
docker compose exec api php artisan migrate

// migrate:fresh + seed
docker compose exec api php artisan migrate:fresh --seed
```
