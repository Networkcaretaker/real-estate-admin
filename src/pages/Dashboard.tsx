import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <Header />
      <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Properties</h3>
          <button onClick={() => navigate('/properties')}>
            Manage Properties
          </button>
        </div>

        <div className="stat-card">
          <h3>Welcome</h3>
          <p>{currentUser?.email}</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button onClick={() => navigate('/properties')}>
            View Properties
          </button>
          {/* Add more action buttons as needed */}
        </div>
      </div>
      </div>
      </div>
  );
};

export default Dashboard;