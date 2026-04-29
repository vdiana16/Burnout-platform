import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const QuizPage = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showValidation, setShowValidation] = useState(false);

  const questionRefs = useRef({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem('access'); 
        
        // 1. Verificăm Profilul
        const profileResponse = await fetch('http://127.0.0.1:8000/api/students/me/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (profileResponse.status === 404) {
          navigate('/student-profile'); 
          return; 
        }

        // 2. Aducem Întrebările
        const questionsResponse = await fetch('http://127.0.0.1:8000/api/questions/', {
          headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json'
          }
        });
        
        if (!questionsResponse.ok) throw new Error('Eroare la preluarea întrebărilor.');
        
        const questionsData = await questionsResponse.json();
        const sortedQuestions = questionsData.sort((a, b) => a.order - b.order);
        setQuestions(sortedQuestions);

      } catch (err) {
        console.error("Eroare:", err);
        setError("Nu s-au putut încărca datele. Te rugăm să reîncerci.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate]);

  const handleAnswer = (questionOrder, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionOrder]: value
    }));
    setShowValidation(false);
  };

  const isFormComplete = questions.length > 0 && questions.every(q => answers[q.order] !== undefined && answers[q.order] !== '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidation(true);

    if (!isFormComplete) {
      const firstUnanswered = questions.find(q => answers[q.order] === undefined || answers[q.order] === '');
      if (firstUnanswered && questionRefs.current[firstUnanswered.order]) {
        questionRefs.current[firstUnanswered.order].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return; 
    }

    try {
      const token = localStorage.getItem('access');
      const formattedResponses = questions.reduce((acc, q) => {
        acc[`Q${q.order}`] = answers[q.order];
        return acc;
      }, {});

      const payload = {
        responses: formattedResponses
      };
      console.log("Datele care pleacă spre backend:", payload);

      const submitResponse = await fetch('http://127.0.0.1:8000/api/tests/submit/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!submitResponse.ok) throw new Error('Eroare la salvarea testului.');
      
      const responseData = await submitResponse.json();
      setResult(responseData.predicted_cluster);

    } catch (err) {
      console.error(err);
      setError("A apărut o problemă la trimiterea datelor.");
    }
  };

  const getSectionInfo = (order) => {
    if (order === 7 || order === 15 || order === 20) {
        return { title: "🌿 Stil de Viață & Context", color: "#e6ffed", borderColor: "#40916c" };
    }
    if (order >= 9 && order <= 14) {
        return { title: "🚀 Motivație & Satisfacție", color: "#f0f8ff", borderColor: "#2b6cb0" };
    }
    if (order >= 16 && order <= 18) {
        return { title: "⏳ Organizare & Procrastinare", color: "#fffaf0", borderColor: "#dd6b20" };
    }
    if (order >= 21 && order <= 23) {
        return { title: "🌙 Calitatea Somnului", color: "#fdf4ff", borderColor: "#d53f8c" };
    }
    if (order >= 24 && order <= 28) {
        return { title: "📱 Stres Digital & Ecrane", color: "#f0fff4", borderColor: "#38a169" };
    }
    if (order >= 29 && order <= 35) {
        return { title: "🧠 Presiune & Perfecționism", color: "#fff5f5", borderColor: "#e53e3e" };
    }
    if (order >= 36 && order <= 41) {
        return { title: "💬 Viață Socială & Emoții", color: "#faf5ff", borderColor: "#805ad5" };
    }
    return { title: "📌 Alte Întrebări", color: "#f7fafc", borderColor: "#718096" };
  };

  const groupedQuestions = questions.reduce((acc, q) => {
    const section = getSectionInfo(q.order);
    if (!acc[section.title]) {
        acc[section.title] = { info: section, questions: [] };
    }
    acc[section.title].questions.push(q);
    return acc;
  }, {});

  const getClusterInfo = (clusterName) => {
    const name = clusterName.toLowerCase();
    
    // Personalizează aceste cuvinte cheie în funcție de cum se numesc clusterele tale din Python
    if (name.includes('ridicat') || name.includes('sever') || name.includes('epuizare')) {
      return { color: '#e53e3e', bg: '#fff5f5', icon: '🚨', message: 'Nivelul tău de stres pare să fie destul de ridicat. Îți recomandăm să iei o pauză și să consulți sfaturile din dashboard.' };
    }
    if (name.includes('moderat') || name.includes('mediu') || name.includes('risc')) {
      return { color: '#dd6b20', bg: '#fffaf0', icon: '⚠️', message: 'Ești pe o pantă ascendentă a stresului. Încearcă să îți reglezi programul de somn și de studiu.' };
    }
    if (name.includes('scăzut') || name.includes('fără') || name.includes('optim') || name.includes('echilibrat')) {
      return { color: '#38a169', bg: '#f0fff4', icon: '🌿', message: 'Felicitări! Gestionezi bine stresul și ai un echilibru sănătos între facultate și viața personală.' };
    }
    
    // Design default dacă numele clusterului nu se potrivește cu cele de sus
    return { color: '#3182ce', bg: '#ebf8ff', icon: '📊', message: 'Acesta este profilul tău actual. Verifică sfaturile personalizate pregătite pentru tine.' };
  };

  const totalQuestions = questions.length;
  const answeredQuestions = Object.values(answers).filter(val => val !== undefined && val !== '').length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  // --------------------------------

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#2E8B57' }}><h3>Se încarcă evaluarea...</h3></div>;
  if (error) return <div style={{ textAlign: 'center', color: '#e53e3e', padding: '50px' }}><h3>{error}</h3></div>;

  if (result) {
    const clusterInfo = getClusterInfo(result);

    return (
      <div style={{ backgroundColor: '#f8faf9', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '50px 40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
          borderTop: `8px solid ${clusterInfo.color}`
        }}>
          
          <div style={{ fontSize: '4rem', marginBottom: '15px' }}>{clusterInfo.icon}</div>
          <h2 style={{ color: '#2d3748', marginBottom: '10px', fontSize: '1.6rem' }}>Rezultatul Evaluării</h2>
          
          <div style={{ 
            backgroundColor: clusterInfo.bg, 
            color: clusterInfo.color, 
            padding: '20px', 
            borderRadius: '12px', 
            margin: '25px 0',
            fontWeight: 'bold',
            fontSize: '1.8rem',
            border: `1px solid ${clusterInfo.color}40` 
          }}>
            {result}
          </div>

          <p style={{ color: '#4a5568', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.6' }}>
            {clusterInfo.message}
          </p>

          <button 
            onClick={() => navigate('/students/me/')} 
            style={{
              backgroundColor: '#2E8B57',
              color: 'white',
              padding: '16px 30px',
              border: 'none',
              borderRadius: '30px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              boxShadow: '0 4px 6px rgba(46, 139, 87, 0.2)',
            }}
          >
            ÎNTOARCE-TE LA DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8faf9', minHeight: '100vh', padding: '120px 20px 50px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#1b4332', textAlign: 'center', marginBottom: '10px' }}>Evaluare Săptămânală</h1>
        <p style={{ textAlign: 'center', color: '#4a5568', marginBottom: '40px' }}>Răspunde sincer pentru rezultate precise.</p>
        <div style={{ 
            position: 'sticky', 
            top: '80px', 
            zIndex: 10, 
            backgroundColor: '#ffffff', 
            padding: '20px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            marginBottom: '40px',
            border: '1px solid #edf2f7'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600', color: '#2d3748' }}>Progres Evaluare</span>
                <span style={{ fontWeight: '800', color: '#2E8B57' }}>
                    {answeredQuestions} / {totalQuestions}
                </span>
            </div>
            
            {/* Bara vizuală de fundal */}
            <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '10px', height: '12px', overflow: 'hidden' }}>
                {/* Bara de progres efectivă */}
                <div style={{ 
                    width: `${progress}%`, 
                    backgroundColor: progress === 100 ? '#38a169' : '#2E8B57', 
                    height: '100%', 
                    borderRadius: '10px',
                    transition: 'width 0.4s ease-out, background-color 0.4s ease' 
                }}></div>
            </div>
            
            {progress === 100 && (
                 <p style={{ margin: '10px 0 0 0', textAlign: 'center', color: '#38a169', fontWeight: 'bold', fontSize: '0.9rem', animation: 'fadeIn 0.5s' }}>
                    Perfect! Acum poți finaliza evaluarea.
                 </p>
            )}
        </div>
        <form onSubmit={handleSubmit}>
          
          {/* Randăm fiecare grup (secțiune) creat */}
          {Object.entries(groupedQuestions).map(([title, groupData], groupIndex) => (
              <div key={title} style={{ marginBottom: '40px' }}>
                  
                  {/* Titlul Secțiunii */}
                  <div style={{ 
                      backgroundColor: groupData.info.color, 
                      borderLeft: `5px solid ${groupData.info.borderColor}`,
                      padding: '15px 20px', 
                      borderRadius: '8px',
                      marginBottom: '20px'
                  }}>
                      <h2 style={{ margin: 0, color: '#2d3748', fontSize: '1.4rem' }}>{title}</h2>
                  </div>

                  {/* Întrebările din această secțiune */}
                  {groupData.questions.map((q, index) => {
                    const isUnanswered = showValidation && (answers[q.order] === undefined || answers[q.order] === '');
                    
                    return (
                      <div 
                        key={q.order} 
                        ref={(el) => questionRefs.current[q.order] = el}
                        style={{
                          backgroundColor: 'white', padding: '30px', borderRadius: '15px', marginBottom: '20px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                          border: isUnanswered ? '2px solid #fc8181' : '1px solid #e2e8f0'
                        }}
                      >
                        <h3 style={{ marginBottom: '20px', color: '#2d3748', fontSize: '1.1rem' }}>
                          {q.text}
                        </h3>

                        {q.is_numeric ? (
                          <input
                            type="number" step="0.5" min="0" max="24"
                            value={answers[q.order] || ''}
                            onChange={(e) => handleAnswer(q.order, e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '1rem' }}
                            placeholder="Introduceți valoarea..."
                          />
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                            {[1, 2, 3, 4, 5].map((val) => {
                              const displayLabel = q.is_reverse ? (6 - val) : val;
                              return (
                                <button
                                  key={val} type="button" onClick={() => handleAnswer(q.order, val)}
                                  style={{
                                    flex: '1', minWidth: '40px', padding: '15px 10px',
                                    border: '1px solid', borderColor: answers[q.order] === val ? '#2E8B57' : '#e2e8f0',
                                    backgroundColor: answers[q.order] === val ? '#e6f4ea' : 'white',
                                    color: answers[q.order] === val ? '#2E8B57' : '#4a5568',
                                    borderRadius: '10px', cursor: 'pointer', fontWeight: answers[q.order] === val ? 'bold' : 'normal',
                                  }}
                                >
                                  {displayLabel}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {isUnanswered && <p style={{ color: '#e53e3e', fontSize: '0.9rem', marginTop: '15px', marginBottom: '0' }}>⚠️ Răspuns obligatoriu.</p>}
                      </div>
                    );
                  })}
              </div>
          ))}
          
          <div style={{ textAlign: 'center', marginTop: '30px', paddingBottom: '20px' }}>
            {showValidation && !isFormComplete && <p style={{ color: '#e53e3e', marginBottom: '15px', fontWeight: 'bold' }}>Mai ai întrebări la care nu ai răspuns.</p>}
            <button 
              type="submit" 
              style={{ 
                padding: '16px 45px', fontSize: '1.2rem', fontWeight: 'bold',
                backgroundColor: isFormComplete ? '#2E8B57' : '#cbd5e0', 
                color: isFormComplete ? 'white' : '#a0aec0', 
                border: 'none', borderRadius: '30px', cursor: isFormComplete ? 'pointer' : 'default',
              }}
            >
              FINALIZEAZĂ EVALUAREA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizPage;