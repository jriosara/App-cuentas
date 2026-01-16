import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO, isSameWeek, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import './App.css';

// Configurar URL base de forma robusta
const getApiUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  url = url.trim().replace(/[,/]+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const API_URL = getApiUrl();

// Formateador de moneda COP (sin decimales)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

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
        <h1>Gastos Personales 💰</h1>
        <p className="subtitle">Controla tus finanzas en pesos colombianos</p>
      </header>

      {/* Resumen Global */}
      <section className="summary-section">
        <div className="card balance-card">
          <h3>Balance Total</h3>
          <p className={`amount ${summary.balance >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(summary.balance)}
          </p>
        </div>
        <div className="stats-grid">
          <div className="card income-card">
            <h3>Ingresos</h3>
            <p className="amount positive">+{formatCurrency(summary.income)}</p>
          </div>
          <div className="card expense-card">
            <h3>Gastos</h3>
            <p className="amount negative">-{formatCurrency(summary.expense)}</p>
          </div>
        </div>
      </section>

      <section className="period-stats">
        <div className="stat-pill">
          <span>Esta Semana:</span>
          <strong>{formatCurrency(periodSummary.weeklyExpenses)}</strong>
        </div>
        <div className="stat-pill">
          <span>Este Mes:</span>
          <strong>{formatCurrency(periodSummary.monthlyExpenses)}</strong>
        </div>
      </section>

      <div className="main-content">
        {/* Formulario */}
        <section className="form-section">
          <h2>Agregar Movimiento</h2>
          <form className="transaction-form" onSubmit={handleSubmit}>
            <div className="form-row">
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
                <label>Monto (COP)</label>
                <input 
                  type="number" 
                  name="amount" 
                  placeholder="0" 
                  required 
                  value={formData.amount}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-row">
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
                <div className="type-selector">
                  <label className={`radio-label ${formData.type === 'expense' ? 'selected-expense' : ''}`}>
                    <input 
                      type="radio" 
                      name="type" 
                      value="expense" 
                      checked={formData.type === 'expense'} 
                      onChange={handleInputChange} 
                    />
                    Gasto
                  </label>
                  <label className={`radio-label ${formData.type === 'income' ? 'selected-income' : ''}`}>
                    <input 
                      type="radio" 
                      name="type" 
                      value="income" 
                      checked={formData.type === 'income'} 
                      onChange={handleInputChange} 
                    />
                    Ingreso
                  </label>
                </div>
              </div>
            </div>
            <button type="submit" className="submit-btn">
              {formData.type === 'expense' ? '💸 Registrar Gasto' : '💰 Registrar Ingreso'}
            </button>
          </form>
        </section>

        {/* Lista de Transacciones */}
        <section className="list-section">
          <h2>Historial</h2>
          <div className="transaction-list">
            {loading ? (
              <div className="loading-state">Cargando...</div>
            ) : transactions.length === 0 ? (
              <div className="empty-state">No hay movimientos registrados.</div>
            ) : (
              transactions.map(t => (
                <div key={t.id} className="transaction-item">
                  <div className="t-icon">
                    {t.type === 'income' ? '↓' : '↑'}
                  </div>
                  <div className="t-info">
                    <span className="t-desc">{t.description}</span>
                    <span className="t-date">
                      {format(parseISO(t.date), "d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                  <div className="t-actions">
                    <span className={`t-amount ${t.type}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                    <button className="delete-btn" onClick={() => handleDelete(t.id)} title="Eliminar">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
