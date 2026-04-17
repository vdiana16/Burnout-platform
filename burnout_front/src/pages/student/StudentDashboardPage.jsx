import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext'; 
// Am adăugat componentele pentru Radar Chart
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';

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
    success: '#38a169',
    info: '#3182ce',
    radarFill: '#9f7aea', // Culoare pentru radar
    radarStroke: '#6b46c1'
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

  // --- PREGĂTIRE DATE LINE CHART (EVOLUȚIE) ---
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

  // --- PREGĂTIRE DATE RADAR CHART (FACTORI DE STRES) ---
  const getRadarData = (responses) => {
    if (!responses) return [];

    // Funcție robustă care suportă atât Dicționar (nou) cât și Listă (teste vechi din baza de date)
    const getVal = (qNum) => {
        if (Array.isArray(responses)) {
            const item = responses.find(r => r.question_order === qNum);
            return item && item.value ? parseFloat(item.value) : 3;
        } else {
            return parseFloat(responses[`Q${qNum}`] || 3);
        }
    };

    // Calculăm mediile exact ca în Backend pentru Modelul XGBoost
    return [
        { factor: 'Procrastinare', scor: (getVal(16) + getVal(17)) / 2 },
        { factor: 'Stres Digital', scor: (getVal(28) + getVal(29)) / 2 },
        { factor: 'Perfecționism', scor: (getVal(33) + getVal(34) + getVal(35)) / 3 },
        { factor: 'Autocritică', scor: getVal(39) },
        { factor: 'Izolare', scor: getVal(38) },
        { factor: 'Lipsă Somn', scor: getVal(22) }
    ];
  };

  const radarData = lastResult ? getRadarData(lastResult.responses) : [];
  // Găsim dinamic care este cel mai mare scor pentru a oferi un feedback inteligent
  const topFactor = radarData.length > 0 ? radarData.reduce((prev, current) => (prev.scor > current.scor) ? prev : current) : null;


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

      {/* 2. STATUS CURENT */}
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

      {/* 3. FEEDBACK PSIHOLOG */}
      {lastResult && lastResult.psychologist_notes && (
        <div style={{ 
          backgroundColor: '#ebf8ff', padding: '25px 40px', borderRadius: '24px', 
          boxShadow: '0 4px 20px rgba(49, 130, 206, 0.1)', border: '1px solid #bee3f8',
          display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '30px'
        }}>
          <div style={{ fontSize: '2rem' }}>💬</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#2b6cb0', textTransform: 'uppercase', letterSpacing: '1px' }}>Mesaj de la Psiholog</h3>
            <p style={{ fontSize: '1.1rem', color: '#2c5282', margin: '10px 0 0 0', lineHeight: '1.6', fontStyle: 'italic', fontWeight: '500' }}>
              "{lastResult.psychologist_notes}"
            </p>
          </div>
        </div>
      )}

      {/* 4. ANALIZĂ DETALIATĂ (RADAR CHART) - NOU! */}
      {lastResult && radarData.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', fontWeight: '800' }}>Amprenta Factorilor de Risc</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            
            {/* Partea Stângă - Graficul */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="factor" tick={{ fill: '#4a5568', fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                  <Radar name="Scor Stres (1-5)" dataKey="scor" stroke={colors.radarStroke} fill={colors.radarFill} fillOpacity={0.5} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Partea Dreaptă - Insight-uri generate automat */}
            <div style={{ backgroundColor: '#faf5ff', padding: '30px', borderRadius: '24px', border: '1px solid #e9d8fd', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#6b46c1' }}>Atenție la:</h4>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎯</div>
              <p style={{ fontSize: '1.1rem', margin: '0 0 10px 0', color: '#4a5568' }}>
                Pe baza ultimului tău test, se pare că <strong>{topFactor?.factor}</strong> a fost cel mai mare factor de presiune (Scor: {topFactor?.scor.toFixed(1)} / 5).
              </p>
              <p style={{ fontSize: '0.95rem', color: '#718096', margin: 0, lineHeight: '1.5' }}>
                Graficul radar de alături îți arată zonele tale sensibile. Cu cât forma mov este mai întinsă spre exterior, cu atât nivelul de stres în acea arie este mai ridicat.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* 5. GRAFIC EVOLUȚIE (LINE CHART) */}
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f0f4f8', marginBottom: '40px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '30px', fontSize: '1.2rem', fontWeight: '700' }}>Evoluția Generală în Timp</h3>
        
        {results.length > 1 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f8" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#a0aec0', fontSize: 11 }} dy={15} padding={{ left: 20, right: 20 }} />
              <YAxis domain={[0.5, 3.5]} ticks={[1, 2, 3]} axisLine={false} tickLine={false} tick={{ fill: '#a0aec0', fontSize: 12, fontWeight: 'bold' }} tickFormatter={(value) => {
                  if (value === 3) return "RIDICAT";
                  if (value === 2) return "MODERAT";
                  if (value === 1) return "SCĂZUT";
                  return "";
                }} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#edf2f7', strokeWidth: 2 }} />
              <Line type="monotone" dataKey="nivel" stroke={colors.primary} strokeWidth={5} dot={{ r: 7, fill: 'white', strokeWidth: 3, stroke: colors.primary }} activeDot={{ r: 10, fill: colors.primary, stroke: 'white', strokeWidth: 4 }} animationDuration={1800} />
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

      {/* 6. RECOMANDĂRI */}
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