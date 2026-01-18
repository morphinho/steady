'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Debug: verificar variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('🔍 Debug - Variáveis de ambiente:')
  console.log('URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NÃO ENCONTRADA')
  console.log('KEY:', supabaseKey ? `${supabaseKey.substring(0, 30)}...` : 'NÃO ENCONTRADA')

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERRO: Variáveis de ambiente não encontradas!')
    console.error('Certifique-se de que o arquivo .env existe e foi reiniciado o servidor')
  }

  const supabase = createBrowserClient(
    supabaseUrl || 'https://mhrescjawktjoiypeica.supabase.co',
    supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocmVzY2phd2t0am9peXBlaWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjEyNjcsImV4cCI6MjA4NDI5NzI2N30.5zsIjHVw8ShkdTPurumEQ_WUVnBLtu5phRcTA2L443Q'
  )

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('=== INÍCIO DO LOGIN ===')
    console.log('Email:', email)
    console.log('isSignUp:', isSignUp)
    console.log('Supabase URL:', supabaseUrl)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        console.log('Tentando criar conta...')
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        console.log('SignUp response:', { data, error })
        if (error) throw error
        if (data.user) {
          // Criar perfil do usuário
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                first_name: firstName,
                last_name: lastName,
                phone: phone || null,
                full_name: `${firstName} ${lastName}`.trim(),
              },
            ])
          
          if (profileError) {
            console.error('Erro ao criar perfil:', profileError)
            // Não bloqueia o signup se o perfil falhar
          }
          
          console.log('Usuário criado, redirecionando...')
          window.location.href = '/dashboard'
        } else {
          console.log('Nenhum usuário retornado')
        }
      } else {
        console.log('Tentando fazer login...')
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        console.log('SignIn response completo:', JSON.stringify({ data, error }, null, 2))
        console.log('Tem erro?', !!error)
        console.log('Tem sessão?', !!data?.session)
        console.log('Tem usuário?', !!data?.user)

        if (error) {
          console.log('ERRO do Supabase:', error)
          console.log('Código do erro:', error.status)
          console.log('Mensagem do erro:', error.message)
          
          // Tratar erros específicos do Supabase
          if (error.message.includes('Invalid login credentials') || 
              error.message.includes('Invalid') && error.message.includes('password')) {
            throw new Error('Email ou senha incorretos')
          }
          throw error
        }

        if (data.session) {
          console.log('Sessão criada com sucesso! Redirecionando...')
          window.location.href = '/dashboard'
        } else {
          console.log('AVISO: Login sem erro mas sem sessão!')
          setError('Login não retornou sessão. Tente novamente.')
          setLoading(false)
        }
      }
    } catch (err: any) {
      console.error('=== ERRO CAPTURADO ===')
      console.error('Erro completo:', err)
      console.error('Tipo do erro:', err.constructor?.name)
      console.error('Mensagem:', err.message)
      console.error('Status:', err.status)
      console.error('Stack:', err.stack)

      // Tratar diferentes tipos de erro
      const errorMessage = err.message || ''
      
      if (errorMessage.includes('user_already_exists') || errorMessage.includes('already registered')) {
        setError('Este email já está cadastrado. Tente fazer login.')
      } else if (errorMessage.includes('Invalid login credentials') || 
                 errorMessage.includes('Email ou senha incorretos') ||
                 (errorMessage.includes('Invalid') && errorMessage.includes('password'))) {
        setError('Email ou senha incorretos')
      } else if (errorMessage.includes('Password should be at least')) {
        setError('A senha deve ter pelo menos 6 caracteres')
      } else if (errorMessage.includes('Invalid email')) {
        setError('Email inválido. Verifique o formato do email.')
      } else if (errorMessage.includes('Missing Supabase environment variables')) {
        setError('Erro de configuração. Entre em contato com o suporte.')
      } else if (err.status === 400) {
        setError('Dados inválidos. Verifique email e senha.')
      } else if (err.status === 401) {
        setError('Email ou senha incorretos')
      } else if (err.status === 429) {
        setError('Muitas tentativas. Aguarde alguns minutos e tente novamente.')
      } else {
        setError(errorMessage || 'Erro ao fazer login. Tente novamente.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-3 sm:p-4 page-transition">
      <Card className="w-full max-w-md border-0 rounded-2xl bg-surface p-4 sm:p-6 slide-up">
        <CardHeader className="space-y-1 text-center px-0 pt-0">
          <div className="flex flex-col items-center mb-4 sm:mb-6 pt-4 sm:pt-6">
            <div className="mb-3">
              <h1 
                className="text-4xl sm:text-5xl font-bold text-textPrimary"
                style={{ fontFamily: 'var(--font-cascadia-code)', fontWeight: 700 }}
              >
                Steady
              </h1>
            </div>
            <p className="text-sm sm:text-base text-textSecondary font-medium">
              Focus your money.
            </p>
          </div>
          {isSignUp && (
            <>
              <CardTitle className="text-xl sm:text-2xl font-semibold text-textPrimary">
                Criar conta
              </CardTitle>
              <CardDescription className="text-sm text-textSecondary">
                Crie sua conta para começar
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Seu nome"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required={isSignUp}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Seu sobrenome"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required={isSignUp}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (opcional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert className="bg-transparent text-error border border-error/20 rounded-2xl">
                <AlertDescription className="text-error">{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" variant="primary" className="w-full rounded-2xl" disabled={loading}>
              {loading ? 'Carregando...' : isSignUp ? 'Criar conta' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setFirstName('')
                setLastName('')
                setPhone('')
                setError(null)
              }}
              className="text-textSecondary hover:text-textPrimary underline transition-fast"
            >
              {isSignUp
                ? 'Já tem conta? Entre aqui'
                : 'Não tem conta? Crie uma'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
