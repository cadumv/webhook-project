FROM cloudflare/cloudflared:latest

WORKDIR /etc/cloudflared

# Copia os arquivos de configuração e credenciais
COPY config.yml .
COPY add5c674-eb88-4db2-92a8-cbb55bae9142.json .

# Copia o script de keep-alive e o servidor dummy (assumindo que server.js está no mesmo diretório do Dockerfile)
COPY server.js /app/server.js
COPY start.sh /app/start.sh
#RUN chmod +x /app/start.sh

# Define o diretório de trabalho para o script
WORKDIR /app

# Comando de inicialização: inicia o tunnel e o servidor dummy
ENTRYPOINT []
CMD ["/app/start.sh"]
