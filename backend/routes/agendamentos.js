const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const pool   = require('../db');
const auth   = require('../middleware/auth');

router.use(auth);

// GET /agendamentos/horarios-ocupados?data=YYYY-MM-DD&unidadeId=xxx
// DEVE vir antes de GET /:id para não conflitar com o parâmetro
router.get('/horarios-ocupados', async (req, res) => {
  const { data, unidadeId } = req.query;
  if (!data || !unidadeId) {
    return res.status(400).json({ erro: 'data e unidadeId são obrigatórios' });
  }
  try {
    const [rows] = await pool.execute('CALL s_horarios_ocupados(?, ?)', [data, unidadeId]);
    const horarios = rows[0].map(r => r.horario);
    res.json({ horarios });
  } catch (err) {
    console.error('[GET /agendamentos/horarios-ocupados]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// GET /agendamentos
router.get('/', async (req, res) => {
  const { futuro, status, limite } = req.query;
  try {
    const [rows] = await pool.execute('CALL s_listar_agendamentos(?, ?, ?, ?)', [
      req.usuario.id,
      futuro === 'true' ? 1 : 0,
      status || null,
      null,
    ]);
    let lista = rows[0];
    if (limite) lista = lista.slice(0, parseInt(limite));
    res.json(lista);
  } catch (err) {
    console.error('[GET /agendamentos]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// POST /agendamentos
router.post('/', async (req, res) => {
  const { service, preco, tempoServico, dataHoraAgendamento, unidadeId,
          petId, petNome, petAnimalType } = req.body;

  if (!service || !dataHoraAgendamento || !unidadeId) {
    return res.status(400).json({ erro: 'service, dataHoraAgendamento e unidadeId são obrigatórios' });
  }
  try {
    const id = uuidv4();
    const [rows] = await pool.execute('CALL s_criar_agendamento(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      id, req.usuario.id, unidadeId,
      petId || null, petNome || null, petAnimalType || null,
      service, preco || null, tempoServico || null,
      dataHoraAgendamento,
    ]);
    res.status(201).json(rows[0][0]);
  } catch (err) {
    console.error('[POST /agendamentos]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// PUT /agendamentos/:id
router.put('/:id', async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ erro: 'status é obrigatório' });
  try {
    await pool.execute('CALL s_atualizar_status_agendamento(?, ?, ?)', [
      req.params.id, req.usuario.id, status,
    ]);
    res.json({ id: req.params.id, status });
  } catch (err) {
    console.error('[PUT /agendamentos/:id]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;
