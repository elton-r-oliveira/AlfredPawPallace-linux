const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');

router.use(auth);

// GET /usuarios/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('CALL s_buscar_usuario_por_id(?)', [req.params.id]);
    const usuario = rows[0][0];
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json(usuario);
  } catch (err) {
    console.error('[GET /usuarios/:id]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// PUT /usuarios/:id
router.put('/:id', async (req, res) => {
  if (req.usuario.id !== req.params.id) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  const { nome, telefone, endereco, cep, rua, cidade, estado, numero } = req.body;
  try {
    await pool.execute('CALL s_atualizar_usuario(?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      req.params.id, nome || null, telefone || null, endereco || null,
      cep || null, rua || null, cidade || null, estado || null, numero || null,
    ]);

    const [rows] = await pool.execute('CALL s_buscar_usuario_por_id(?)', [req.params.id]);
    res.json(rows[0][0]);
  } catch (err) {
    console.error('[PUT /usuarios/:id]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;
