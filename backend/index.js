const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.use(cors());
app.use(express.json());

app.use('/auth',         require('./routes/auth'));
app.use('/usuarios',     require('./routes/usuarios'));
app.use('/pets',         require('./routes/pets'));
app.use('/agendamentos', require('./routes/agendamentos'));
app.use('/saude',        require('./routes/saude'));
app.use('/unidades',     require('./routes/unidades'));
app.use('/servicos',     require('./routes/servicos'));
app.use('/promocoes',    require('./routes/promocoes'));

app.get('/', (req, res) => {
  res.json({ mensagem: 'Alfred Paw Palace API v1.0' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
