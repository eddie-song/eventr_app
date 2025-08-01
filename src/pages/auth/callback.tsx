import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        // user is verified + signed in
        navigate('/dashboard') // or wherever you want to go
      } else {
        console.log('No active session')
      }
    })
  }, [navigate])

  return <div>Finishing sign in...</div>
}

export default AuthCallbackPage
