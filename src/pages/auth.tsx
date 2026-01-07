import { useState } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  const toggleMode = () => setIsLogin(!isLogin)

  if (isLogin) {
    return <LoginForm onToggleMode={toggleMode} />
  }

  return <RegisterForm onToggleMode={toggleMode} />
}
