#!/bin/sh
set -e

# Create required directories for Nginx and Laravel
mkdir -p /run/nginx /var/log/nginx
mkdir -p /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/framework/cache \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache

chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# Cache configs and run migrations if enabled
if [ "$APP_ENV" = "production" ]; then
    php artisan config:clear || true
    php artisan route:clear || true
    php artisan view:clear || true
fi

if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running migrations..."
    php artisan migrate --force || true
fi

echo "Starting PHP-FPM on port 9000..."
php-fpm -D

echo "Starting Nginx on ports 8000, 8080, 80..."
exec nginx -g "daemon off;"
