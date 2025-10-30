# Запуск

```
docker compose up -d
```

! Заходим в разных браузерах !

http://localhost:5174
Данные для входа:
admin@example.com
password

http://localhost:5173
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
