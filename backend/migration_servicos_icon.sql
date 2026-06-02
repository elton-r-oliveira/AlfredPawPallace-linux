USE BDAlfredPawPalace;

ALTER TABLE t_servicos
  ADD COLUMN icon VARCHAR(100) NOT NULL DEFAULT 'cut-outline' AFTER category;

UPDATE t_servicos SET icon = 'cut-outline'   WHERE name = 'Banho e Tosa';
UPDATE t_servicos SET icon = 'water-outline' WHERE name = 'Banho';
UPDATE t_servicos SET icon = 'cut-outline'   WHERE name = 'Tosa';
UPDATE t_servicos SET icon = 'medkit-outline' WHERE name = 'Consulta Vet';
UPDATE t_servicos SET icon = 'bandage-outline' WHERE name = 'Vacinação';
UPDATE t_servicos SET icon = 'bed-outline'   WHERE name = 'Hotel Pet';
