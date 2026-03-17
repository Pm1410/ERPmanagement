#!/bin/bash
# SSL certificate renewal + nginx reload
# Add to crontab: 0 3 * * 1 /opt/school-erp/deploy/ssl-renew.sh >> /var/log/ssl-renew.log 2>&1

set -euo pipefail

DOMAIN="${SSL_DOMAIN:?Set SSL_DOMAIN env var}"
NGINX_CONTAINER="${NGINX_CONTAINER:-erp_nginx}"
SSL_DIR="/opt/school-erp/nginx/ssl"

echo "[$(date)] Checking SSL certificate renewal for $DOMAIN"

# Renew if expiry < 30 days
certbot renew --quiet --deploy-hook "
  cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_DIR/
  cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_DIR/
  docker exec $NGINX_CONTAINER nginx -s reload
  echo 'SSL renewed and nginx reloaded'
"

echo "[$(date)] SSL check complete"
