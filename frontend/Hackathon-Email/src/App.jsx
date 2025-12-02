import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [date] = useState('06/12/2025');
  
  // Dados para o gráfico de barras (E-mails por Estado)
  const estadosData = [
    { estado: 'PI', valor: 180 },
    { estado: 'CE', valor: 240 },
    { estado: 'MA', valor: 160 },
    { estado: 'SP', valor: 420 },
    { estado: 'RJ', valor: 280 }
  ];

  // Dados para o gráfico de linha (Últimos 7 dias)
  const tendenciaData = [
    { dia: 'Seg', emails: 120 },
    { dia: 'Ter', emails: 180 },
    { dia: 'Qua', emails: 150 },
    { dia: 'Qui', emails: 200 },
    { dia: 'Sex', emails: 160 },
    { dia: 'Sáb', emails: 190 },
    { dia: 'Dom', emails: 220 }
  ];

  // Top 3 destinatários
  const topDestinatarios = [
    { nome: 'clienteA...', quantidade: 230 },
    { nome: 'clienteB...', quantidade: 185 },
    { nome: 'clienteC...', quantidade: 120 }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Título */}
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Protótipo Tela 1: Dashboard
        </h1>

        {/* Header com data */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
          <span className="text-gray-600">Resumo geral - {date}</span>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-gray-800 mb-2">1280</div>
            <div className="text-gray-600 uppercase text-sm tracking-wide">Total</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-gray-800 mb-2">940</div>
            <div className="text-gray-600 uppercase text-sm tracking-wide">Classificados</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-gray-800 mb-2">340</div>
            <div className="text-gray-600 uppercase text-sm tracking-wide">Pendentes</div>
          </div>
        </div>

        {/* Gráfico de Barras - E-mails por Estado */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">E-mails por Estado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={estadosData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="estado" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="valor" fill="#6b7280" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 text-center mt-2">(barras ilustrativas)</p>
        </div>

        {/* Gráfico de Linha - Tendência */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Tendência E-mails por Dia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tendenciaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="emails" stroke="#1f2937" strokeWidth={2} dot={{ fill: '#1f2937' }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 text-right mt-2">Últimos 7 dias</p>
        </div>

        {/* Seção inferior - Top 3 e Atalhos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Destinatários Top 3 */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-dashed border-gray-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Destinatários Top 3</h3>
            <ol className="space-y-2">
              {topDestinatarios.map((destinatario, index) => (
                <li key={index} className="text-gray-700">
                  {index + 1}. {destinatario.nome} ({destinatario.quantidade})
                </li>
              ))}
            </ol>
          </div>

          {/* Atalhos Rápidos */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-dashed border-gray-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Atalhos Rápidos</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 border-2 border-gray-800 text-gray-800 font-medium rounded hover:bg-gray-800 hover:text-white transition-colors">
                VER PENDENTES
              </button>
              <button className="w-full px-4 py-2 border-2 border-gray-800 text-gray-800 font-medium rounded hover:bg-gray-800 hover:text-white transition-colors">
                NOVO MANUAL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;