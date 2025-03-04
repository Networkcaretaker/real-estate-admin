import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/firebase/auth';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
      try {
        await authService.logout();
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

  return (
    <div>
      <div className="h-16"></div>
      <div className="items-center place-items-center justify-center flex flex-col">
        <img src="/house.svg" alt="Real Estate" className="h-20 w-auto" />
        <span className="text-6xl font-bold px-4">REAL ESTATE</span>
      </div>
      <div className="h-16"></div>
      <div className="items-center place-items-center justify-center flex flex-col">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded m-1 w-4/12" onClick={() => navigate('/properties')}>
          Manage Properties
        </button>
      </div>  
      <div className="items-center place-items-center justify-center flex flex-col">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded m-1 w-4/12" onClick={() => navigate('/websites')}>
        Manage Websites
        </button>
      </div>
      {/*<div className="items-center place-items-center justify-center flex flex-col">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded m-1 w-4/12" onClick={() => navigate('/clients')}>
          Manage Clients
        </button>
      </div> */}
      <div className="items-center place-items-center justify-center flex flex-col">
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 rounded m-1 w-4/12" onClick={handleLogout}>
          {user?.email} | Logout
        </button>
      </div>
         
    </div>
  );
};

export default Dashboard;