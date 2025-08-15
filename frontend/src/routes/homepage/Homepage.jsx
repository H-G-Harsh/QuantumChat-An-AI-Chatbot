import { Link } from 'react-router-dom';
import './homepage.css';


const Homepage = () => {
  
  return (
    <div className='homepage'>
      <div className="left">
        <h1>QuantumChat</h1>
        <h2>Supercharge your creativity and productivity</h2>
        <h3>Discover a revolutionary AI assistant designed to streamline your workflow, spark new ideas, and bring your creative visions to life. With QuantumChat, the possibilities are endless!
          </h3>
          <Link to="/dashboard">Get Started</Link>
          <img src="/back.webp" alt="" className="back" />
      </div>
      <div className="terms">
        Made with love by QuantumChat team❤️
      </div>
    </div>
  )
}

export default Homepage