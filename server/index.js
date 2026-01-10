const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const supabase = require('./supabaseClient');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas básicas
app.get('/', (req, res) => {
  res.send('API de Control de Gastos funcionando 🚀');
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

// Obtener resumen (esto se puede calcular en frontend, pero un endpoint dedicado es útil)
app.get('/api/summary', async (req, res) => {
  // Aquí podríamos hacer consultas complejas o traer todo y filtrar.
  // Por simplicidad traeremos todo y el frontend procesará, o podemos usar RPC de supabase si fuera necesario.
  // Para este MVP, dejaremos que el frontend calcule los totales con la data de /transactions o crearemos endpoints específicos si crece.
  res.status(501).json({ message: "Not implemented yet, use frontend calculation for now" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
