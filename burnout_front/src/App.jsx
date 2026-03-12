import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedLayout from './layout/ProtectedLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Publice */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rute Protejate */}
        <Route element={<ProtectedLayout />}>
          {/* Dashboard-ul va fi afișat în locul unde ai pus <Outlet /> în ProtectedLayout */}
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Redirecționare automată de la rădăcină către Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;