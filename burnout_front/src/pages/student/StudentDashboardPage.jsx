import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext'; 
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudentDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const colors = {
    primary: '#2E8B57',    
    secondary: '#f0fdf4',  
    text: '#2d3748',
    danger: '#e53e3e',
    warning: '#ed8936',
    success: '#38a169'
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('access');
        const response = await fetch('http://127.0.0.1:8000/api/tests/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Eroare la încărcarea datelor.");
      } finally {
        setLoading(false);
      }
    };
    
    const checkProfile = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch('http://127.0.0.1:8000/api/students/me/', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.education_level || data.age) {
                    setIsProfileComplete(true);
                }
            }
        } catch (err) {
            console.error("Eroare verificare profil.");
        }
    }

    fetchResults();
    checkProfile();
  }, []);

  const handleStartQuiz = () => {
      if (!isProfileComplete) {
          alert("Te rugăm să îți completezi profilul academic înainte de a da primul test!");
          navigate('/student-profile'); 
      } else {
          navigate('/quiz');
      }
  };

  const lastResult = results.length > 0 ? results[0] : null;

  const chartData = [...results].reverse().map(res => {
    let score = 1; 
    const cluster = res.predicted_cluster.toLowerCase();
    
    if (cluster.includes('ridicat') || cluster.includes('sever') || cluster.includes('epuizare')) score = 3;
    else if (cluster.includes('moderat') || cluster.includes('mediu')) score = 2;
    else score = 1; 
    
    const dateObj = new Date(res.taken_at);
    const formattedDate = `${dateObj.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })} ${dateObj.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`;

    return {
      date: formattedDate,
      nivel: score,
      diagnostic: res.predicted_cluster 
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      let color = colors.success;
      if (data.nivel === 3) color = colors.danger;
      if (data.nivel === 2) color = colors.warning;

      return (
        <div style={{ backgroundColor: 'white', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#718096', fontSize: '0.85rem' }}>{label}</p>
          <p style={{ margin: 0, color: color, fontWeight: 'bold', fontSize: '1.1rem' }}>{data.diagnostic}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', color: colors.text }}>
      
      {/* 1. HERO BANNER */}
      <div style={{ 
        background: `linear-gradient(135deg, ${colors.primary} 0%, #1b4332 100%)`,
        borderRadius: '24px', padding: '40px', color: 'white',
        boxShadow: '0 12px 30px rgba(46, 139, 87, 0.25)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div style={{ maxWidth: '65%' }}>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '12px', fontWeight: '800' }}>
             Salutare, {user?.first_name || 'Student'}! 👋
          </h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.9, lineHeight: '1.5' }}>
            Ești la un pas de a înțelege mai bine starea ta de bine. Monitorizarea constantă te ajută să previi epuizarea.
          </p>
          <button 
            onClick={handleStartQuiz}
            style={{ 
              marginTop: '30px', padding: '16px 32px', borderRadius: '35px', border: 'none',
              backgroundColor: 'white', color: colors.primary, fontWeight: '800',
              cursor: 'pointer', fontSize: '1.05rem', transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'; }}
            onMouseOut={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'; }}
          >
            {lastResult ? "EFECTUEAZĂ O NOUĂ EVALUARE" : "ÎNCEPE PRIMA EVALUARE"}
          </button>
        </div>
        <div style={{ fontSize: '7rem', opacity: 0.15 }}>🌿</div>
      </div>

      {/* 2. STATUS CURENT (Acum pe linie separată) */}
      <div style={{ 
        backgroundColor: 'white', padding: '25px 40px', borderRadius: '24px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f0f4f8',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px' }}>Statusul tău curent</h3>
          <div style={{ 
            fontSize: '1.8rem', fontWeight: '800', marginTop: '5px',
            color: lastResult?.predicted_cluster.toLowerCase().includes('ridicat') ? colors.danger : 
                   lastResult?.predicted_cluster.toLowerCase().includes('moderat') ? colors.warning : colors.success
          }}>
            {lastResult ? lastResult.predicted_cluster : "Fără date"}
          </div>
        </div>
        {lastResult && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.9rem', color: '#a0aec0', margin: 0 }}>Ultima evaluare finalizată pe:</p>
            <p style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>{new Date(lastResult.taken_at).toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        )}
      </div>

      {/* 3. GRAFIC EVOLUȚIE (Pe linie separată, mai mare) */}
      <div style={{ 
        backgroundColor: 'white', padding: '30px', borderRadius: '24px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f0f4f8',
        marginBottom: '40px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '30px', fontSize: '1.2rem', fontWeight: '700' }}>Evoluția Nivelului de Stres</h3>
        
        {results.length > 1 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f8" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#a0aec0', fontSize: 11 }} 
                dy={15}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis 
                domain={[0.5, 3.5]} 
                ticks={[1, 2, 3]} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#a0aec0', fontSize: 12, fontWeight: 'bold' }}
                tickFormatter={(value) => {
                  if (value === 3) return "RIDICAT";
                  if (value === 2) return "MODERAT";
                  if (value === 1) return "SCĂZUT";
                  return "";
                }}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#edf2f7', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="nivel" 
                stroke={colors.primary} 
                strokeWidth={5} 
                dot={{ r: 7, fill: 'white', strokeWidth: 3, stroke: colors.primary }} 
                activeDot={{ r: 10, fill: colors.primary, stroke: 'white', strokeWidth: 4 }}
                animationDuration={1800}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0', textAlign: 'center' }}>
            <div>
               <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📈</div>
               <p style={{ fontSize: '1.1rem' }}>Vei vedea graficul evoluției tale <br/> imediat ce finalizezi a doua evaluare.</p>
            </div>
          </div>
        )}
      </div>

      {/* 4. RECOMANDĂRI */}
      <div>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '25px', fontWeight: '800' }}>Recomandări pentru Tine</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '25px', backgroundColor: colors.secondary, borderRadius: '20px', border: '1px solid #dcfce7', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2rem', marginBottom: '15px' }}>⏱️</div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Tehnica Pomodoro</h4>
            <p style={{ fontSize: '0.9rem', color: '#4a5568', lineHeight: '1.5' }}>Ideală pentru sesiunile lungi de studiu. Împarte timpul în intervale de 25 min cu pauze de 5 min.</p>
          </div>
          <div style={{ padding: '25px', backgroundColor: '#fffaf0', borderRadius: '20px', border: '1px solid #feebc8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '15px' }}>🧘</div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Mindfulness</h4>
            <p style={{ fontSize: '0.9rem', color: '#4a5568', lineHeight: '1.5' }}>Exercițiile scurte de respirație pot reduce nivelul de cortizol (hormonul stresului) instantaneu.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;