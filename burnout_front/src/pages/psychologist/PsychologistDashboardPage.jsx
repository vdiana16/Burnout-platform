import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext'; 
import api from '../../api/axios'; 
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const PsychologistDashboardPage = () => {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentTests, setStudentTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestIndex, setSelectedTestIndex] = useState(0);
  const [questionsMap, setQuestionsMap] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  const colors = {
    primary: '#2E8B57',
    danger: '#e53e3e',
    warning: '#ed8936',
    success: '#38a169',
    text: '#2d3748',
    cardBg: '#ffffff'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access');
      // Folosim PATCH sau POST conform viziunii tale din backend
      const response = await api.patch('/psychologist/me/', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 200 || response.status === 201) {
        alert("Profil salvat cu succes!");
        
        // --- ACEASTA ESTE LINIA CARE LIPSEȘTE ---
        navigate('/dashboard'); 
      }
    } catch (err) {
      console.error("Eroare la salvarea profilului:", err);
      alert("Nu s-au putut salva datele.");
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchQuestions(); 
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('access');
      const response = await api.get('/psychologist/students/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data) {
        setStudents(response.data);
      }
    } catch (err) {
      console.error("Eroare la încărcarea listei de studenți.", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('access');
      const response = await api.get('/questions/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data) {
          const qMap = {};
          response.data.forEach(q => {
            qMap[`Q${q.order}`] = { text: q.text }; 
          });
          setQuestionsMap(qMap);
        }
    } catch (err) {
      console.error("Eroare la încărcarea întrebărilor.", err);
    }
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setChatMessages([]); 
    setSelectedTestIndex(0);
    
    try {
      const token = localStorage.getItem('access'); 
      const response = await api.get(`/tests/?student_id=${student.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data) {
        setStudentTests(response.data);
      }
    } catch (err) {
      console.error("Eroare la încărcarea istoricului studentului.", err);
    }
  };

  useEffect(() => {
      const checkProfileAndData = async () => {
        try {
          const token = localStorage.getItem('access');
          
          // 1. Verificăm profilul psihologului
          const profileRes = await api.get('/psychologist/me/', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          // Dacă nu are specializare sau bio, îl trimitem să le completeze
          if (!profileRes.data.specialization || !profileRes.data.bio) {
            navigate('/psychologist-profile');
            return;
          }

          // 2. Dacă profilul e OK, încărcăm datele
          fetchStudents();
          fetchQuestions();
        } catch (err) {
          console.error("Eroare la verificarea profilului:", err);
          navigate('/psychologist-profile');
        }
      };

      checkProfileAndData();
    }, []);


  useEffect(() => {
    if (!selectedStudent || !user?.id) return;

    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('access');
        const response = await api.get(`/messages/?other_user=${selectedStudent.user_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data) {
          const formattedHistory = response.data.map(msg => ({
              sender_id: msg.sender,  
              message: msg.content   
          }));
          setChatMessages(formattedHistory);
        }
      } catch (err) {
        console.error("Eroare la încărcarea istoricului:", err);
      }
    };
    
    fetchHistory();

    const url = `ws://127.0.0.1:8000/ws/chat/${selectedStudent.user_id}/`;
    wsRef.current = new WebSocket(url);

    wsRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setChatMessages((prev) => [...prev, {
        sender_id: data.sender_id,
        message: data.message
      }]);
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [selectedStudent, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (currentMessage.trim() === "" || !selectedStudent || !wsRef.current || !user?.id) return;

    const messageData = {
      message: currentMessage,
      sender_id: user.id, 
      receiver_id: selectedStudent.user_id 
    };

    wsRef.current.send(JSON.stringify(messageData));
    setCurrentMessage('');
  };

  const getLineData = () => {
    if (!studentTests || studentTests.length === 0) return [];
    
    return [...studentTests].reverse().map(res => {
      const cluster = res.predicted_cluster ? res.predicted_cluster.toLowerCase() : '';
      return {
        date: new Date(res.taken_at).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' }),
        nivel: cluster.includes('ridicat') ? 3 : 
               cluster.includes('moderat') ? 2 : 1,
        diagnostic: res.predicted_cluster || 'Necunoscut'
      };
    });
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem', color: '#718096' }}>Se încarcă baza de date a instituției...</div>;

  const highRiskCount = students.filter(s => {
    const diag = s.last_diagnostic ? s.last_diagnostic.toLowerCase() : '';
    return diag.includes('ridicat');
  }).length;

  const getOverallStatus = () => {
    if (students.length === 0) return "Fără Date";
    
    let counts = { ridicat: 0, moderat: 0, scazut: 0 };
    
    students.forEach(s => {
      const diag = s.last_diagnostic ? s.last_diagnostic.toLowerCase() : '';
      if (diag.includes('ridicat')) counts.ridicat++;
      else if (diag.includes('moderat')) counts.moderat++;
      else if (diag.includes('scăzut') || diag.includes('scazut')) counts.scazut++;
    });

    if (counts.ridicat === 0 && counts.moderat === 0 && counts.scazut === 0) return "Fără Evaluări";
    if (counts.ridicat >= counts.moderat && counts.ridicat >= counts.scazut) return "Risc Ridicat";
    if (counts.moderat >= counts.ridicat && counts.moderat >= counts.scazut) return "Risc Moderat";
    return "Stare Bună";
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'inherit', color: colors.text }}>
      
      {/* HEADER DASHBOARD */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontWeight: '800', fontSize: '2.2rem' }}>Portal Management Studenți 🎓</h1>
        <p style={{ color: '#718096', fontSize: '1.1rem', marginTop: '10px' }}>
          Monitorizează starea de bine a studenților din instituția ta și oferă feedback personalizat.
        </p>
      </div>

      {/* STATISTICI GLOBALE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: colors.cardBg, padding: '25px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #edf2f7', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#e6fffa', padding: '20px', borderRadius: '20px', fontSize: '2rem' }}>👥</div>
          <div>
            <p style={{ margin: 0, color: '#a0aec0', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Studenți</p>
            <h3 style={{ margin: '5px 0 0 0', color: '#2d3748', fontSize: '2.2rem', fontWeight: '900' }}>{students.length}</h3>
          </div>
        </div>

        <div style={{ backgroundColor: colors.cardBg, padding: '25px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #edf2f7', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#fff5f5', padding: '20px', borderRadius: '20px', fontSize: '2rem' }}>🚨</div>
          <div>
            <p style={{ margin: 0, color: '#a0aec0', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Risc Ridicat</p>
            <h3 style={{ margin: '5px 0 0 0', color: highRiskCount > 0 ? colors.danger : colors.success, fontSize: '2.2rem', fontWeight: '900' }}>
              {highRiskCount} <span style={{fontSize: '1rem', color: '#718096', fontWeight: '600'}}>studenți</span>
            </h3>
          </div>
        </div>

        <div style={{ backgroundColor: colors.cardBg, padding: '25px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #edf2f7', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#fffaf0', padding: '20px', borderRadius: '20px', fontSize: '2rem' }}>📊</div>
          <div>
            <p style={{ margin: 0, color: '#a0aec0', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Stare Generală</p>
            <h3 style={{ margin: '8px 0 0 0', color: colors.warning, fontSize: '1.4rem', fontWeight: '900' }}>
              {getOverallStatus()}
            </h3>
          </div>
        </div>
      </div>

      {/* CONȚINUTUL PRINCIPAL */}
      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* COLOANA STÂNGA: LISTA STUDENȚI */}
        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #edf2f7' }}>
          <h3 style={{ fontSize: '1rem', color: '#a0aec0', marginTop: 0, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Studenți ({students.length})
          </h3>
          <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '5px' }}>
            {students.length === 0 ? (
              <p style={{ color: '#a0aec0', fontSize: '0.9rem' }}>Niciun student înscris încă.</p>
            ) : (
              students.map(s => (
                <div 
                  key={s.id}
                  onClick={() => handleSelectStudent(s)}
                  style={{ 
                    padding: '15px 20px', borderRadius: '16px', marginBottom: '12px', cursor: 'pointer',
                    border: `2px solid ${selectedStudent?.id === s.id ? colors.primary : 'transparent'}`,
                    backgroundColor: selectedStudent?.id === s.id ? '#f0fdf4' : '#f7fafc',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '1.05rem', color: selectedStudent?.id === s.id ? colors.primary : colors.text }}>
                    {s.first_name} {s.last_name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '4px' }}>
                    {s.field} | {s.study_stage}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLOANA DREAPTĂ: DETALII STUDENT SELECTAT */}
        <div style={{ minHeight: '70vh' }}>
          {selectedStudent ? (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              
              {/* HEADER PROFIL STUDENT */}
             <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', marginBottom: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #edf2f7' }}>
                {/* Am adăugat flexWrap și gap aici pentru ecrane mai mici */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: '800' }}>{selectedStudent.first_name} {selectedStudent.last_name}</h2>
                    <p style={{ color: '#718096', margin: 0, fontSize: '1rem' }}>📧 {selectedStudent.email} • 📚 {selectedStudent.education_level}</p>
                  </div>
                  
                  {/* Am transformat acest container într-un flexbox tip coloană */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <p style={{ fontSize: '0.85rem', color: '#a0aec0', margin: 0, textTransform: 'uppercase' }}>Status Curent</p>
                    <span style={{ 
                      display: 'inline-block', /* Aceasta previne suprapunerea pe verticală */
                      whiteSpace: 'nowrap', /* Previne ruperea textului pe 2 rânduri */
                      padding: '8px 20px', borderRadius: '30px', fontWeight: '800', fontSize: '0.95rem',
                      backgroundColor: studentTests[0]?.predicted_cluster?.toLowerCase().includes('ridicat') ? '#fff5f5' : 
                                      studentTests[0]?.predicted_cluster?.toLowerCase().includes('moderat') ? '#fffaf0' : '#f0fdf4',
                      color: studentTests[0]?.predicted_cluster?.toLowerCase().includes('ridicat') ? colors.danger : 
                            studentTests[0]?.predicted_cluster?.toLowerCase().includes('moderat') ? colors.warning : colors.success,
                    }}>
                      {studentTests[0]?.predicted_cluster || 'FĂRĂ EVALUĂRI'}
                    </span>
                  </div>
                </div>
              </div>

              {/* GRAFIC EVOLUȚIE */}
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', marginBottom: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #edf2f7' }}>
                <h3 style={{ marginTop: 0, marginBottom: '25px', color: '#2d3748', fontSize: '1.2rem', fontWeight: '700' }}>Evoluția Diagnosticelor</h3>
                {studentTests.length > 1 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={getLineData()} margin={{ top: 10, right: 30, bottom: 10, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f8" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a0aec0' }} dy={10} />
                      <YAxis domain={[0.5, 3.5]} ticks={[1, 2, 3]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#a0aec0' }} tickFormatter={v => v === 3 ? 'RIDICAT' : v === 2 ? 'MODERAT' : 'SCĂZUT'} />
                      <Tooltip cursor={{ stroke: '#edf2f7', strokeWidth: 2 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}/>
                      <Line type="monotone" dataKey="nivel" stroke={colors.primary} strokeWidth={4} dot={{ r: 6, fill: 'white', strokeWidth: 3, stroke: colors.primary }} activeDot={{ r: 8, fill: colors.primary, stroke: 'white' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#a0aec0' }}>
                    Sunt necesare cel puțin două evaluări pentru a afișa graficul.
                  </div>
                )}
              </div>

              {/* RĂSPUNSURILE LA EVALUĂRI (CU ISTORIC) */}
              {studentTests.length > 0 && (
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', marginBottom: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #edf2f7' }}>
                  
                  {/* Header-ul secțiunii cu Dropdown-ul de selecție a datei */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ margin: 0, color: '#2d3748', fontSize: '1.2rem', fontWeight: '700' }}>
                      Răspunsuri la chestionar
                    </h3>
                    
                    <select 
                      value={selectedTestIndex}
                      onChange={(e) => setSelectedTestIndex(Number(e.target.value))}
                      style={{ 
                        padding: '10px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', 
                        outline: 'none', fontWeight: 'bold', color: colors.primary, cursor: 'pointer',
                        backgroundColor: '#f8fafc'
                      }}
                    >
                      {studentTests.map((test, index) => (
                        <option key={test.id} value={index}>
                          {new Date(test.taken_at).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} 
                          {' - '} {test.predicted_cluster}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Lista cu Răspunsurile efective */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {studentTests[selectedTestIndex] && studentTests[selectedTestIndex].responses ? (
                      [
                        // 1. Adăugăm manual cele 6 variabile din profilul studentului selectat
                        { label: "Vârstă Student", value: selectedStudent?.age },
                        { label: "Medie Academică (GPA)", value: selectedStudent?.academic_gpa },
                        { label: "Nivel Educație", value: selectedStudent?.education_level },
                        { label: "An de Studiu", value: selectedStudent?.study_stage },
                        { label: "Domeniu de Studiu", value: selectedStudent?.field },
                        { label: "Statut Angajare", value: selectedStudent?.employment },
                        
                        // 2. Extragem restul variabilelor din test (Q1, Q2, etc.) și le adăugăm în aceeași listă
                        ...Object.entries(studentTests[selectedTestIndex].responses).map(([key, val]) => ({
                          label: questionsMap[key]?.text || `Întrebarea ${key.replace('Q', '')}`,
                          value: val
                        }))
                      ].map((item, idx) => (
                        <div key={idx} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: idx < 6 ? '#edf2f7' : '#f8fafc', // Primele 6 variabile vor avea un fundal gri ușor diferit pentru a le separa vizual
                          padding: '12px 20px', 
                          borderRadius: '12px', 
                          border: '1px solid #edf2f7',
                          marginBottom: '4px'
                        }}>
                          {/* Numele variabilei sau textul întrebării */}
                          <div style={{ fontSize: '0.95rem', color: '#4a5568', flex: 1, paddingRight: '15px', fontWeight: idx < 6 ? '700' : '500' }}>
                            {item.label}
                          </div>
                          
                          {/* Valoarea variabilei */}
                          <div style={{ 
                            fontSize: '1.1rem', 
                            color: '#2d3748',
                            fontWeight: '800',
                            backgroundColor: 'white',
                            padding: '6px 16px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            minWidth: '45px',
                            textAlign: 'center',
                            border: '1px solid #e2e8f0'
                          }}>
                            {item.value || 'N/A'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: '#a0aec0' }}>Datele nu sunt disponibile pentru acest test.</div>
                    )}
                  </div>
                  </div>
              )}

              {/* ZONA DE CHAT LIVE */}
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', marginBottom: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #edf2f7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '1.5rem' }}>💬</div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#2d3748', fontWeight: '800' }}>Chat Live cu {selectedStudent.first_name}</h3>
                </div>
                
                {/* Fereastra mesaje */}
                <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #edf2f7', borderRadius: '16px', padding: '20px', marginBottom: '20px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {chatMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#a0aec0', margin: 'auto' }}>
                      Niciun mesaj anterior. Începe conversația!
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <div key={index} style={{ 
                        alignSelf: msg.sender_id === user.id ? 'flex-end' : 'flex-start',
                        backgroundColor: msg.sender_id === user.id ? colors.primary : '#ffffff',
                        color: msg.sender_id === user.id ? 'white' : colors.text,
                        padding: '10px 18px', borderRadius: '18px', maxWidth: '75%',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)', 
                        border: msg.sender_id === user.id ? 'none' : '1px solid #edf2f7'
                      }}>
                        {msg.message}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input mesaje */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input 
                    type="text" 
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Scrie un mesaj studentului..."
                    style={{ flex: 1, padding: '14px 20px', borderRadius: '30px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '1rem' }}
                  />
                  <button 
                    onClick={handleSendMessage}
                    style={{ padding: '12px 28px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}
                  >
                    Trimite
                  </button>
                </div>
              </div>
              
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0', textAlign: 'center', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #edf2f7', borderStyle: 'dashed' }}>
              <div>
                <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}>🔍</div>
                <h2 style={{ margin: '0 0 10px 0', color: '#718096' }}>Niciun profil selectat</h2>
                <p style={{ margin: 0 }}>Alege un student din lista din stânga <br/> pentru a-i analiza rezultatele.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PsychologistDashboardPage;