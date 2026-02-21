# 🚀 AZUL STREET API - Guia de Deploy

## Pré-requisitos

- Servidor Linux (Ubuntu 22.04 recomendado)
- Docker e Docker Compose instalados
- Domínio configurado (azulstreet.com.br)
- Certificado SSL (Let's Encrypt)

## 1. Configuração Inicial

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/azul-street-api.git
cd azul-street-api

# Copie e configure as variáveis de ambiente
cp .env.production .env
nano .env  # Edite com suas credenciais reais
```

## 2. Certificado SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot

# Gerar certificado
sudo certbot certonly --standalone -d azulstreet.com.br -d www.azulstreet.com.br

# Copiar certificados para o projeto
sudo cp /etc/letsencrypt/live/azulstreet.com.br/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/azulstreet.com.br/privkey.pem ./ssl/
sudo chown $USER:$USER ./ssl/*.pem
```

## 3. Deploy

```bash
# Dar permissão ao script
chmod +x scripts/deploy.sh

# Executar deploy
./scripts/deploy.sh production
```

## 4. Verificação

```bash
# Verificar containers
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f api

# Testar API
curl https://azulstreet.com.br/health
```

## 5. Backup Automático

```bash
# Adicionar ao crontab
crontab -e

# Adicionar linha (backup diário às 2h)
0 2 * * * /home/user/azul-street-api/scripts/backup.sh >> /var/log/azul-backup.log 2>&1
```

## 6. Monitoramento

### Logs em tempo real
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Status dos serviços
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Uso de recursos
```bash
docker stats
```

## 7. Atualizações

```bash
# Pull e redeploy
git pull origin main
./scripts/deploy.sh production
```

## 8. Rollback

```bash
# Voltar para versão anterior
git checkout HEAD~1
./scripts/deploy.sh production
```

## Estrutura de Produção

```
├── nginx.conf           # Configuração Nginx (SSL, proxy)
├── docker-compose.prod.yml  # Stack de produção
├── .env.production      # Variáveis de ambiente
├── scripts/
│   ├── deploy.sh        # Script de deploy
│   └── backup.sh        # Script de backup
├── ssl/                 # Certificados SSL
├── backups/             # Backups do banco
└── uploads/             # Imagens dos produtos
```

## Portas

| Serviço | Porta |
|---------|-------|
| Nginx (HTTP) | 80 |
| Nginx (HTTPS) | 443 |
| API (interno) | 3000 |
| PostgreSQL (interno) | 5432 |
| Redis (interno) | 6379 |

## Suporte

Em caso de problemas, verifique:
1. Logs: `docker-compose -f docker-compose.prod.yml logs api`
2. Health: `curl https://azulstreet.com.br/health`
3. Database: `docker exec azul_db psql -U postgres -c "SELECT 1"`
