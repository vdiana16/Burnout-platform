import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext'; 
import api from '../../api/axios'; // IMPORTUL LIPSĂ A FOST ADĂUGAT
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
  const [psychologistId, setPsychologistId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const colors = {
    primary: '#2E8B57',    
    secondary: '#f0fdf4',  
    text: '#2d3748',
    danger: '#e53e3e',
    warning: '#ed8936',
    success: '#38a169',
    info: '#3182ce',
    radarFill: '#9f7aea', 
    radarStroke: '#6b46c1'
  };

  // 1. CONEXIUNEA LA CHAT (WEBSOCKET)
  useEffect(() => {
      if (!user?.id) return;
      const url = `ws://127.0.0.1:8000/ws/chat/${user.id}/`;
      socketRef.current = new WebSocket(url);

      socketRef.current.onmessage = (e) => {
          const data = JSON.parse(e.data);
          setMessages((prev) => [...prev, {
              sender_id: data.sender_id,
              message: data.message,
              timestamp: new Date().toLocaleTimeString()
          }]);
      };

      socketRef.current.onclose = () => console.log("Chat deconectat");

      return () => {
          if (socketRef.current) socketRef.current.close();
      };
  }, [user?.id]);

  const sendMessage = () => {
      if (newMessage.trim() === "" || !socketRef.current) return;

      const messageData = {
          message: newMessage,
          sender_id: user.id,
          receiver_id: psychologistId
      };

      socketRef.current.send(JSON.stringify(messageData));
      setNewMessage('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2. PRELUAREA DATELOR ȘI VERIFICAREA PROFILULUI (Logica unificată)
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('access');
        const response = await api.get('/tests/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data) {
          setResults(response.data);
        }
      } catch (err) {
        console.error("Eroare la încărcarea datelor.", err);
      } finally {
        setLoading(false);
      }
    };
    
    const checkProfile = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await api.get('/students/me/', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = response.data;
            
            if (!data.age || !data.academic_gpa) {
                navigate('/student-profile');
                return; 
            }
            
            setIsProfileComplete(true);
            if (data.assigned_psychologist && data.assigned_psychologist.id) {
                setPsychologistId(data.assigned_psychologist.id);
            }
            
        } catch (err) {
            console.error("Eroare verificare profil.", err);
        }
    }

    const fetchMessagesHistory = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await api.get('/messages/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data) {
                const formattedHistory = response.data.map(msg => ({
                    sender_id: msg.sender,
                    message: msg.content
                }));
                setMessages(formattedHistory);
            }
        } catch (err) {
            console.error("Eroare la încărcarea istoricului de mesaje.", err);
        }
    };

    checkProfile();
    fetchResults();
    fetchMessagesHistory();
  }, [navigate]);

  const handleStartQuiz = () => {
      if (!isProfileComplete) {
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

    const getVal = (qNum) => {
        if (Array.isArray(responses)) {
            const item = responses.find(r => r.question_order === qNum);
            return item && item.value ? parseFloat(item.value) : 3;
        } else {
            return parseFloat(responses[`Q${qNum}`] || 3);
        }
    };

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

      {/* 3. ANALIZĂ DETALIATĂ (RADAR CHART) */}
      {lastResult && radarData.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', fontWeight: '800' }}>Amprenta Factorilor de Risc</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            
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

      {/* 4. GRAFIC EVOLUȚIE (LINE CHART) */}
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

      {/* 5. CHAT LIVE CU PSIHOLOGUL */}
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '20px', fontWeight: '800' }}>
          Consiliere Live 💬
        </h2>
        
        <div style={{ 
          height: '350px', overflowY: 'auto', border: '1px solid #edf2f7', 
          borderRadius: '16px', padding: '20px', marginBottom: '20px', 
          backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' 
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#a0aec0', margin: 'auto' }}>
              Începe o conversație cu psihologul tău pentru suport personalizat.
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} style={{ 
                alignSelf: msg.sender_id === user.id ? 'flex-end' : 'flex-start',
                backgroundColor: msg.sender_id === user.id ? colors.primary : '#ffffff',
                color: msg.sender_id === user.id ? 'white' : colors.text,
                padding: '10px 18px', borderRadius: '18px', maxWidth: '75%',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: msg.sender_id === user.id ? 'none' : '1px solid #edf2f7'
              }}>
                {msg.message}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Scrie un mesaj psihologului..."
            style={{ 
              flex: 1, padding: '14px 20px', borderRadius: '30px', 
              border: '1px solid #e2e8f0', outline: 'none', fontSize: '1rem' 
            }}
          />
          <button 
            onClick={sendMessage}
            style={{ 
              padding: '12px 28px', backgroundColor: colors.primary, 
              color: 'white', border: 'none', borderRadius: '30px', 
              cursor: 'pointer', fontWeight: 'bold', transition: '0.2s'
            }}
          >
            Trimite
          </button>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboardPage;