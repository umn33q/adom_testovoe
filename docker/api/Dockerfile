FROM php:8.3-fpm

# System dependencies and PHP extensions commonly used by Laravel
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libonig-dev \
    libicu-dev \
    libxml2-dev \
    libpng-dev \
    libpq-dev \
    && docker-php-ext-install pdo_pgsql mbstring bcmath \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 9000


