import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
        <div className="items-center place-items-center justify-center flex flex-col">
          <div className="text-2xl font-bold m-2">Welcome</div>
          <div className="text-3xl m-2">{user?.email}</div>
        </div>
        <div className="items-center place-items-center justify-center flex flex-col">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded m-6 w-4/12" onClick={() => navigate('/properties')}>
            Manage Properties
          </button>
        </div>     
      </div>
  );
};

export default Dashboard;