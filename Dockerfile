# Usa a imagem oficial do Cloudflare Tunnel
FROM cloudflare/cloudflared:latest

# Define o diretório de trabalho para garantir consistência
WORKDIR /etc/cloudflared

# Copia o arquivo de configuração e o arquivo de credenciais para dentro do container
COPY config.yml .
COPY add5c674-eb88-4db2-92a8-cbb55bae9142.json .

# Comando para rodar o tunnel usando o config.yml (que referencia o arquivo de credenciais com o nome original)
CMD ["tunnel", "--config", "config.yml", "run"]
