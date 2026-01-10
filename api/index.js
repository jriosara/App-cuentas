const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Validación de entorno
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('ERROR CRÍTICO: Faltan variables de entorno SUPABASE_URL o SUPABASE_KEY');
}

const supabase = require('./supabaseClient');

const app = express();
// No definimos puerto para listen porque Vercel maneja la conexión

app.use(cors());
app.use(express.json());

// Rutas básicas
app.get('/', (req, res) => {
  res.send('API de Control de Gastos funcionando 🚀');
});

// Endpoint de diagnóstico
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('transactions').select('count', { count: 'exact', head: true });
    if (error) throw error;
    res.json({ 
      status: 'ok', 
      supabase: 'connected', 
      env: {
        hasUrl: !!process.env.SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_KEY
      }
    });
  } catch (err) {
    console.error('Error de salud:', err);
    res.status(500).json({ 
      status: 'error', 
      message: err.message,
      env: {
        hasUrl: !!process.env.SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_KEY
      }
    });
  }
});

// Obtener todas las transacciones (gastos e ingresos)
app.get('/api/transactions', async (req, res) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// Crear una transacción
app.post('/api/transactions', async (req, res) => {
  const { type, amount, description, date } = req.body;
  
  // Validación simple
  if (!type || !amount || !description || !date) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert([
      { type, amount, description, date }
    ])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data[0]);
});

// Eliminar transacción
app.delete('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(204).send();
});

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}

module.exports = app;