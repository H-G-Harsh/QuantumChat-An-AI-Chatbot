import { Link, Outlet } from "react-router-dom";
import './rootlayout.css';
import { SignedIn, UserButton } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const Rootlayout = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className='rootlayout'>
        <header>
          <Link to="/" className="logo">
            <img src="/final.jpg" alt=""/>
            <span>QuantumChat</span>
          </Link>
          <div className="user">
            <SignedIn>
              <UserButton />
            </SignedIn>
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
