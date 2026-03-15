import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedLayout from './layout/ProtectedLayout';
import QuizPage from './pages/QuizPage';
import StudentProfileSetup from './pages/StudentProfileSetup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Publice */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rute Protejate */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/student-profile" element={<StudentProfileSetup />} />
        </Route>

        {/* Redirecționare automată de la rădăcină către Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;