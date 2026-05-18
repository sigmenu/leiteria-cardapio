# Migration: Mover pasta de uploads para backend/uploads/

**Data:** 2026-05-18  
**Motivo:** O código foi corrigido para salvar e servir arquivos de imagem em `backend/uploads/`
em vez de `uploads/` (raiz do projeto). Sem essa migration, todas as fotos de produtos,
logos e banners vão aparecer como 404 após o deploy.

---

## O que mudou no código

| Arquivo | Antes | Depois |
|---|---|---|
| `backend/middleware/upload.js` | salva em `../../uploads` (raiz) | salva em `../uploads` (backend/) |
| `backend/server.js` | serve de `../uploads` (raiz) | serve de `uploads` (backend/) |

---

## Passos na hospedagem (fazer UMA VEZ após o deploy)

### 1. Verificar onde os arquivos estão

```bash
ls uploads/         # arquivos na raiz (lugar ANTIGO)
ls backend/uploads/ # arquivos no backend (lugar NOVO)
```

### 2. Mover todos os arquivos da raiz para backend/uploads/

```bash
# Rodar a partir da raiz do projeto
mv uploads/* backend/uploads/ 2>/dev/null; echo "OK"
```

> Se der "No such file or directory", não há arquivos para mover — tudo certo.

### 3. Confirmar que os arquivos estão no lugar certo

```bash
ls backend/uploads/   # deve listar as imagens (banner, logo, image, etc.)
ls uploads/           # deve estar vazio (só o .gitkeep)
```

### 4. Reiniciar o backend

Escolha o comando de acordo com a hospedagem:

```bash
# PM2
pm2 restart all

# ou PM2 com nome específico
pm2 restart leiteria

# systemd
sudo systemctl restart leiteria

# Se rodar direto com node (não recomendado para produção)
# Ctrl+C no processo atual, depois:
node server.js
```

---

## Como saber se funcionou

Após o restart, acesse o cardápio público e verifique se as fotos aparecem.
Se ainda houver 404, confirme que o backend foi reiniciado com o novo código:

```bash
# Deve mostrar "✅ Banco de dados pronto" como uma das linhas recentes
pm2 logs leiteria --lines 20
```

---

## Observação sobre deploys futuros

A pasta `backend/uploads/` está no `.gitignore` — os arquivos **nunca são apagados pelo git pull**.
Após esta migration, novos uploads já vão direto para `backend/uploads/` e nenhuma ação manual
é necessária.
