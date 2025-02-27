FROM cloudflare/cloudflared:latest

# Defina o diretório de trabalho para os arquivos de configuração
WORKDIR /etc/cloudflared
COPY config.yml .
COPY add5c674-eb88-4db2-92a8-cbb55bae9142.json .

# Mova os arquivos do servidor e do script para /app
WORKDIR /app
COPY server.js /app/server.js
COPY start.sh /app/start.sh

# Certifique-se de que start.sh já tenha permissão de execução (defina localmente com chmod +x start.sh)
# Remova o ENTRYPOINT herdado:
ENTRYPOINT []

CMD ["/app/start.sh"]
