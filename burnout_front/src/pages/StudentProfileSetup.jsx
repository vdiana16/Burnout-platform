import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    age: '',
    gender: 'Nespecificat',
    education_level: '',
    study_stage: '',
    field: '',
    academic_gpa: '',
    financial_stress: '',
    employment: 'Nu'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access');
        const response = await fetch('http://127.0.0.1:8000/api/student/profile/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setFormData({
            age: data.age || '',
            gender: data.gender || 'Nespecificat',
            education_level: data.education_level || '',
            study_stage: data.study_stage || '',
            field: data.field || '',
            academic_gpa: data.academic_gpa || '',
            financial_stress: data.financial_stress || '',
            employment: data.employment || 'Nu'
          });
        }
      } catch (err) {
        console.log("Profilul nu a fost creat încă sau eroare rețea.");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('access');
      const response = await fetch('http://127.0.0.1:8000/api/student/profile/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Eroare la salvarea profilului.');
      }

      setSuccessMsg('Profilul a fost salvat cu succes!');
      
      setTimeout(() => {
        navigate('/quiz');
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#4a5568' };
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#2E5F8A', margin: '0 0 10px 0' }}>Profilul tău de student 👋</h1>
          <p style={{ color: '#718096', fontSize: '1.1rem', margin: '0' }}>
            Avem nevoie de câteva detalii pentru a-ți personaliza evaluarea de burnout.
          </p>
        </div>

        {error && <div style={{ backgroundColor: '#fed7d7', color: '#c53030', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
        {successMsg && <div style={{ backgroundColor: '#c6f6d5', color: '#2f855a', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{successMsg} Redirecționare...</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            
            {/* Vârstă */}
            <div>
              <label style={labelStyle}>Vârsta</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} required min="16" max="65" style={inputStyle} placeholder="Ex: 21" />
            </div>

            {/* Gen */}
            <div>
              <label style={labelStyle}>Gen</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                <option value="Feminin">Feminin</option>
                <option value="Masculin">Masculin</option>
                <option value="Nespecificat">Prefer să nu răspund</option>
              </select>
            </div>

            {/* Nivel Educație */}
            <div>
              <label style={labelStyle}>Nivel de studii</label>
              <select name="education_level" value={formData.education_level} onChange={handleChange} required style={inputStyle}>
                <option value="" disabled>Alege nivelul...</option>
                <option value="Liceu">Liceu</option>
                <option value="Licență">Licență</option>
                <option value="Master">Master</option>
                <option value="Doctorat">Doctorat</option>
              </select>
            </div>

            {/* An de studiu */}
            <div>
              <label style={labelStyle}>An de studiu</label>
              <select name="study_stage" value={formData.study_stage} onChange={handleChange} required style={inputStyle}>
                <option value="" disabled>Alege anul...</option>
                <option value="Anul 1">Anul 1</option>
                <option value="Anul 2">Anul 2</option>
                <option value="Anul 3">Anul 3</option>
                <option value="An Terminal">An Terminal</option>
              </select>
            </div>

            {/* Domeniu */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Domeniul de studiu</label>
              <select name="field" value={formData.field} onChange={handleChange} required style={inputStyle}>
                <option value="" disabled>Alege domeniul...</option>
                <option value="Real">Real / Inginerie / Științe Exacte</option>
                <option value="Uman">Uman / Social / Litere / Psihologie</option>
                <option value="Medicină">Medicină / Sănătate</option>
                <option value="Economic">Economic / Business</option>
                <option value="Vocațional">Vocațional / Arte / Sport</option>
              </select>
            </div>

            {/* Medie Academică */}
            <div>
              <label style={labelStyle}>Media anilor precedenți (Aprox.)</label>
              <input type="number" name="academic_gpa" value={formData.academic_gpa} onChange={handleChange} required step="0.01" min="1" max="10" style={inputStyle} placeholder="Ex: 8.50" />
            </div>

            {/* Loc de muncă */}
            <div>
              <label style={labelStyle}>Situație profesională</label>
              <select name="employment" value={formData.employment} onChange={handleChange} style={inputStyle}>
                <option value="Nu">Nu lucrez</option>
                <option value="Part-time">Lucrez Part-time</option>
                <option value="Full-time">Lucrez Full-time</option>
              </select>
            </div>

            {/* Stres Financiar */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Nivelul de stres financiar (1 = Scăzut, 5 = Ridicat)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[1, 2, 3, 4, 5].map(num => (
                  <label key={num} style={{ 
                    flex: '1', textAlign: 'center', padding: '10px', 
                    backgroundColor: formData.financial_stress == num ? '#2E5F8A' : '#edf2f7',
                    color: formData.financial_stress == num ? '#fff' : '#4a5568',
                    borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                  }}>
                    <input type="radio" name="financial_stress" value={num} onChange={handleChange} required style={{ display: 'none' }} />
                    {num}
                  </label>
                ))}
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <button 
                type="submit" 
                disabled={loading}
                style={{ 
                flex: 2, padding: '16px', fontSize: '1.1rem', fontWeight: 'bold',
                backgroundColor: loading ? '#cbd5e0' : '#2E5F8A', color: 'white', 
                border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
                }}
            >
                {loading ? 'Se salvează...' : 'Salvează Profilul'}
            </button>

            {/* Butonul magic de SKIP */}
            <button 
                type="button" 
                onClick={() => navigate('/dashboard')}
                style={{ 
                flex: 1, padding: '16px', fontSize: '1.1rem', fontWeight: 'bold',
                backgroundColor: 'transparent', color: '#4a5568', 
                border: '2px solid #cbd5e0', borderRadius: '8px', cursor: 'pointer',
                }}
            >
                Completez mai târziu
            </button>
          </div>
  
        </form>

      </div>
    </div>
  );
};

export default ProfileSetupPage;