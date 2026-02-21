# 🆓 AZUL STREET API - Hospedagem 100% Gratuita

## Arquitetura Recomendada (Custo Zero)

```
┌─────────────────────────────────────────────────────────────┐
│                    HOSPEDAGEM GRATUITA                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   FRONTEND   │    │   BACKEND    │    │   DATABASE   │  │
│  │   Vercel     │───▶│   Render     │───▶│   Neon       │  │
│  │   (React)    │    │   (Node.js)  │    │ (PostgreSQL) │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                             │                               │
│                             ▼                               │
│                      ┌──────────────┐                       │
│                      │    CACHE     │                       │
│                      │   Upstash    │                       │
│                      │   (Redis)    │                       │
│                      └──────────────┘                       │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   IMAGENS    │    │    EMAIL     │    │   DOMÍNIO    │  │
│  │  Cloudinary  │    │   Resend     │    │  Freenom*    │  │
│  │   (CDN)      │    │  (100/dia)   │    │   ou .tk     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 1. Backend API - Render.com (GRÁTIS)

**Plano:** Free Tier
**Limites:** 750 horas/mês, sleep após 15min inatividade
**URL:** https://azul-street-api.onrender.com

### Passos:

1. Acesse https://render.com e crie conta (use GitHub)
2. Clique em "New +" → "Web Service"
3. Conecte o repositório GitHub
4. Configure:
   - **Name:** azul-street-api
   - **Runtime:** Node
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

5. Adicione variáveis de ambiente:
```
NODE_ENV=production
DATABASE_URL=(copiar do Neon)
REDIS_URL=(copiar do Upstash)
JWT_SECRET=sua_chave_secreta_32_chars
FRONTEND_URL=https://azulstreet.vercel.app
```

---

## 2. Banco de Dados - Neon.tech (GRÁTIS)

**Plano:** Free Tier
**Limites:** 512MB storage, 1 projeto, branching
**Vantagem:** PostgreSQL serverless, sempre online

### Passos:

1. Acesse https://neon.tech e crie conta
2. Crie novo projeto: "azul-street"
3. Copie a connection string:
```
postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/azulstreet?sslmode=require
```
4. Use essa URL no Render como DATABASE_URL

---

## 3. Cache Redis - Upstash (GRÁTIS)

**Plano:** Free Tier
**Limites:** 10.000 comandos/dia, 256MB
**Vantagem:** Redis serverless, sem sleep

### Passos:

1. Acesse https://upstash.com e crie conta
2. Crie novo database Redis
3. Copie a REST URL:
```
redis://default:xxx@us1-xxx.upstash.io:6379
```
4. Use essa URL no Render como REDIS_URL

---

## 4. Frontend - Vercel (GRÁTIS)

**Plano:** Hobby (gratuito para projetos pessoais)
**Limites:** 100GB bandwidth, builds ilimitados
**URL:** https://azulstreet.vercel.app

### Passos:

1. Acesse https://vercel.com e conecte GitHub
2. Importe o repositório do frontend
3. Configure variável:
```
NEXT_PUBLIC_API_URL=https://azul-street-api.onrender.com/api/v1
```
4. Deploy automático!

---

## 5. Imagens/CDN - Cloudinary (GRÁTIS)

**Plano:** Free Tier
**Limites:** 25GB storage, 25GB bandwidth/mês
**Vantagem:** Otimização automática de imagens

### Passos:

1. Acesse https://cloudinary.com e crie conta
2. Copie as credenciais:
```
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```
3. Adicione no Render

### Código para upload:
```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file: string) => {
  const result = await cloudinary.uploader.upload(file, {
    folder: 'azulstreet',
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  });
  return result.secure_url;
};
```

---

## 6. Email - Resend (GRÁTIS)

**Plano:** Free Tier
**Limites:** 100 emails/dia, 3.000/mês
**Vantagem:** API moderna, fácil integração

### Passos:

1. Acesse https://resend.com e crie conta
2. Gere API Key
3. Adicione no Render:
```
RESEND_API_KEY=re_xxx
```

### Código:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
  await resend.emails.send({
    from: 'AZUL STREET <noreply@azulstreet.com>',
    to,
    subject,
    html,
  });
};
```

---

## 7. Domínio Gratuito (Opções)

### Opção A: Subdomínio gratuito (recomendado)
- Render: `azul-street-api.onrender.com`
- Vercel: `azulstreet.vercel.app`

### Opção B: Domínio .tk/.ml/.ga (Freenom)
- Acesse https://freenom.com
- Registre: azulstreet.tk (grátis por 12 meses)
- Configure DNS para Vercel/Render

### Opção C: Domínio .com.br barato
- Registro.br: ~R$40/ano
- Hostinger: ~R$5,99 primeiro ano

---

## 8. Monitoramento - UptimeRobot (GRÁTIS)

**Plano:** Free Tier
**Limites:** 50 monitores, checks a cada 5min
**Vantagem:** Mantém o Render acordado!

### Passos:

1. Acesse https://uptimerobot.com
2. Adicione monitor HTTP:
   - URL: `https://azul-street-api.onrender.com/health`
   - Intervalo: 5 minutos
3. Isso evita que o Render durma!

---

## 9. CI/CD - GitHub Actions (GRÁTIS)

Já configurado no projeto! O arquivo `.github/workflows/ci.yml` faz:
- Testes automáticos em cada push
- Deploy automático no Render

---

## 📋 Checklist de Deploy

```
[ ] 1. Criar conta no Neon.tech → Copiar DATABASE_URL
[ ] 2. Criar conta no Upstash → Copiar REDIS_URL
[ ] 3. Criar conta no Render → Deploy backend
[ ] 4. Criar conta no Vercel → Deploy frontend
[ ] 5. Criar conta no Cloudinary → Configurar uploads
[ ] 6. Criar conta no Resend → Configurar emails
[ ] 7. Criar conta no UptimeRobot → Manter API acordada
[ ] 8. Testar todos os endpoints
[ ] 9. Configurar domínio (opcional)
```

---

## 💰 Resumo de Custos

| Serviço | Plano | Custo |
|---------|-------|-------|
| Render (API) | Free | R$ 0 |
| Neon (PostgreSQL) | Free | R$ 0 |
| Upstash (Redis) | Free | R$ 0 |
| Vercel (Frontend) | Hobby | R$ 0 |
| Cloudinary (Imagens) | Free | R$ 0 |
| Resend (Email) | Free | R$ 0 |
| UptimeRobot | Free | R$ 0 |
| GitHub Actions | Free | R$ 0 |
| **TOTAL** | | **R$ 0** |

---

## ⚠️ Limitações do Plano Gratuito

1. **Render:** API dorme após 15min sem uso (UptimeRobot resolve)
2. **Neon:** 512MB de storage (suficiente para ~50k produtos)
3. **Upstash:** 10k comandos/dia (suficiente para ~500 usuários/dia)
4. **Cloudinary:** 25GB/mês (suficiente para ~5k imagens)
5. **Resend:** 100 emails/dia (suficiente para início)

---

## 🚀 Quando Escalar (Planos Pagos)

Quando o e-commerce crescer:

| Serviço | Plano Pago | Custo |
|---------|------------|-------|
| Render | Starter | $7/mês |
| Neon | Launch | $19/mês |
| Vercel | Pro | $20/mês |
| **Total** | | ~$46/mês (~R$230) |

---

## 📞 Suporte

Todos os serviços têm documentação excelente:
- Render: https://render.com/docs
- Neon: https://neon.tech/docs
- Vercel: https://vercel.com/docs
- Upstash: https://upstash.com/docs
