import React from 'react';
import { useAuth } from '../auth/AuthContext';
import StudentDashboardPage from './student/StudentDashboardPage';
import ProfessorDashboardPage from './psychologist/PsychologistDashboardPage';

const DashboardPage = () => {
  const { user } = useAuth(); 

  if (user?.role === 'PSYCHOLOGIST') {
    return <ProfessorDashboardPage />;
  }

  return <StudentDashboardPage />;
};

export default DashboardPage;