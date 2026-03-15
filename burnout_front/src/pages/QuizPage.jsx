import React, { useState, useEffect, useRef } from 'react';

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
        
        const profileResponse = await fetch('http://127.0.0.1:8000/api/student/profile/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (profileResponse.status === 404) {
          navigate('/student-profile'); 
          return; 
        }

        const questionsResponse = await fetch('http://127.0.0.1:8000/api/questions/', {
          headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json'
          }
        });
        
        if (!questionsResponse.ok) throw new Error('Eroare la preluarea întrebărilor.');
        
        const data = await questionsResponse.json();
        setQuestions(data);
        setLoading(false);
        
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [navigate]);

  const handleAnswerChange = (order, value) => {
    setAnswers(prev => ({
      ...prev,
      [`Q${order}`]: value
    }));
    if (showValidation) setShowValidation(false);
  };

  const progressPercentage = questions.length > 0 
    ? Math.round((Object.keys(answers).length / questions.length) * 100) 
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(answers).length < questions.length) {
      setShowValidation(true);
      
      const firstMissingOrder = questions.find(q => answers[`Q${q.order}`] === undefined)?.order;
      if (firstMissingOrder && questionRefs.current[firstMissingOrder]) {
        questionRefs.current[firstMissingOrder].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return; 
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      const response = await fetch('http://127.0.0.1:8000/api/test-submit/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: answers })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.');
      setResult(data.predicted_cluster);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2rem' }}>Se pregătește chestionarul... ⏳</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>Eroare: {error}</div>;

  if (result) {
    return (
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '40px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '15px', backgroundColor: '#fff' }}>
        <h2 style={{ color: '#2E5F8A', marginBottom: '10px' }}>Evaluare Finalizată! 🎉</h2>
        <p style={{ fontSize: '1.1rem', color: '#555' }}>Analiza răspunsurilor tale a fost încheiată cu succes.</p>
        <div style={{ margin: '30px 0', padding: '20px', borderRadius: '10px', backgroundColor: result === 'Risc Ridicat' ? '#fdecea' : result === 'Risc Moderat' ? '#fef5e7' : '#eafaf1' }}>
          <h1 style={{ color: result === 'Risc Ridicat' ? '#d9534f' : result === 'Risc Moderat' ? '#f0ad4e' : '#27ae60', fontSize: '2.5rem', margin: '0' }}>
            {result}
          </h1>
        </div>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>Acest rezultat a fost salvat automat și poate fi discutat cu consilierul tău.</p>
      </div>
    );
  }

  const categorii = [
    { titlu: "📚 Motivație și Activitate", descriere: "Să vedem cum te raportezi la studiu și organizare.", orders: [9, 10, 12, 13, 14, 15, 16, 17, 18] },
    { titlu: "🛌 Stil de Viață și Somn", descriere: "Obiceiurile tale zilnice și calitatea odihnei.", orders: [20, 21, 22, 23, 24, 25, 26, 27] },
    { titlu: "📱 Stres Digital", descriere: "Impactul tehnologiei asupra stării tale.", orders: [28, 29, 30] },
    { titlu: "❤️ Sănătate Emoțională", descriere: "Cum gestionezi presiunea și emoțiile.", orders: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41] }
  ];

  const isFormComplete = progressPercentage === 100;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 20px 80px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* PROGRESS BAR STICKY */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(255,255,255,0.95)', padding: '15px 0', zIndex: 100, borderBottom: '1px solid #eaeaea', marginBottom: '40px', backdropFilter: 'blur(5px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '600', color: '#2E5F8A', fontSize: '0.95rem' }}>
          <span>Progres evaluare</span>
          <span>{progressPercentage}%</span>
        </div>
        <div style={{ width: '100%', backgroundColor: '#f0f0f0', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercentage}%`, backgroundColor: progressPercentage === 100 ? '#27ae60' : '#2E5F8A', height: '100%', transition: 'width 0.4s ease, background-color 0.4s ease' }}></div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ color: '#1a365d', marginBottom: '10px' }}>Chestionar Burnout</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>Nu există răspunsuri corecte sau greșite. Alege varianta care te descrie cel mai bine în ultima perioadă.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {categorii.map((categorie, catIndex) => (
          <div key={catIndex} style={{ marginBottom: '60px' }}>
            <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '30px' }}>
              <h2 style={{ color: '#2d3748', margin: '0', fontSize: '1.5rem' }}>{categorie.titlu}</h2>
              <p style={{ color: '#718096', margin: '5px 0 0 0', fontSize: '0.95rem' }}>{categorie.descriere}</p>
            </div>

            {questions
              .filter(q => categorie.orders.includes(q.order))
              .map((q) => {
                const isAnswered = answers[`Q${q.order}`] !== undefined;
                const isError = showValidation && !isAnswered;

                return (
                  <div 
                    key={q.id} 
                    ref={el => questionRefs.current[q.order] = el}
                    style={{ 
                      marginBottom: '25px', padding: '25px', backgroundColor: '#ffffff', 
                      borderRadius: '12px', 
                      border: isError ? '2px solid #e53e3e' : '1px solid #e2e8f0',
                      boxShadow: isError ? '0 0 10px rgba(229, 62, 62, 0.2)' : '0 2px 4px rgba(0,0,0,0.02)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <p style={{ fontSize: '1.15rem', fontWeight: '500', color: '#2d3748', marginBottom: '20px', marginTop: '0' }}>
                      {q.text}
                    </p>
                    
                    {q.is_numeric ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="number" step="0.5" min="0"
                          value={answers[`Q${q.order}`] || ''}
                          onChange={(e) => handleAnswerChange(q.order, e.target.value)}
                          style={{ 
                            padding: '12px', width: '100px', borderRadius: '8px', 
                            border: '1px solid #cbd5e0', fontSize: '1.1rem', textAlign: 'center',
                            outline: 'none'
                          }}
                          placeholder="Ex: 7"
                        />
                        <span style={{ color: '#4a5568', fontWeight: '500' }}>ore</span>
                      </div>
                    ) : (
                      <div>
                        {/* Buline de răspuns personalizate */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                          {[1, 2, 3, 4, 5].map(num => {
                            const isSelected = parseInt(answers[`Q${q.order}`]) === num;
                            return (
                              <div 
                                key={num}
                                onClick={() => handleAnswerChange(q.order, num)}
                                style={{ 
                                  flex: '1', minWidth: '45px', textAlign: 'center', padding: '12px 0',
                                  backgroundColor: isSelected ? '#2E5F8A' : '#edf2f7',
                                  color: isSelected ? 'white' : '#4a5568',
                                  borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem',
                                  transition: 'all 0.2s', border: isSelected ? '2px solid #2E5F8A' : '2px solid transparent'
                                }}
                              >
                                {num}
                              </div>
                            );
                          })}
                        </div>
                        {/* Etichete explicative sub butoane */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem', color: '#a0aec0' }}>
                          <span>Niciodată / Dezacord</span>
                          <span>Foarte des / Acord</span>
                        </div>
                      </div>
                    )}

                    {isError && (
                      <p style={{ color: '#e53e3e', fontSize: '0.9rem', marginTop: '15px', marginBottom: '0', fontWeight: '500' }}>
                        ⚠️ Te rugăm să răspunzi la această întrebare.
                      </p>
                    )}
                  </div>
                );
            })}
          </div>
        ))}
        
        <div style={{ textAlign: 'center', marginTop: '50px', paddingBottom: '20px' }}>
          {showValidation && !isFormComplete && (
            <p style={{ color: '#e53e3e', marginBottom: '15px', fontWeight: 'bold' }}>
              Mai ai întrebări la care nu ai răspuns.
            </p>
          )}
          
          <button 
            type="submit" 
            style={{ 
              padding: '16px 45px', fontSize: '1.2rem', fontWeight: 'bold',
              backgroundColor: isFormComplete ? '#2E5F8A' : '#cbd5e0', 
              color: isFormComplete ? 'white' : '#a0aec0', 
              border: 'none', borderRadius: '30px', 
              cursor: isFormComplete ? 'pointer' : 'default', 
              boxShadow: isFormComplete ? '0 4px 15px rgba(46, 95, 138, 0.3)' : 'none',
              transition: 'all 0.3s ease',
              width: '100%', maxWidth: '300px'
            }}
          >
            {isFormComplete ? 'Trimite Evaluarea' : 'Completează tot'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizPage;