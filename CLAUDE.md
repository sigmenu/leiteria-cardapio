# Leiteria 639 — Cardápio Digital

Sistema de cardápio digital para o restaurante Leiteria 639.

## Stack

- **Frontend**: React + Vite + Tailwind CSS — porta `5173`
- **Backend**: Node.js + Express — porta `3001`
- **Banco**: MySQL remoto

## Banco de dados

```
mysql --host=192.168.15.97 --user=root --database=u714680025_leiteria639
```

Tabelas principais:
- `restaurants` — dados e configurações do restaurante (slug, cores, logo, banner)
- `categories` — categorias do cardápio (ícone, horários legados)
- `category_day_hours` — horários por dia da semana para cada categoria (sistema novo)
- `restaurant_hours` — horários de funcionamento do restaurante (exibidos no footer público)
- `subcategories` → `items` → `item_prices` — estrutura dos itens

## Uploads

Arquivos de imagem ficam em `backend/uploads/`.
O servidor serve via `/uploads/*` apontando para essa pasta.
**Nunca alterar** os paths de upload sem atualizar ambos: `backend/middleware/upload.js` e `backend/server.js`.

## URLs

- Cardápio público: `/menu/leiteria639`
- Admin: `/admin` (login necessário)

## Rotas API principais

- `GET /api/menu/:slug` — cardápio público completo (inclui `restaurantHours`)
- `GET/PUT /api/admin/hours` — horários do restaurante
- `GET/PUT /api/admin/categories/:id/hours` — horários por dia da categoria
- `GET/PUT /api/admin/settings` — configurações do restaurante
