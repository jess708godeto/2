import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Conocenos from './pages/Conocenos';
import Contactanos from './pages/Contactanos';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import Evaluation from './pages/Evaluation';
import Perfil from './pages/Perfil';
import MisCursos from './pages/MisCursos';
import Certificaciones from './pages/Certificaciones';
import Documentos from './pages/Documentos';
import AdminPanel from './pages/AdminPanel';
import Catalogo from './pages/Catalogo';

// Components
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore(state => state.token);
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const user = useAuthStore(state => state.user);
  return user?.rol === 'admin' ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/conocenos" element={<Conocenos />} />
        <Route path="/contactanos" element={<Contactanos />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/catalogo" element={<ProtectedRoute><Layout><Catalogo /></Layout></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Layout><Perfil /></Layout></ProtectedRoute>} />
        <Route path="/mis-cursos" element={<ProtectedRoute><Layout><MisCursos /></Layout></ProtectedRoute>} />
        <Route path="/certificaciones" element={<ProtectedRoute><Layout><Certificaciones /></Layout></ProtectedRoute>} />
        <Route path="/documentos" element={<ProtectedRoute><Layout><Documentos /></Layout></ProtectedRoute>} />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminRoute>
              <Layout>
                <AdminPanel />
              </Layout>
            </AdminRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/curso/:id" element={<ProtectedRoute><Layout><CourseDetail /></Layout></ProtectedRoute>} />
        <Route path="/curso/:id/evaluacion" element={<ProtectedRoute><Layout><Evaluation /></Layout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
