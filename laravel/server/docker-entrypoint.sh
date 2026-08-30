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

# Configure port dynamically from $PORT or fallback to 8000
PORT_TO_USE="${PORT:-8000}"
sed -i "s/listen [0-9]*;/listen ${PORT_TO_USE};/g" /etc/nginx/http.d/default.conf

# Start PHP-FPM in background
php-fpm -D

# Start Nginx in foreground
exec nginx -g "daemon off;"
