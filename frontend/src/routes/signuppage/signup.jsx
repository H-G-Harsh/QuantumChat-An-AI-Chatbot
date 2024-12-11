import { SignUp } from '@clerk/clerk-react'
import './signup.css'

const Signup = () => {
  return (
    <div className='signup'><SignUp path="/sign-up" signInUrl="/sign-in" afterSignUpUrl="/dashboard"/></div>
  )
}

export default Signup