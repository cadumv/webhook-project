#!/bin/sh
# Inicia o Cloudflare Tunnel em background
cloudflared tunnel --config /etc/cloudflared/config.yml run &
# Inicia o servidor keep-alive
node /app/server.js
