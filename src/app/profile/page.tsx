'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { authService, User } from '../../../lib/auth/supabase-auth'
import { Loader2, Camera, User as UserIcon, Lock, Phone, Mail, Calendar, ArrowLeft, LogOut } from 'lucide-react'
import Link from 'next/link'

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  const router = useRouter()
  const { toast } = useToast()

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  // Carregar dados do usuário
  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)
      profileForm.reset({
        name: currentUser.name,
        phone: currentUser.phone || '',
      })
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do usuário',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Atualizar perfil
  const onUpdateProfile = async (data: ProfileFormData) => {
    setIsUpdating(true)

    try {
      let avatarUrl = user?.avatar_url

      // Upload do avatar se houver
      if (avatarFile) {
        const uploadResult = await authService.uploadAvatar(avatarFile)
        if (uploadResult.error) {
          throw new Error(uploadResult.error.message)
        }
        avatarUrl = uploadResult.url
      }

      // Atualizar perfil
      const result = await authService.updateProfile({
        name: data.name,
        phone: data.phone || undefined,
        avatar_url: avatarUrl,
      })

      if (result.error) {
        throw new Error(result.error.message)
      }

      setUser(result.user)
      setAvatarFile(null)
      setAvatarPreview(null)

      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram atualizadas com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Alterar senha
  const onChangePassword = async (data: PasswordFormData) => {
    setIsChangingPassword(true)

    try {
      // Primeiro, verificar senha atual fazendo login
      const loginResult = await authService.login(user!.email, data.currentPassword)
      if (loginResult.error) {
        throw new Error('Senha atual incorreta')
      }

      // Atualizar senha
      const result = await authService.updatePassword(data.newPassword)
      if (result.error) {
        throw new Error(result.error.message)
      }

      passwordForm.reset()

      toast({
        title: 'Senha alterada!',
        description: 'Sua senha foi alterada com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao alterar senha',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Selecionar avatar
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: 'Arquivo muito grande',
          description: 'A imagem deve ter no máximo 5MB',
          variant: 'destructive',
        })
        return
      }

      setAvatarFile(file)
      
      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-2xl font-bold text-primary">
              Estudar.Pro
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              {user.name}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                await authService.logout()
                router.push('/')
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e configurações de conta
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Informações Pessoais</TabsTrigger>
              <TabsTrigger value="security">Segurança</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    Atualize suas informações pessoais e foto de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage 
                          src={avatarPreview || user.avatar_url} 
                          alt={user.name} 
                        />
                        <AvatarFallback className="text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <label 
                        htmlFor="avatar-upload"
                        className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {user.role === 'admin' ? 'Administrador' : 'Estudante'}
                        {user.isPremium && ' • Premium'}
                      </p>
                    </div>
                  </div>

                  {/* Formulário de perfil */}
                  <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input
                          id="name"
                          {...profileForm.register('name')}
                          disabled={isUpdating}
                        />
                        {profileForm.formState.errors.name && (
                          <p className="text-sm text-destructive">
                            {profileForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          {...profileForm.register('phone')}
                          disabled={isUpdating}
                        />
                        {profileForm.formState.errors.phone && (
                          <p className="text-sm text-destructive">
                            {profileForm.formState.errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Membro desde</Label>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Salvar Alterações
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Segurança da Conta
                  </CardTitle>
                  <CardDescription>
                    Altere sua senha para manter sua conta segura
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Senha atual</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        {...passwordForm.register('currentPassword')}
                        disabled={isChangingPassword}
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-sm text-destructive">
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova senha</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        {...passwordForm.register('newPassword')}
                        disabled={isChangingPassword}
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-sm text-destructive">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...passwordForm.register('confirmPassword')}
                        disabled={isChangingPassword}
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Alterar Senha
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

