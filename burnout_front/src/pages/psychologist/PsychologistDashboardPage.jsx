import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const PsychologistDashboardPage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentTests, setStudentTests] = useState([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  const colors = {
    primary: '#2E8B57',
    danger: '#e53e3e',
    warning: '#ed8936',
    success: '#38a169',
    bg: '#f7fafc',
    text: '#2d3748'
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/psychologist/students/');
      setStudents(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Eroare la încărcarea listei de studenți.");
      setLoading(false);
    }
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    try {
      const response = await api.get(`/psychologist/students/${student.id}/tests/`);
      setStudentTests(response.data);
      setNote(response.data[0]?.psychologist_notes || '');
    } catch (err) {
      console.error("Eroare la încărcarea istoricului studentului.");
    }
  };

  const handleSaveNote = async () => {
    if (!studentTests[0]) return;
    try {
      await api.patch(`/psychologist/tests/${studentTests[0].id}/notes/`, {
        psychologist_notes: note
      });
      alert("Recomandarea a fost salvată și trimisă studentului!");
      fetchStudents(); 
    } catch (err) {
      alert("Eroare la salvarea notiței.");
    }
  };

  const getLineData = () => {
    return [...studentTests].reverse().map(res => ({
      date: new Date(res.taken_at).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' }),
      nivel: res.predicted_cluster.toLowerCase().includes('ridicat') ? 3 : 
             res.predicted_cluster.toLowerCase().includes('moderat') ? 2 : 1,
      diagnostic: res.predicted_cluster
    }));
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem', color: '#718096' }}>Se încarcă baza de date a instituției...</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'inherit', color: colors.text }}>
      
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ margin: 0, fontWeight: '800', fontSize: '2.2rem' }}>Portal Management Studenți 🎓</h1>
        <p style={{ color: '#718096', fontSize: '1.1rem', marginTop: '10px' }}>
          Monitorizează starea de bine a studenților din instituția ta și oferă feedback personalizat.
        </p>
      </div>

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
                  onMouseOver={(e) => { if(selectedStudent?.id !== s.id) e.currentTarget.style.backgroundColor = '#edf2f7'; }}
                  onMouseOut={(e) => { if(selectedStudent?.id !== s.id) e.currentTarget.style.backgroundColor = '#f7fafc'; }}
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
              
              {/* HEADER PROFIL */}
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', marginBottom: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #edf2f7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: '800' }}>{selectedStudent.first_name} {selectedStudent.last_name}</h2>
                    <p style={{ color: '#718096', margin: 0, fontSize: '1rem' }}>📧 {selectedStudent.email} • 📚 {selectedStudent.education_level}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.85rem', color: '#a0aec0', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Status Curent</p>
                    <span style={{ 
                      padding: '8px 20px', borderRadius: '30px', fontWeight: '800', fontSize: '0.95rem',
                      backgroundColor: studentTests[0]?.predicted_cluster.toLowerCase().includes('ridicat') ? '#fff5f5' : 
                                       studentTests[0]?.predicted_cluster.toLowerCase().includes('moderat') ? '#fffaf0' : '#f0fdf4',
                      color: studentTests[0]?.predicted_cluster.toLowerCase().includes('ridicat') ? colors.danger : 
                             studentTests[0]?.predicted_cluster.toLowerCase().includes('moderat') ? colors.warning : colors.success,
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

              {/* ZONA DE NOTE PSIHOLOG */}
              <div style={{ backgroundColor: '#fffaf0', padding: '30px', borderRadius: '24px', border: '1px solid #feebc8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <div style={{ fontSize: '1.5rem' }}>📝</div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#9c4221', fontWeight: '800' }}>Feedback și Recomandări</h3>
                </div>
                <p style={{ fontSize: '0.95rem', color: '#7b341e', marginBottom: '20px', lineHeight: '1.5' }}>
                  Notițele salvabile aici vor fi vizibile direct pe dashboard-ul studentului la următoarea lui conectare.
                </p>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={studentTests.length === 0}
                  placeholder={studentTests.length === 0 ? "Studentul trebuie să aibă cel puțin un test completat..." : "Scrie recomandările tale aici..."}
                  style={{ 
                    width: '100%', minHeight: '140px', padding: '20px', borderRadius: '16px',
                    border: '1px solid #fbd38d', fontSize: '1.05rem', outline: 'none',
                    fontFamily: 'inherit', resize: 'vertical', backgroundColor: 'white',
                    color: '#2d3748', lineHeight: '1.5', boxSizing: 'border-box'
                  }}
                />
                <div style={{ textAlign: 'right', marginTop: '20px' }}>
                  <button 
                    onClick={handleSaveNote}
                    disabled={studentTests.length === 0}
                    style={{ 
                      padding: '14px 30px', borderRadius: '30px', border: 'none',
                      backgroundColor: studentTests.length === 0 ? '#cbd5e0' : colors.primary, 
                      color: 'white', fontWeight: '800', cursor: studentTests.length === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '1rem', transition: 'all 0.2s',
                      boxShadow: studentTests.length === 0 ? 'none' : '0 4px 15px rgba(46, 139, 87, 0.3)'
                    }}
                  >
                    TRIMITE FEEDBACK
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