import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext'; 

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
        // Am păstrat ruta 'tests/', asigură-te că așa este și în backend dacă ai făcut modificările RESTful
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
                console.log("Date profil din backend:", data);
                if (data.age && data.academic_gpa) {
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
          navigate('/students/me');
      } else {
          navigate('/quiz');
      }
  };

  const lastResult = results.length > 0 ? results[0] : null;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto', color: colors.text }}>
      
      {/* 1. HERO BANNER (Unificat) */}
      <div style={{ 
        background: `linear-gradient(135deg, ${colors.primary} 0%, #1b4332 100%)`,
        borderRadius: '24px', padding: '40px', color: 'white',
        boxShadow: '0 10px 25px rgba(46, 139, 87, 0.2)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '40px'
      }}>
        <div style={{ maxWidth: '60%' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>
             Salutare, {user?.first_name || 'Student'}! 👋
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
            Monitorizarea constantă este cheia succesului academic fără burnout.
          </p>
          <button 
            onClick={handleStartQuiz}
            style={{ 
              marginTop: '25px', padding: '14px 28px', borderRadius: '30px', border: 'none',
              backgroundColor: 'white', color: colors.primary, fontWeight: 'bold',
              cursor: 'pointer', fontSize: '1rem', transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            {lastResult ? "EFECTUEAZĂ O NOUĂ EVALUARE" : "ÎNCEPE PRIMA EVALUARE"}
          </button>
        </div>
        <div style={{ fontSize: '6rem', opacity: 0.2 }}>🌱</div>
      </div>

      {/* 2. STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '40px' }}>
        
        {/* Card Rezultat Ultimul Test */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #edf2f7' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.1rem', color: '#718096' }}>Status Actual</h3>
          {lastResult ? (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <div style={{ 
                fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px',
                color: lastResult.predicted_cluster === 'Risc Ridicat' ? colors.danger : lastResult.predicted_cluster === 'Risc Moderat' ? colors.warning : colors.success
              }}>
                {lastResult.predicted_cluster}
              </div>
              <p style={{ fontSize: '0.9rem', color: '#a0aec0' }}>
                Ultima verificare: {new Date(lastResult.taken_at).toLocaleDateString('ro-RO')}
              </p>
            </div>
          ) : (
            <p style={{ marginTop: '20px', color: '#a0aec0' }}>Nu ai evaluări finalizate încă.</p>
          )}
        </div>

        {/* Card Istoric Rapid */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #edf2f7' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.1rem', color: '#718096' }}>Istoric Evaluări</h3>
          <div style={{ marginTop: '15px' }}>
            {results.slice(0, 3).map((res, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f7fafc' }}>
                <span style={{ fontSize: '0.9rem' }}>{new Date(res.taken_at).toLocaleDateString('ro-RO')}</span>  
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: colors.primary }}>{res.predicted_cluster}</span>
              </div>
            ))}
            {results.length === 0 && <p style={{ fontSize: '0.9rem', color: '#a0aec0' }}>Istoricul va apărea aici.</p>}
          </div>
        </div>
      </div>

      {/* 3. RECOMANDĂRI SECTION */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Resurse utile pentru tine</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '20px', backgroundColor: colors.secondary, borderRadius: '16px', cursor: 'pointer', border: '1px solid #dcfce7' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>⏱️</div>
            <h4 style={{ margin: '0 0 5px 0' }}>Tehnica Pomodoro</h4>
            <p style={{ fontSize: '0.8rem', color: '#4a5568' }}>Învață cum să îți gestionezi timpul eficient în sesiune.</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: colors.secondary, borderRadius: '16px', cursor: 'pointer', border: '1px solid #dcfce7' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>🧘</div>
            <h4 style={{ margin: '0 0 5px 0' }}>Exerciții Respirație</h4>
            <p style={{ fontSize: '0.8rem', color: '#4a5568' }}>5 minute de mindfulness pentru relaxare instantanee.</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: colors.secondary, borderRadius: '16px', cursor: 'pointer', border: '1px solid #dcfce7' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>🥗</div>
            <h4 style={{ margin: '0 0 5px 0' }}>Nutriție și Creier</h4>
            <p style={{ fontSize: '0.8rem', color: '#4a5568' }}>Ce alimente te ajută să te concentrezi mai bine.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;