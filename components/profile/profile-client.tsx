'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User as UserIcon, Mail, Phone, Save, Camera, Sun, Moon } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/theme-toggle'
import { useTheme } from '@/lib/theme-context'
import { setCachedProfile } from '@/lib/profile-cache'

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

interface ProfileClientProps {
  user: User
  profile: Profile | null
}

export default function ProfileClient({ user, profile: initialProfile }: ProfileClientProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [formData, setFormData] = useState({
    firstName: initialProfile?.first_name || '',
    lastName: initialProfile?.last_name || '',
    phone: initialProfile?.phone || '',
    bio: initialProfile?.bio || '',
  })
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggleTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim() || null
      
      console.log('Salvando perfil:', {
        id: user.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName,
      })
      
      // Verificar se o perfil já existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      let data, error

      // Preparar dados para salvar
      const profileData: any = {
        first_name: formData.firstName || null,
        last_name: formData.lastName || null,
        full_name: fullName,
        phone: formData.phone || null,
        bio: formData.bio || null,
        updated_at: new Date().toISOString(),
      }

      if (existingProfile) {
        // Update se já existe
        const result = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id)
          .select()
          .single()
        data = result.data
        error = result.error
      } else {
        // Insert se não existe
        const result = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            ...profileData,
          })
          .select()
          .single()
        data = result.data
        error = result.error
      }

      if (error) {
        // Serializar o erro para ver todas as propriedades
        const errorString = JSON.stringify(error, Object.getOwnPropertyNames(error))
        console.error('Erro ao salvar perfil:', {
          errorString,
          error,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
        })
        
        const errorMessage = error?.message || error?.details || error?.hint || errorString || 'Erro desconhecido ao salvar perfil'
        throw new Error(errorMessage)
      }

      console.log('Perfil salvo com sucesso:', data)
      setProfile(data)
      setCachedProfile(data) // Atualizar cache
      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      })
    } catch (error: any) {
      console.error('Erro completo:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar perfil.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione uma imagem.',
        variant: 'destructive',
      })
      return
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'A imagem deve ter no máximo 5MB.',
        variant: 'destructive',
      })
      return
    }

    setUploadingAvatar(true)

    try {
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `avatar-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      console.log('Iniciando upload:', { fileName, filePath, fileSize: file.size })

      // Primeiro, tentar deletar avatar anterior se existir
      if (profile?.avatar_url) {
        try {
          // Extrair o nome do arquivo da URL
          const urlParts = profile.avatar_url.split('/')
          const oldFileName = urlParts[urlParts.length - 1]
          const oldFilePath = `${user.id}/${oldFileName}`
          
          await supabase.storage
            .from('avatars')
            .remove([oldFilePath])
        } catch (error) {
          console.log('Erro ao deletar avatar anterior (ignorado):', error)
          // Continuar mesmo se falhar
        }
      }

      // Tentar fazer upload diretamente - se o bucket não existir, o erro será mais específico
      // Não verificamos a existência do bucket antes para evitar problemas de permissão
      console.log('Iniciando upload para o bucket avatars...')

      // Fazer upload da nova imagem
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        console.error('Erro no upload:', uploadError)
        console.error('Detalhes do erro:', {
          message: uploadError.message,
        })
        
        // Verificar diferentes tipos de erro
        const errorMsg = uploadError.message || ''
        const errorStatus = (uploadError as any).statusCode || ''
        
        if (errorMsg.includes('not found') || errorMsg.includes('Bucket') || errorMsg.includes('does not exist')) {
          throw new Error('Bucket "avatars" não encontrado. Verifique se o bucket foi criado no Supabase Dashboard (Storage > Create bucket > Nome: avatars > Public: true).')
        } else if (errorMsg.includes('row-level security') || errorMsg.includes('RLS') || errorMsg.includes('policy') || errorMsg.includes('permission') || String(errorStatus) === '42501' || errorStatus === 42501) {
          throw new Error('Erro de permissão RLS. Execute a migração 20260121000000_fix_avatars_storage.sql no Supabase SQL Editor para corrigir as políticas de acesso.')
        } else if (errorMsg.includes('new row violates') || errorMsg.includes('violates row-level security')) {
          throw new Error('Erro de política RLS. Execute a migração 20260121000000_fix_avatars_storage.sql no Supabase SQL Editor. Verifique também se o bucket está marcado como público.')
        } else {
          throw new Error(`Erro ao fazer upload: ${errorMsg || 'Erro desconhecido'}`)
        }
      }

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      console.log('URL pública gerada:', publicUrl)
      
      // Verificar se a URL é válida
      if (!publicUrl) {
        throw new Error('Não foi possível gerar a URL pública da imagem. Verifique se o bucket está configurado corretamente.')
      }

      // Verificar se o perfil existe antes de atualizar
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      let profileData, updateError

      if (existingProfile) {
        // Update se já existe
        const result = await supabase
          .from('profiles')
          .update({ 
            avatar_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single()
        profileData = result.data
        updateError = result.error
      } else {
        // Insert se não existe
        const result = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            avatar_url: publicUrl,
            full_name: user.email?.split('@')[0] || null,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        profileData = result.data
        updateError = result.error
      }

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError)
        throw new Error(`Erro ao salvar foto: ${updateError.message}`)
      }

      setProfile(profileData)
      toast({
        title: 'Foto atualizada!',
        description: 'Sua foto de perfil foi atualizada com sucesso.',
      })
    } catch (error: any) {
      console.error('Erro completo:', error)
      toast({
        title: 'Erro ao fazer upload',
        description: error.message || 'Erro desconhecido ao fazer upload da foto.',
        variant: 'destructive',
      })
    } finally {
      setUploadingAvatar(false)
      // Resetar input
      e.target.value = ''
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao fazer logout.',
        variant: 'destructive',
      })
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 page-transition">
      {/* Header Mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-[100] bg-surface">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-surfaceMuted transition-fast"
            >
              <ArrowLeft className="w-5 h-5 text-textPrimary" />
            </button>
            <h1 className="text-lg font-semibold text-textPrimary">Perfil</h1>
            <div className="w-9" />
          </div>
        </div>
      </header>

      {/* Header Desktop */}
      <header className="hidden md:block sticky top-0 z-[100] bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-xl hover:bg-surfaceMuted transition-fast"
              >
                <ArrowLeft className="w-5 h-5 text-textPrimary" />
              </button>
              <h1 className="text-lg font-semibold text-textPrimary">Perfil</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 pt-16 md:pt-6 pb-20 md:pb-8">
        <div className="space-y-6">
          {/* Card de Foto de Perfil */}
          <Card className="bg-surface border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-medium text-textPrimary">Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'Perfil'} />
                    <AvatarFallback className="bg-surfaceMuted text-textPrimary text-2xl">
                      {profile?.first_name?.[0]?.toUpperCase() || profile?.last_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className={`absolute bottom-0 right-0 p-2 bg-surface border-2 border-background rounded-full cursor-pointer hover:bg-surfaceMuted transition-fast ${
                      uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploadingAvatar ? (
                      <div className="w-4 h-4 border-2 border-textPrimary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-textPrimary" />
                    )}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>
                <div className="text-center">
                  <p className="text-sm text-textSecondary">
                    {uploadingAvatar ? 'Enviando...' : 'Clique no ícone da câmera para alterar'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Informações Pessoais */}
          <Card className="bg-surface border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-medium text-textPrimary">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Seu nome"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Seu sobrenome"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textTertiary" />
                    <Input
                      id="email"
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="pl-10 bg-surfaceMuted"
                    />
                  </div>
                  <p className="text-xs text-textTertiary">O email não pode ser alterado</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textTertiary" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    placeholder="Conte um pouco sobre você..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 rounded-2xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-2xl"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Card de Conta */}
          <Card className="bg-surface border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-medium text-textPrimary">Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-surfaceMuted">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-surface">
                    <Mail className="w-5 h-5 text-textPrimary" />
                  </div>
                  <div>
                    <p className="font-medium text-textPrimary">Email Verificado</p>
                    <p className="text-sm text-textTertiary">
                      {user.email_confirmed_at ? 'Sim' : 'Não'}
                    </p>
                  </div>
                </div>
              </div>

              {profile?.created_at && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-surfaceMuted">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-surface">
                      <UserIcon className="w-5 h-5 text-textPrimary" />
                    </div>
                    <div>
                      <p className="font-medium text-textPrimary">Membro desde</p>
                      <p className="text-sm text-textTertiary">
                        {new Date(profile.created_at).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-xl bg-surfaceMuted">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-surface">
                    {theme === 'dark' ? (
                      <Sun className="w-5 h-5 text-textPrimary" />
                    ) : (
                      <Moon className="w-5 h-5 text-textPrimary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-textPrimary">Tema</p>
                    <p className="text-sm text-textTertiary">
                      {theme === 'dark' ? 'Escuro' : 'Claro'}
                    </p>
                  </div>
                </div>
                <ThemeToggle />
              </div>

              <Button
                onClick={handleLogout}
                className="w-full rounded-2xl mt-4 bg-transparent text-error border border-error/20 hover:bg-error/5 transition-fast"
              >
                Sair da Conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

