FROM cloudflare/cloudflared:latest

# Define o diretório de trabalho
WORKDIR ./cloudflared

# Copia os arquivos de configuração e credenciais para o diretório de trabalho
COPY config.yml .
COPY add5c674-eb88-4db2-92a8-cbb55bae9142.json .

CMD ["tunnel", "--config", "config.yml", "run"]
