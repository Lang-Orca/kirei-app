import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Deposit from './pages/Deposit';
import Retrieve from './pages/Retrieve';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/retrieve" element={<Retrieve />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
