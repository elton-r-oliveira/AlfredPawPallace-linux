-- =====================================================
-- ALFRED PAW PALACE - Passo 1: Banco e Tabelas
-- Executar normalmente no DBBeaver (Execute Script)
-- Padrão: tabelas = t_nome | procedures = s_nome
-- =====================================================

CREATE DATABASE IF NOT EXISTS BDAlfredPawPalace
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE BDAlfredPawPalace;

-- =====================================================
-- TABELAS
-- =====================================================

CREATE TABLE IF NOT EXISTS t_usuarios (
  id         CHAR(36)     PRIMARY KEY,
  nome       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  tipo       ENUM('cliente','funcionario') NOT NULL DEFAULT 'cliente',
  telefone   VARCHAR(20),
  endereco   VARCHAR(500),
  cep        VARCHAR(10),
  rua        VARCHAR(255),
  cidade     VARCHAR(100),
  estado     VARCHAR(2),
  numero     VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_unidades (
  id        CHAR(36)      PRIMARY KEY,
  nome      VARCHAR(255)  NOT NULL,
  endereco  VARCHAR(500)  NOT NULL,
  telefone  VARCHAR(20),
  whatsapp  VARCHAR(20),
  lat       DECIMAL(10,7),
  lng       DECIMAL(10,7),
  ativo     TINYINT(1)    DEFAULT 1,
  ordem     INT           DEFAULT 0
);

CREATE TABLE IF NOT EXISTS t_servicos (
  id       CHAR(36)      PRIMARY KEY,
  name     VARCHAR(255)  NOT NULL,
  price    DECIMAL(10,2) NOT NULL,
  duration VARCHAR(100),
  category VARCHAR(100),
  active   TINYINT(1)    DEFAULT 1,
  ordem    INT           DEFAULT 0
);

CREATE TABLE IF NOT EXISTS t_promocoes (
  id         CHAR(36)     PRIMARY KEY,
  titulo     VARCHAR(255) NOT NULL,
  descricao  TEXT,
  imagem_url VARCHAR(500),
  ativo      TINYINT(1)   DEFAULT 1,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_pets (
  id          CHAR(36)     PRIMARY KEY,
  usuario_id  CHAR(36)     NOT NULL,
  name        VARCHAR(255) NOT NULL,
  breed       VARCHAR(255) NOT NULL,
  age         INT          NOT NULL,
  weight      DECIMAL(5,2) NOT NULL,
  animal_type VARCHAR(50)  NOT NULL DEFAULT 'dog',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS t_agendamentos (
  id                    CHAR(36)     PRIMARY KEY,
  usuario_id            CHAR(36)     NOT NULL,
  unidade_id            CHAR(36)     NOT NULL,
  pet_id                CHAR(36),
  pet_nome              VARCHAR(255),
  pet_animal_type       VARCHAR(50),
  service               VARCHAR(255) NOT NULL,
  preco                 VARCHAR(50),
  tempo_servico         VARCHAR(100),
  data_hora_agendamento DATETIME     NOT NULL,
  status                ENUM('Pendente','Confirmado','Cancelado','Concluido') NOT NULL DEFAULT 'Pendente',
  created_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (unidade_id) REFERENCES t_unidades(id),
  FOREIGN KEY (pet_id)     REFERENCES t_pets(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS t_saude (
  id          CHAR(36)   PRIMARY KEY,
  pet_id      CHAR(36)   NOT NULL,
  usuario_id  CHAR(36)   NOT NULL,
  type        ENUM('vaccine','dewormer','antiparasitic') NOT NULL,
  name        VARCHAR(255) NOT NULL,
  date        DATE         NOT NULL,
  next_date   DATE,
  notes       TEXT,
  created_at  TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id)     REFERENCES t_pets(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
);

-- =====================================================
-- SEED DATA
-- =====================================================

INSERT IGNORE INTO t_unidades (id, nome, endereco, telefone, whatsapp, lat, lng, ativo, ordem) VALUES
  ('uni-0001-0001-0001-000000000001', 'Petshop Lu - Santo André',
   'Av. Loreto, 238 - Jardim Santo André, Santo André - SP, 09132-410',
   '(11) 95075-2980', '(11) 97591-1800', -23.706598, -46.500752, 1, 1);

INSERT IGNORE INTO t_servicos (id, name, price, duration, category, active, ordem) VALUES
  ('srv-0001-0001-0001-000000000001', 'Banho e Tosa',  80.00,  '2-3 horas',  'grooming', 1, 1),
  ('srv-0001-0001-0001-000000000002', 'Banho',         50.00,  '1-2 horas',  'grooming', 1, 2),
  ('srv-0001-0001-0001-000000000003', 'Tosa',          40.00,  '1-2 horas',  'grooming', 1, 3),
  ('srv-0001-0001-0001-000000000004', 'Consulta Vet', 120.00,  '30-60 min',  'health',   1, 4),
  ('srv-0001-0001-0001-000000000005', 'Vacinação',     80.00,  '15-30 min',  'health',   1, 5),
  ('srv-0001-0001-0001-000000000006', 'Hotel Pet',    100.00,  'Por diária', 'hotel',    1, 6);
