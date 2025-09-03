'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Settings, BookOpen, Brain, FileText, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { signOut } from '../../../lib/auth/simple'

interface UserNavProps {
  user: {
    id: string
    name?: string
    email: string
    role: 'admin' | 'student'
  }
}

export function UserNav({ user }: UserNavProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    setIsLoading(true)
    
    try {
      await signOut()
      
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
      })
      
      router.push('/')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Erro no logout',
        description: 'Ocorreu um erro ao fazer logout.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || 'Usuário'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground capitalize">
              {user.role === 'admin' ? 'Administrador' : 'Estudante'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
          <BookOpen className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push('/notes')}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Minhas Notas</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push('/flashcards')}>
          <Brain className="mr-2 h-4 w-4" />
          <span>Flashcards</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push('/quiz')}>
          <Users className="mr-2 h-4 w-4" />
          <span>Quiz & Simulados</span>
        </DropdownMenuItem>
        
        {user.role === 'admin' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/admin')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Painel Admin</span>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

