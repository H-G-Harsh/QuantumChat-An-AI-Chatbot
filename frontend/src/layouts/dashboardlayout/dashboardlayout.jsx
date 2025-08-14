import { Outlet, useNavigate } from "react-router-dom";
import './dashboardlayout.css';
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import Chatlist from './../../components/chatlist';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
};

const Dashboardlayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/sign-in");
    }
  }, [loading, user, navigate]);

  if (loading) return "Loading...";

  return (
    <div className='dashboardlayout'>
      {isMobile && (
        <button className={`hamburger-menu ${isMobileMenuOpen ? 'hidden' : ''}`} onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}
      <div className={`menu ${isMobileMenuOpen ? 'menu-open' : ''}`}>
        {isMobile && (
          <button className="close-menu" onClick={closeMobileMenu}>
            <span>&times;</span>
          </button>
        )}
        <Chatlist onLinkClick={closeMobileMenu} />
      </div>
      {isMobileMenuOpen && isMobile && <div className="menu-overlay" onClick={closeMobileMenu}></div>}
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboardlayout;
