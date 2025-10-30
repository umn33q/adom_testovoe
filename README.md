# Запуск

```
docker compose up -d
```

Данные для входа:
admin@example.com
password

user@example.com
password

# Полезные команды

```
// migrate
docker compose exec api php artisan migrate

// migrate:fresh + seed
docker compose exec api php artisan migrate:fresh --seed

// если через Docker — контейнер сам выполнит npm install при рестарте
docker compose restart app-public
```
