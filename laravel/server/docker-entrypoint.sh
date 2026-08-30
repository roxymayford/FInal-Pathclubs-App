#!/bin/sh
set -e

# Cache configuration in production
if [ "$APP_ENV" = "production" ]; then
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

# Run migrations if enabled
if [ "$RUN_MIGRATIONS" = "true" ]; then
    php artisan migrate --force || true
fi

# Start PHP-FPM in background
php-fpm -D

# Start Nginx in foreground
exec nginx -g "daemon off;"
