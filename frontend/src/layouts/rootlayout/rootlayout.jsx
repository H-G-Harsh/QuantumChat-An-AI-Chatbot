import {Link,Outlet, useNavigate} from "react-router-dom";
import './rootlayout.css';
import { useAuth } from '../../contexts/AuthContext';
import {useQuery,useMutation,useQueryClient, QueryClient,QueryClientProvider} from '@tanstack/react-query'
import UserAvatar from '../../components/UserAvatar';

const queryClient = new QueryClient()

const Rootlayout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <QueryClientProvider client={queryClient}>
    <div className='rootlayout'>
    <header>
      <Link to="/" className="logo">
        <img src="/final.jpg" alt=""/>
        <span>QuantumChat</span>
      </Link>
      <div className="user">
        {user && <UserAvatar />}
      </div>
    </header>
    <main>
      <Outlet/>
    </main>
    </div>
    </QueryClientProvider>
  );
};

export default Rootlayout;
