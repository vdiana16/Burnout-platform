import React from 'react';
import { useAuth } from '../auth/AuthContext';
import StudentDashboardPage from './student/StudentDashboardPage';
import ProfessorDashboardPage from './psychologist/PsychologistDashboardPage';

const DashboardPage = () => {
  const { user } = useAuth(); 

  if (!user) {
    return <div style={{ padding: '50px', textAlign: 'center', fontSize: '1.2rem' }}>Se încarcă datele utilizatorului...</div>;
  }

  const role = user?.role?.toLowerCase();

  if (role === 'psychologist') {
    return <ProfessorDashboardPage />;
  }
  
  if (role === 'student') {
    return <StudentDashboardPage />;
  }
  
  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '50px auto', backgroundColor: '#fff5f5', border: '2px solid #fc8181', borderRadius: '12px' }}>
      <h2 style={{ color: '#c53030', marginTop: 0 }}>🚨 Eroare de Rutare</h2>
      <p style={{ color: '#2d3748' }}>Platforma a primit datele tale, dar nu recunoaște rolul pe care îl ai.</p>
      
      <h4 style={{ marginBottom: '10px', color: '#4a5568' }}>Iată ce date a primit platforma de la Backend:</h4>
      <pre style={{ backgroundColor: '#edf2f7', padding: '15px', borderRadius: '8px', overflowX: 'auto', fontSize: '0.9rem', color: '#2b6cb0' }}>
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
};

export default DashboardPage;