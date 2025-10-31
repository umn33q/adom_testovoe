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

// заново пересоздать образы и контейнеры (как-будто в первый раз)
docker compose up -d --build --force-recreate

// снести все образы и контейнеры, которые используются текущим docker-compose.yml
docker compose down --rmi all
```
