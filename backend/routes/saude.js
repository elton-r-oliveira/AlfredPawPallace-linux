const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const pool   = require('../db');
const auth   = require('../middleware/auth');

router.use(auth);

// GET /saude?petId=xxx
router.get('/', async (req, res) => {
  const { petId } = req.query;
  if (!petId) return res.status(400).json({ erro: 'petId é obrigatório' });
  try {
    const [rows] = await pool.execute('CALL s_listar_saude(?, ?)', [petId, req.usuario.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('[GET /saude]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// POST /saude
router.post('/', async (req, res) => {
  const { petId, type, name, date, nextDate, notes } = req.body;
  if (!petId || !type || !name || !date) {
    return res.status(400).json({ erro: 'petId, type, name e date são obrigatórios' });
  }
  try {
    const id = uuidv4();
    const [rows] = await pool.execute('CALL s_criar_saude(?, ?, ?, ?, ?, ?, ?, ?)', [
      id, petId, req.usuario.id, type, name, date, nextDate || null, notes || null,
    ]);
    res.status(201).json(rows[0][0]);
  } catch (err) {
    console.error('[POST /saude]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// PUT /saude/:id
router.put('/:id', async (req, res) => {
  const { name, date, nextDate, notes } = req.body;
  try {
    const [rows] = await pool.execute('CALL s_atualizar_saude(?, ?, ?, ?, ?, ?)', [
      req.params.id, req.usuario.id, name, date, nextDate || null, notes || null,
    ]);
    res.json(rows[0][0]);
  } catch (err) {
    console.error('[PUT /saude/:id]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// DELETE /saude/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('CALL s_deletar_saude(?, ?)', [req.params.id, req.usuario.id]);
    res.json({ mensagem: 'Registro excluído com sucesso' });
  } catch (err) {
    console.error('[DELETE /saude/:id]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;
