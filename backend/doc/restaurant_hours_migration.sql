-- Migration: Horários de Funcionamento
-- Data: 2026-05-18
-- Descrição: Adiciona suporte a horários por dia da semana para restaurantes e categorias

-- Horários do restaurante (para exibição no footer do cardápio público)
-- Permite múltiplas faixas de horário por dia (ex: almoço + jantar)
-- day_of_week: 0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado
CREATE TABLE IF NOT EXISTS restaurant_hours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  day_of_week TINYINT NOT NULL COMMENT '0=Dom,1=Seg,2=Ter,3=Qua,4=Qui,5=Sex,6=Sab',
  open_time TIME NULL,
  close_time TIME NULL,
  is_closed BOOLEAN DEFAULT FALSE,
  sort_order TINYINT DEFAULT 0,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Horários por dia da semana para cada categoria
-- Substitui o sistema antigo de opening_time/closing_time/available_days
-- Se não houver registros para uma categoria, o sistema usa os campos legados
CREATE TABLE IF NOT EXISTS category_day_hours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  day_of_week TINYINT NOT NULL COMMENT '0=Dom,1=Seg,2=Ter,3=Qua,4=Qui,5=Sex,6=Sab',
  open_time TIME NULL,
  close_time TIME NULL,
  is_closed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Notas:
-- is_closed=true com open_time/close_time NULL indica dia fechado
-- is_closed=false com open_time/close_time NULL indica aberto o dia todo
-- is_closed=false com open_time/close_time definidos indica faixa de horário
-- Múltiplos registros do mesmo day_of_week em restaurant_hours = múltiplas faixas
