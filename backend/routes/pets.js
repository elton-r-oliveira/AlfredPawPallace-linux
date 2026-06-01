const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const pool   = require('../db');
const auth   = require('../middleware/auth');

router.use(auth);

// GET /pets
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('CALL s_listar_pets(?)', [req.usuario.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('[GET /pets]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// POST /pets
router.post('/', async (req, res) => {
  const { name, breed, age, weight, animalType } = req.body;
  if (!name || !breed || age == null || weight == null) {
    return res.status(400).json({ erro: 'name, breed, age e weight são obrigatórios' });
  }
  try {
    const id = uuidv4();
    const [rows] = await pool.execute('CALL s_criar_pet(?, ?, ?, ?, ?, ?, ?)', [
      id, req.usuario.id, name, breed, age, weight, animalType || 'dog',
    ]);
    res.status(201).json(rows[0][0]);
  } catch (err) {
    console.error('[POST /pets]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// PUT /pets/:id
router.put('/:id', async (req, res) => {
  const { name, breed, age, weight, animalType } = req.body;
  try {
    const [rows] = await pool.execute('CALL s_atualizar_pet(?, ?, ?, ?, ?, ?, ?)', [
      req.params.id, req.usuario.id, name, breed, age, weight, animalType,
    ]);
    res.json(rows[0][0]);
  } catch (err) {
    console.error('[PUT /pets/:id]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// DELETE /pets/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('CALL s_deletar_pet(?, ?)', [req.params.id, req.usuario.id]);
    res.json({ mensagem: 'Pet excluído com sucesso' });
  } catch (err) {
    console.error('[DELETE /pets/:id]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;
