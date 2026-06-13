/**
 * StudentDashboardPage.jsx
 * @description Componenta principală tip Dashboard (Portal) dedicată studenților.
 * * Funcționalități principale:
 * - Afișează un mesaj de bun venit personalizat și starea generală curentă: risc ridicat/moderat/scăzut).
 * - Prezintă o analiză detaliată a factorilor de risc (stres, procrastinare) printr-un grafic Radar.
 * - Permite vizualizarea istoricului evaluărilor și a răspunsurilor specifice acordate.
 * - Afișează evoluția stării de bine în timp printr-un grafic de tip LineChart.
 * - Include un modul integrat de Chat Live pentru a comunica direct cu psihologul alocat.
 * - Oferă informații de contact despre psihologul asociat, dacă există.
 * - Verifică stadiul completării profilului și direcționează utilizatorul spre pagina de profil dacă datele esențiale lipsesc.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext'; 
import api from '../../api/axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';

const StudentDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // STATE-URI PENTRU DATE ȘI UI
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [psychologistId, setPsychologistId] = useState(null);
  const [assignedPsychologist, setAssignedPsychologist] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [notification, setNotification] = useState(null);
  const [questions, setQuestions] = useState([]); 
  const [expandedTests, setExpandedTests] = useState({}); 
  
  // REFERINȚE PENTRU CHAT ȘI SCROLL
  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);
  const shouldScrollRef = useRef(false);
  const messagesEndRef = useRef(null)

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

   // HELPERS PENTRU UI
  const toggleTestResponses = (testId) => {
      setExpandedTests(prev => ({
          ...prev,
          [testId]: !prev[testId]
      }));
  };  

  // EFECTE
  // Conexiunea la Chat
  useEffect(() => {
      if (!user?.id) return;
      const url = `ws://127.0.0.1:8000/ws/chat/${user.id}/`;
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        shouldScrollRef.current = true;

        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.sender_id === data.sender_id && lastMsg.message === data.message) {
              return prev; 
          }
          
          return [...prev, {
            sender_id: data.sender_id,
            message: data.message
          }];
        });

        if (data.sender_id !== user?.id) {
          setNotification('Ai un mesaj nou de la psiholog!');
          setTimeout(() => {
            setNotification(null);
          }, 4000);
        }
      };

      return () => {
          socket.close(); 
      };
  }, [user?.id]);


  // Autoscroll Chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
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

  // Preluarea datelor și verificarea profilului
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
                setAssignedPsychologist(data.assigned_psychologist);
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

    const fetchQuestions = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await api.get('/questions/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setQuestions(response.data);
        } catch (err) {
            console.error("Eroare la încărcarea întrebărilor.", err);
        }
    };

    checkProfile();
    fetchResults();
    fetchMessagesHistory();
    fetchQuestions();
  }, [navigate]);

  const handleStartQuiz = () => {
      if (!isProfileComplete) {
          navigate('/student-profile'); 
      } else {
          navigate('/quiz');
      }
  };

  const lastResult = results.length > 0 ? results[0] : null;

  // Pregătire date line chart - evoluție
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

  // Pregătire date radar chart - factori de stres
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

  // RENDER INTERFAȚA PRINCIPALĂ
  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', color: colors.text }}>
      {notification && 
        <div style={{ position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', zIndex:10000, backgroundColor:colors.primary, color:'white', padding:'12px 25px', borderRadius:'50px', boxShadow:'0 8px 20px rgba(0,0,0,0.15)', display:'flex', alignItems:'center', gap:'12px', fontWeight:'bold', fontSize:'1rem', border:'2px solid rgba(255,255,255,0.2)', animation:'fadeInDown 0.3s ease', whiteSpace:'nowrap' }}>
          <span style={{ fontSize:'1.2rem' }}>
            📩
          </span>
          <span>{notification}</span>
        </div>
      }

      {/* HERO BANNER */}
      <div style={{ 
        background: `linear-gradient(135deg, ${colors.primary} 0%, #1b4332 100%)`,
        borderRadius: '24px', padding: '40px', color: 'white',
        boxShadow: '0 12px 30px rgba(46, 139, 87, 0.25)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div style={{ maxWidth: '65%' }}>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '12px', fontWeight: '800' }}>
             Salutare, {user?.first_name || 'Student'}!
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
        {assignedPsychologist && (
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '20px',
            marginBottom: '10px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
          }}>
            {/* Avatar Psiholog */}
            <div style={{ 
              fontSize: '2.5rem', 
              backgroundColor: '#f0fdf4', 
              width: '70px', 
              height: '70px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: '50%',
              border: '2px solid #c6f6d5',
              flexShrink: 0
            }}>
              👨‍⚕️
            </div>
            
            {/* Informații Psiholog */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ margin: 0, color: '#2d3748', fontSize: '1.2rem', fontWeight: '800' }}>
                Dr. {assignedPsychologist.first_name} {assignedPsychologist.last_name}
              </h4>
              
              {/* Rândul 1: Specializare & Locație */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', color: '#4a5568', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: '#718096' }}>Specializare:</span>
                  <span style={{ fontWeight: '600' }}>{assignedPsychologist.specialization || 'Nespecificată'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: '#a0aec0', fontSize: '1.1rem' }}>📍</span>
                  <span style={{ fontWeight: '600' }}>{assignedPsychologist.office_location || assignedPsychologist.institution_name || 'Cabinet Online'}</span>
                </div>
              </div>
              
              {/* Rândul 2: Contact */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', color: '#4a5568', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#f7fafc', padding: '4px 10px', borderRadius: '8px' }}>
                  <span>📧</span>
                  <span style={{ fontWeight: '600', color: '#2b6cb0' }}>{assignedPsychologist.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#f7fafc', padding: '4px 10px', borderRadius: '8px' }}>
                  <span>📞</span>
                  <span style={{ fontWeight: '600', color: '#2b6cb0' }}>{assignedPsychologist.phone_number || 'Nespecificat'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STATUS CURENT */}
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

      {/* ANALIZĂ DETALIATĂ */}
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
  
            <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#6b46c1', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Zona de focus:
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ fontSize: '2.5rem' }}>🎯</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#44337a' }}>
                {topFactor?.factor}
              </div>
            </div>

            <p style={{ fontSize: '1.05rem', margin: '0 0 15px 0', color: '#4a5568', lineHeight: '1.5' }}>
              Conform celei mai recente evaluări, aceasta pare să fie aria care îți consumă cea mai multă energie în acest moment.
            </p> 
            
            <p style={{ fontSize: '0.9rem', color: '#718096', margin: 0, lineHeight: '1.5' }}>
              Graficul radar de alături îți arată zonele tale sensibile. Cu cât forma mov este mai întinsă spre exterior, cu atât nivelul de stres în acea arie este mai ridicat.
            </p>

          </div>

          </div>
        </div>
      )}

      {results.length > 0 && questions.length > 0 && (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f0f4f8', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.4rem', margin: '0 0 20px 0', fontWeight: '800' }}>Istoricul Evaluărilor și Răspunsurile Tale</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {results.map((result, index) => {
              // Verificăm dacă testul curent a fost "apăsat" pentru a-i vedea răspunsurile
              const isExpanded = expandedTests[result.id];              
              const dateObj = new Date(result.taken_at);
              const formattedDate = `${dateObj.toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' })} - ${dateObj.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`;
              
              return (
                <div key={result.id} style={{ border: '1px solid #edf2f7', borderRadius: '16px', padding: '20px', backgroundColor: isExpanded ? '#ffffff' : '#f8fafc', transition: 'all 0.3s ease' }}>
                  
                  {/* HEADER-UL TESTULUI */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#4a5568', fontSize: '1.1rem' }}>
                        Evaluarea {results.length - index} 
                        <span style={{ fontWeight: 'normal', fontSize: '0.9rem', color: '#a0aec0', marginLeft: '10px' }}>({formattedDate})</span>
                      </div>
                      <div style={{ marginTop: '5px', fontSize: '0.95rem' }}>
                        Rezultat evaluare: <span style={{ 
                          fontWeight: 'bold', 
                          color: result.predicted_cluster.toLowerCase().includes('ridicat') || result.predicted_cluster.toLowerCase().includes('epuizare') 
                            ? colors.danger 
                            : result.predicted_cluster.toLowerCase().includes('moderat') 
                              ? colors.warning 
                              : colors.success 
                        }}>
                          {result.predicted_cluster}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleTestResponses(result.id)}
                      style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0', backgroundColor: isExpanded ? '#f1f5f9' : 'white', cursor: 'pointer', fontWeight: 'bold', color: colors.text, transition: '0.2s' }}
                    >
                      {isExpanded ? 'Ascunde' : 'Vezi Răspunsurile'}
                    </button>
                  </div>

                  {/* LISTA DE RĂSPUNSURI */}
                  {isExpanded && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #edf2f7' }}>
                      {Object.entries(result.responses).map(([key, value]) => {
                        const qOrder = parseInt(key.replace('Q', ''));
                        const questionObj = questions.find(q => q.order === qOrder);
                        const questionText = questionObj ? questionObj.text : `Întrebarea ${qOrder}`;

                        let isDangerous = false;
                        const numValue = parseFloat(value);

                        if (questionObj) {
                          if (questionObj.is_numeric) {
                            if (qOrder === 20) {
                              isDangerous = numValue < 6;
                            } else if (qOrder === 15) {
                              isDangerous = numValue >= 8;
                            } else if (qOrder === 27) {
                              isDangerous = numValue >= 5; 
                            }
                          } else {
                            const positiveQuestions = [9, 10, 12, 13, 14, 18, 21, 23, 24, 25, 36, 37, 40];
                            if (positiveQuestions.includes(qOrder)) {
                              isDangerous = numValue <= 2;
                            } else {
                              isDangerous = numValue >= 4;
                            }
                          }
                        }

                        const textColor = isDangerous ? colors.danger : colors.primary;
                        const bgColor = isDangerous ? '#fff5f5' : '#e6fffa';

                        return (
                          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                            <span style={{ fontWeight: '500', color: '#4a5568', flex: 1, paddingRight: '15px', fontSize: '0.95rem' }}>
                              {questionText}
                            </span>
                            <span style={{ fontWeight: '900', color: textColor, minWidth: '40px', textAlign: 'center', backgroundColor: bgColor, padding: '4px 8px', borderRadius: '6px' }}>
                              {value}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GRAFIC EVOLUȚIE */}
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

      {/* CHAT LIVE CU PSIHOLOGUL */}
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '20px', fontWeight: '800' }}>
          Consiliere Live
        </h2>
        
        {/* Verificăm dacă există un psiholog alocat */}
        {!psychologistId ? (
          <div style={{ padding: '30px', backgroundColor: '#fff5f5', borderRadius: '16px', border: '1px solid #fed7d7', color: '#c53030', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Niciun psiholog alocat instituției tale</h3>
              <p style={{ margin: 0 }}>În prezent, universitatea ta nu are un psiholog înregistrat pe platformă. Modulul de mesagerie va fi activat automat imediat ce un specialist se va alătura.</p>
          </div>
        ) : (
          <>
            <div 
              ref={chatContainerRef}
              style={{ 
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
          </>
        )}
      </div>

    </div>
  );
};

export default StudentDashboardPage;