import {Link,Outlet} from "react-router-dom";
import './rootlayout.css';
import { ClerkProvider } from '@clerk/clerk-react';
import { SignedIn,UserButton } from "@clerk/clerk-react";
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
import {useQuery,useMutation,useQueryClient, QueryClient,QueryClientProvider} from '@tanstack/react-query'

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const queryClient = new QueryClient()


const Rootlayout = () => {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
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
      </SignedIn></div>
    </header>
    <main>
      <Outlet/>
    </main>
    </div>
    </QueryClientProvider>
    </ClerkProvider>
  );
};

export default Rootlayout;
