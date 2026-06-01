const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const pool = require('../db');
const auth = require('../middleware/auth');

const uploadDir = path.join(__dirname, '..', 'uploads', 'pets');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  },
});

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
router.post('/', upload.single('photo'), async (req, res) => {
  const { name, breed, age, weight, animalType } = req.body;
  if (!name || !breed || age == null || weight == null) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ erro: 'name, breed, age e weight são obrigatórios' });
  }
  const photoUrl = req.file ? `/uploads/pets/${req.file.filename}` : null;
  try {
    const id = uuidv4();
    const [rows] = await pool.execute('CALL s_criar_pet(?, ?, ?, ?, ?, ?, ?, ?)', [
      id, req.usuario.id, name, breed, parseInt(age), parseFloat(weight), animalType || 'dog', photoUrl,
    ]);
    res.status(201).json(rows[0][0]);
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('[POST /pets]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// PUT /pets/:id
router.put('/:id', upload.single('photo'), async (req, res) => {
  const { name, breed, age, weight, animalType } = req.body;
  const newPhotoUrl = req.file ? `/uploads/pets/${req.file.filename}` : null;
  try {
    if (req.file) {
      const [existing] = await pool.execute(
        'SELECT photo_url FROM t_pets WHERE id = ? AND usuario_id = ?',
        [req.params.id, req.usuario.id]
      );
      const oldUrl = existing[0]?.photo_url;
      if (oldUrl) {
        const oldPath = path.join(__dirname, '..', oldUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }
    const [rows] = await pool.execute('CALL s_atualizar_pet(?, ?, ?, ?, ?, ?, ?, ?)', [
      req.params.id, req.usuario.id, name, breed, parseInt(age), parseFloat(weight), animalType, newPhotoUrl,
    ]);
    res.json(rows[0][0]);
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('[PUT /pets/:id]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// DELETE /pets/:id
router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.execute(
      'SELECT photo_url FROM t_pets WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.usuario.id]
    );
    await pool.execute('CALL s_deletar_pet(?, ?)', [req.params.id, req.usuario.id]);
    const oldUrl = existing[0]?.photo_url;
    if (oldUrl) {
      const oldPath = path.join(__dirname, '..', oldUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    res.json({ mensagem: 'Pet excluído com sucesso' });
  } catch (err) {
    console.error('[DELETE /pets/:id]', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;
