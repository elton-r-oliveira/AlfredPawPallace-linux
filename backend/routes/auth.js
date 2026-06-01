const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool    = require('../db');

const JWT_SECRET        = process.env.JWT_SECRET        || 'alfred_secret_dev';
const CODIGO_FUNCIONARIO = process.env.CODIGO_FUNCIONARIO || 'ALFRED2025';

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  try {
    const [rows] = await pool.execute('CALL s_buscar_usuario_por_email(?)', [email]);
    const usuario = rows[0][0];

    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, tipo: usuario.tipo },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const { senha_hash, ...dadosPublicos } = usuario;
    res.json({ token, usuario: dadosPublicos });

  } catch (err) {
    console.error('[POST /auth/login]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// POST /auth/register
router.post('/register', async (req, res) => {
  const { nome, email, senha, tipo, codigoFuncionario } = req.body;

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ erro: 'nome, email, senha e tipo são obrigatórios' });
  }

  if (tipo === 'funcionario' && codigoFuncionario !== CODIGO_FUNCIONARIO) {
    return res.status(403).json({ erro: 'Código de funcionário inválido' });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const id = uuidv4();

    await pool.execute('CALL s_criar_usuario(?, ?, ?, ?, ?)', [
      id, nome, email, senhaHash, tipo,
    ]);

    const token = jwt.sign({ id, tipo }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, usuario: { id, nome, email, tipo } });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }
    console.error('[POST /auth/register]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;
