-- Migration: adiciona coluna photo_url na tabela t_pets
-- Executar no banco BDAlfredPawPalace antes de subir o novo backend

USE BDAlfredPawPalace;

ALTER TABLE t_pets
  ADD COLUMN photo_url VARCHAR(500) NULL AFTER animal_type;
