const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('CALL s_listar_servicos()');
    res.json(rows[0]);
  } catch (err) {
    console.error('[GET /servicos]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;
