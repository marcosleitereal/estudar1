import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export const metadata = {
  title: 'Login - Estudar.Pro',
  description: 'Faça login na sua conta Estudar.Pro',
}

function LoginFormWrapper() {
  return <LoginForm />
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Estudar.Pro
          </h1>
          <p className="text-muted-foreground">
            Plataforma de Estudos Jurídicos
          </p>
        </div>

        {/* Login Form */}
        <Suspense
          fallback={
            <Card className="w-full">
              <CardContent className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </CardContent>
            </Card>
          }
        >
          <LoginFormWrapper />
        </Suspense>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Estudar.Pro. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}

