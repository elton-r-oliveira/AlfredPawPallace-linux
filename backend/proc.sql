-- =====================================================
-- ALFRED PAW PALACE - Passo 2: Stored Procedures
--
-- ANTES DE EXECUTAR no DBBeaver:
--   1. Abra este arquivo no SQL Editor
--   2. Clique no ícone de configurações do editor (≡)
--      ou vá em: SQL Editor > Smart Execution
--   3. Mude o "Statement delimiter" de ";" para "//"
--   4. Execute o script inteiro (Ctrl+Shift+Enter)
-- =====================================================

USE BDAlfredPawPalace //

-- ---------------------------------------------------
-- USUÁRIOS
-- ---------------------------------------------------

DROP PROCEDURE IF EXISTS s_buscar_usuario_por_email //
CREATE PROCEDURE s_buscar_usuario_por_email(IN p_email VARCHAR(255))
BEGIN
  SELECT id, nome, email, senha_hash, tipo, telefone,
         endereco, cep, rua, cidade, estado, numero
  FROM t_usuarios
  WHERE email = p_email
  LIMIT 1;
END //

DROP PROCEDURE IF EXISTS s_buscar_usuario_por_id //
CREATE PROCEDURE s_buscar_usuario_por_id(IN p_id CHAR(36))
BEGIN
  SELECT id, nome, email, tipo, telefone,
         endereco, cep, rua, cidade, estado, numero
  FROM t_usuarios
  WHERE id = p_id
  LIMIT 1;
END //

DROP PROCEDURE IF EXISTS s_criar_usuario //
CREATE PROCEDURE s_criar_usuario(
  IN p_id         CHAR(36),
  IN p_nome       VARCHAR(255),
  IN p_email      VARCHAR(255),
  IN p_senha_hash VARCHAR(255),
  IN p_tipo       ENUM('cliente','funcionario')
)
BEGIN
  INSERT INTO t_usuarios (id, nome, email, senha_hash, tipo)
  VALUES (p_id, p_nome, p_email, p_senha_hash, p_tipo);
END //

DROP PROCEDURE IF EXISTS s_atualizar_usuario //
CREATE PROCEDURE s_atualizar_usuario(
  IN p_id       CHAR(36),
  IN p_nome     VARCHAR(255),
  IN p_telefone VARCHAR(20),
  IN p_endereco VARCHAR(500),
  IN p_cep      VARCHAR(10),
  IN p_rua      VARCHAR(255),
  IN p_cidade   VARCHAR(100),
  IN p_estado   VARCHAR(2),
  IN p_numero   VARCHAR(20)
)
BEGIN
  UPDATE t_usuarios
  SET nome     = COALESCE(p_nome,     nome),
      telefone = COALESCE(p_telefone, telefone),
      endereco = COALESCE(p_endereco, endereco),
      cep      = COALESCE(p_cep,      cep),
      rua      = COALESCE(p_rua,      rua),
      cidade   = COALESCE(p_cidade,   cidade),
      estado   = COALESCE(p_estado,   estado),
      numero   = COALESCE(p_numero,   numero)
  WHERE id = p_id;
END //

-- ---------------------------------------------------
-- PETS
-- ---------------------------------------------------

DROP PROCEDURE IF EXISTS s_listar_pets //
CREATE PROCEDURE s_listar_pets(IN p_usuario_id CHAR(36))
BEGIN
  SELECT id, name, breed, age, weight, animal_type AS animalType, created_at
  FROM t_pets
  WHERE usuario_id = p_usuario_id
  ORDER BY created_at DESC;
END //

DROP PROCEDURE IF EXISTS s_criar_pet //
CREATE PROCEDURE s_criar_pet(
  IN p_id          CHAR(36),
  IN p_usuario_id  CHAR(36),
  IN p_name        VARCHAR(255),
  IN p_breed       VARCHAR(255),
  IN p_age         INT,
  IN p_weight      DECIMAL(5,2),
  IN p_animal_type VARCHAR(50)
)
BEGIN
  INSERT INTO t_pets (id, usuario_id, name, breed, age, weight, animal_type)
  VALUES (p_id, p_usuario_id, p_name, p_breed, p_age, p_weight, p_animal_type);

  SELECT id, name, breed, age, weight, animal_type AS animalType
  FROM t_pets WHERE id = p_id;
END //

DROP PROCEDURE IF EXISTS s_atualizar_pet //
CREATE PROCEDURE s_atualizar_pet(
  IN p_id          CHAR(36),
  IN p_usuario_id  CHAR(36),
  IN p_name        VARCHAR(255),
  IN p_breed       VARCHAR(255),
  IN p_age         INT,
  IN p_weight      DECIMAL(5,2),
  IN p_animal_type VARCHAR(50)
)
BEGIN
  UPDATE t_pets
  SET name        = p_name,
      breed       = p_breed,
      age         = p_age,
      weight      = p_weight,
      animal_type = p_animal_type
  WHERE id = p_id AND usuario_id = p_usuario_id;

  SELECT id, name, breed, age, weight, animal_type AS animalType
  FROM t_pets WHERE id = p_id;
END //

DROP PROCEDURE IF EXISTS s_deletar_pet //
CREATE PROCEDURE s_deletar_pet(IN p_id CHAR(36), IN p_usuario_id CHAR(36))
BEGIN
  DELETE FROM t_pets WHERE id = p_id AND usuario_id = p_usuario_id;
END //

-- ---------------------------------------------------
-- AGENDAMENTOS
-- ---------------------------------------------------

DROP PROCEDURE IF EXISTS s_listar_agendamentos //
CREATE PROCEDURE s_listar_agendamentos(
  IN p_usuario_id CHAR(36),
  IN p_futuro     TINYINT,
  IN p_status     VARCHAR(100),
  IN p_limite     INT
)
BEGIN
  SELECT id, service, preco, tempo_servico, data_hora_agendamento,
         status, unidade_id, pet_id, pet_nome, pet_animal_type, created_at
  FROM t_agendamentos
  WHERE usuario_id = p_usuario_id
    AND (p_futuro = 0 OR data_hora_agendamento > NOW())
    AND (p_status IS NULL OR FIND_IN_SET(status, p_status) > 0)
  ORDER BY data_hora_agendamento DESC;
END //

DROP PROCEDURE IF EXISTS s_criar_agendamento //
CREATE PROCEDURE s_criar_agendamento(
  IN p_id                    CHAR(36),
  IN p_usuario_id            CHAR(36),
  IN p_unidade_id            CHAR(36),
  IN p_pet_id                CHAR(36),
  IN p_pet_nome              VARCHAR(255),
  IN p_pet_animal_type       VARCHAR(50),
  IN p_service               VARCHAR(255),
  IN p_preco                 VARCHAR(50),
  IN p_tempo_servico         VARCHAR(100),
  IN p_data_hora_agendamento DATETIME
)
BEGIN
  INSERT INTO t_agendamentos (
    id, usuario_id, unidade_id, pet_id, pet_nome, pet_animal_type,
    service, preco, tempo_servico, data_hora_agendamento, status
  ) VALUES (
    p_id, p_usuario_id, p_unidade_id, p_pet_id, p_pet_nome, p_pet_animal_type,
    p_service, p_preco, p_tempo_servico, p_data_hora_agendamento, 'Pendente'
  );

  SELECT id, status, data_hora_agendamento FROM t_agendamentos WHERE id = p_id;
END //

DROP PROCEDURE IF EXISTS s_atualizar_status_agendamento //
CREATE PROCEDURE s_atualizar_status_agendamento(
  IN p_id         CHAR(36),
  IN p_usuario_id CHAR(36),
  IN p_status     VARCHAR(20)
)
BEGIN
  UPDATE t_agendamentos
  SET status = p_status
  WHERE id = p_id AND usuario_id = p_usuario_id;
END //

DROP PROCEDURE IF EXISTS s_horarios_ocupados //
CREATE PROCEDURE s_horarios_ocupados(
  IN p_data       DATE,
  IN p_unidade_id CHAR(36)
)
BEGIN
  SELECT TIME_FORMAT(data_hora_agendamento, '%H:%i') AS horario
  FROM t_agendamentos
  WHERE DATE(data_hora_agendamento) = p_data
    AND unidade_id = p_unidade_id
    AND status NOT IN ('Cancelado');
END //

-- ---------------------------------------------------
-- SAÚDE
-- ---------------------------------------------------

DROP PROCEDURE IF EXISTS s_listar_saude //
CREATE PROCEDURE s_listar_saude(IN p_pet_id CHAR(36), IN p_usuario_id CHAR(36))
BEGIN
  SELECT id, pet_id AS petId, type, name, date, next_date AS nextDate,
         notes, created_at AS createdAt, updated_at AS updatedAt
  FROM t_saude
  WHERE pet_id = p_pet_id AND usuario_id = p_usuario_id
  ORDER BY date DESC;
END //

DROP PROCEDURE IF EXISTS s_criar_saude //
CREATE PROCEDURE s_criar_saude(
  IN p_id         CHAR(36),
  IN p_pet_id     CHAR(36),
  IN p_usuario_id CHAR(36),
  IN p_type       VARCHAR(20),
  IN p_name       VARCHAR(255),
  IN p_date       DATE,
  IN p_next_date  DATE,
  IN p_notes      TEXT
)
BEGIN
  INSERT INTO t_saude (id, pet_id, usuario_id, type, name, date, next_date, notes)
  VALUES (p_id, p_pet_id, p_usuario_id, p_type, p_name, p_date, p_next_date, p_notes);

  SELECT id, pet_id AS petId, type, name, date, next_date AS nextDate,
         notes, created_at AS createdAt
  FROM t_saude WHERE id = p_id;
END //

DROP PROCEDURE IF EXISTS s_atualizar_saude //
CREATE PROCEDURE s_atualizar_saude(
  IN p_id         CHAR(36),
  IN p_usuario_id CHAR(36),
  IN p_name       VARCHAR(255),
  IN p_date       DATE,
  IN p_next_date  DATE,
  IN p_notes      TEXT
)
BEGIN
  UPDATE t_saude
  SET name      = p_name,
      date      = p_date,
      next_date = p_next_date,
      notes     = p_notes
  WHERE id = p_id AND usuario_id = p_usuario_id;

  SELECT id, pet_id AS petId, type, name, date, next_date AS nextDate,
         notes, updated_at AS updatedAt
  FROM t_saude WHERE id = p_id;
END //

DROP PROCEDURE IF EXISTS s_deletar_saude //
CREATE PROCEDURE s_deletar_saude(IN p_id CHAR(36), IN p_usuario_id CHAR(36))
BEGIN
  DELETE FROM t_saude WHERE id = p_id AND usuario_id = p_usuario_id;
END //

-- ---------------------------------------------------
-- UNIDADES / SERVIÇOS / PROMOÇÕES
-- ---------------------------------------------------

DROP PROCEDURE IF EXISTS s_listar_unidades //
CREATE PROCEDURE s_listar_unidades()
BEGIN
  SELECT id, nome, endereco, telefone, whatsapp, lat, lng, ativo, ordem
  FROM t_unidades
  WHERE ativo = 1
  ORDER BY ordem ASC;
END //

DROP PROCEDURE IF EXISTS s_listar_servicos //
CREATE PROCEDURE s_listar_servicos()
BEGIN
  SELECT id, name, price, duration, category
  FROM t_servicos
  WHERE active = 1
  ORDER BY ordem ASC;
END //

DROP PROCEDURE IF EXISTS s_listar_promocoes //
CREATE PROCEDURE s_listar_promocoes()
BEGIN
  SELECT id, titulo, descricao, imagem_url AS imagemUrl, created_at AS createdAt
  FROM t_promocoes
  WHERE ativo = 1
  ORDER BY created_at DESC;
END //
