import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO, startOfWeek, startOfMonth, isSameWeek, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import './App.css';

// Configurar URL base de forma robusta
const getApiUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  // Limpiar espacios y comas o slashes al final
  url = url.trim().replace(/[,/]+$/, '');
  
  // Asegurar que termine en /api
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const API_URL = getApiUrl();

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense'
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/transactions`, formData);
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense'
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro?')) return;
    try {
      await axios.delete(`${API_URL}/transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // Cálculos de resumen
  const calculateSummary = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    return {
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense
    };
  };

  const calculatePeriodSummary = () => {
    const now = new Date();
    // Filtros para semana actual y mes actual
    const weeklyExpenses = transactions
      .filter(t => t.type === 'expense' && isSameWeek(parseISO(t.date), now, { weekStartsOn: 1 }))
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const monthlyExpenses = transactions
      .filter(t => t.type === 'expense' && isSameMonth(parseISO(t.date), now))
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    return { weeklyExpenses, monthlyExpenses };
  };

  const summary = calculateSummary();
  const periodSummary = calculatePeriodSummary();

  return (
    <div className="app-container">
      <header className="header">
        <h1>Gastos Personales</h1>
      </header>

      {/* Resumen Global */}
      <section className="summary-cards">
        <div className="card income">
          <h3>Ingresos Totales</h3>
          <p className="amount">+${summary.income.toFixed(2)}</p>
        </div>
        <div className="card expense">
          <h3>Gastos Totales</h3>
          <p className="amount">-${summary.expense.toFixed(2)}</p>
        </div>
        <div className="card balance">
          <h3>Balance</h3>
          <p className="amount">${summary.balance.toFixed(2)}</p>
        </div>
      </section>

      {/* Resumen Periódico (Semanal/Mensual) de Gastos */}
      <section className="summary-cards">
        <div className="card">
          <h3>Gastos Semana Actual</h3>
          <p className="amount">-${periodSummary.weeklyExpenses.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Gastos Mes Actual</h3>
          <p className="amount">-${periodSummary.monthlyExpenses.toFixed(2)}</p>
        </div>
      </section>

      {/* Formulario */}
      <form className="transaction-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Descripción</label>
          <input 
            type="text" 
            name="description" 
            placeholder="Ej. Comida gatos" 
            required 
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Monto</label>
          <input 
            type="number" 
            name="amount" 
            placeholder="0.00" 
            step="0.01" 
            required 
            value={formData.amount}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Fecha</label>
          <input 
            type="date" 
            name="date" 
            required 
            value={formData.date}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Tipo</label>
          <select name="type" value={formData.type} onChange={handleInputChange}>
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
        </div>
        <button type="submit" className="submit-btn">Agregar</button>
      </form>

      {/* Lista de Transacciones */}
      <div className="transaction-list">
        {loading ? (
          <p style={{textAlign: 'center', padding: '1rem'}}>Cargando...</p>
        ) : transactions.length === 0 ? (
          <p style={{textAlign: 'center', padding: '1rem'}}>No hay registros aún.</p>
        ) : (
          transactions.map(t => (
            <div key={t.id} className="transaction-item">
              <div className="t-info">
                <span className="t-desc">{t.description}</span>
                <span className="t-date">{format(parseISO(t.date), "d 'de' MMMM, yyyy", { locale: es })}</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <span className={`t-amount ${t.type}`}>
                  {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                </span>
                <button className="delete-btn" onClick={() => handleDelete(t.id)} title="Eliminar">×</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
