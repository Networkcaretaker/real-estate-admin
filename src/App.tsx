import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

// We'll create these components next
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
//import Property from './pages/Property';
//import Property_Images from './pages/Property_Images';
import NotFound from './pages/NotFound';

import Navigation from './components/layout/Navigation';
import PropertyDetails from './pages/Property';
import PropertyEdit from './pages/Edit_Property';
import PropertyImages from './pages/Property_Images';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Websites from './pages/Websites';
import Edit_Website from './pages/Edit_Website';
import WebsiteProperties from './pages/WebsiteProperties';
import Clients from './pages/Clients';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;

};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <Navigation />
                  <main className="max-w-auto mx-auto py-6 sm:px-6 lg:px-8">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/properties" element={<Properties />} />
                      <Route path="/properties/:id/view" element={<PropertyDetails />} />
                      <Route path="/properties/:id/edit" element={<PropertyEdit />} />
                      <Route path="/properties/:id/images" element={<PropertyImages />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/websites" element={<Websites />} />
                      <Route path="/websites/:websiteId/edit" element={<Edit_Website />} />
                      <Route path="/websites/:websiteId/properties" element={<WebsiteProperties />} />
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;