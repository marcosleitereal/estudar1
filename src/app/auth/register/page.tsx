import { Suspense } from 'react'
import { RegisterForm } from '@/components/auth/register-form'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export const metadata = {
  title: 'Criar Conta - Estudar.Pro',
  description: 'Crie sua conta na plataforma Estudar.Pro',
}

function RegisterFormWrapper() {
  return <RegisterForm />
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
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

        {/* Register Form */}
        <Suspense
          fallback={
            <Card className="w-full">
              <CardContent className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </CardContent>
            </Card>
          }
        >
          <RegisterFormWrapper />
        </Suspense>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Estudar.Pro. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}

