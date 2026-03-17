#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  School ERP — Server Setup Script
#  Run once on a fresh Ubuntu 22.04 server as root or with sudo.
#  Usage: curl -fsSL https://your-cdn/setup-server.sh | bash
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

log() { echo -e "\033[0;32m[SETUP]\033[0m $1"; }
err() { echo -e "\033[0;31m[ERROR]\033[0m $1" >&2; exit 1; }

[[ "$EUID" -eq 0 ]] || err "Run as root or with sudo"

log "Updating system packages..."
apt-get update -q && apt-get upgrade -y -q

log "Installing dependencies..."
apt-get install -y -q \
  curl wget git unzip software-properties-common \
  apt-transport-https ca-certificates gnupg lsb-release \
  htop ncdu fail2ban ufw jq

# ── Docker ──────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  log "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  usermod -aG docker ${SUDO_USER:-ubuntu}
  log "Docker installed: $(docker --version)"
else
  log "Docker already installed: $(docker --version)"
fi

# ── Docker Compose ───────────────────────────────────────────────
if ! docker compose version &>/dev/null; then
  log "Installing Docker Compose plugin..."
  apt-get install -y -q docker-compose-plugin
fi
log "Docker Compose: $(docker compose version)"

# ── Certbot (Let's Encrypt SSL) ──────────────────────────────────
if ! command -v certbot &>/dev/null; then
  log "Installing Certbot..."
  snap install --classic certbot
  ln -sf /snap/bin/certbot /usr/bin/certbot
fi

# ── Firewall ─────────────────────────────────────────────────────
log "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
log "Firewall active: $(ufw status | head -1)"

# ── Fail2Ban ─────────────────────────────────────────────────────
log "Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# ── App directory ────────────────────────────────────────────────
APP_DIR="/opt/school-erp"
log "Creating app directory at $APP_DIR..."
mkdir -p "$APP_DIR"/{nginx/ssl,nginx/logs,backups}
chown -R ${SUDO_USER:-ubuntu}:${SUDO_USER:-ubuntu} "$APP_DIR"

# ── Backup script ────────────────────────────────────────────────
cat > /opt/school-erp/backup.sh << 'BACKUP'
#!/bin/bash
# Daily database backup
BACKUP_DIR="/opt/school-erp/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

docker exec erp_postgres pg_dump -U erp_user school_erp | gzip > "$FILE"

# Keep only last 30 backups
ls -tp "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -n +31 | xargs rm -f -- 2>/dev/null || true
echo "Backup: $FILE ($(du -sh "$FILE" | cut -f1))"
BACKUP
chmod +x /opt/school-erp/backup.sh

# ── Cron for backups ─────────────────────────────────────────────
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/school-erp/backup.sh >> /var/log/erp-backup.log 2>&1") | sort -u | crontab -

# ── System tuning ────────────────────────────────────────────────
log "Tuning system limits..."
cat >> /etc/sysctl.conf << 'SYSCTL'
# School ERP tuning
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
vm.overcommit_memory = 1
fs.file-max = 1000000
SYSCTL
sysctl -p >/dev/null 2>&1

cat >> /etc/security/limits.conf << 'LIMITS'
*    soft nofile 65535
*    hard nofile 65535
LIMITS

# ── SSL certificate ──────────────────────────────────────────────
log ""
log "══════════════════════════════════════════════════════"
log "  Server setup complete!"
log "══════════════════════════════════════════════════════"
log ""
log "Next steps:"
log "  1. Clone your repo: git clone <repo> /opt/school-erp"
log "  2. Copy env: cp .env.example .env.prod && nano .env.prod"
log "  3. Get SSL:  certbot certonly --standalone -d YOUR_DOMAIN"
log "  4. Copy SSL: cp /etc/letsencrypt/live/YOUR_DOMAIN/*.pem nginx/ssl/"
log "  5. Start:   docker compose -f docker-compose.prod.yml up -d"
log "  6. Migrate: docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy"
log "  7. Seed:    docker compose -f docker-compose.prod.yml exec api npm run db:seed"
log ""
log "  Backup runs daily at 2 AM → /opt/school-erp/backups/"
log "  Log rotation configured."
log ""
