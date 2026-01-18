'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    
    // Não mostrar splash em rotas específicas após primeira carga
    if (pathname === '/login' || pathname === '/dashboard' || pathname === '/profile') {
      const hasSeenSplash = sessionStorage.getItem('hasSeenSplash')
      if (hasSeenSplash) {
        setIsVisible(false)
        return
      }
    }

    // Iniciar fade-out após 1.8 segundos
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true)
    }, 1800)

    // Remover completamente após fade-out
    const removeTimer = setTimeout(() => {
      setIsVisible(false)
    }, 2300) // 1.8s + 0.5s de fade-out

    // Marcar que já viu a splash
    sessionStorage.setItem('hasSeenSplash', 'true')

    return () => {
      clearTimeout(fadeOutTimer)
      clearTimeout(removeTimer)
    }
  }, [pathname])

  if (!mounted || !isVisible) {
    return null
  }

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-background flex items-center justify-center transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center">
        {/* Texto Steady animado */}
        <div className="relative">
          <h1 
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-textPrimary relative"
            style={{ 
              fontFamily: 'var(--font-cascadia-code)', 
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            <span className="inline-block splash-letter" style={{ animationDelay: '0ms' }}>S</span>
            <span className="inline-block splash-letter" style={{ animationDelay: '80ms' }}>t</span>
            <span className="inline-block splash-letter" style={{ animationDelay: '160ms' }}>e</span>
            <span className="inline-block splash-letter" style={{ animationDelay: '240ms' }}>a</span>
            <span className="inline-block splash-letter" style={{ animationDelay: '320ms' }}>d</span>
            <span className="inline-block splash-letter" style={{ animationDelay: '400ms' }}>y</span>
          </h1>
          
          {/* Glow effect */}
          <div 
            className="absolute inset-0 blur-2xl opacity-20 animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(166, 255, 60, 0.5) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* Subtítulo animado */}
        <p 
          className="text-xs sm:text-sm md:text-base text-textSecondary mt-4 splash-subtitle"
          style={{ 
            fontFamily: 'var(--font-cascadia-code)',
          }}
        >
          Focus your money.
        </p>

        {/* Loading indicator */}
        <div className="mt-6 sm:mt-8 flex gap-1.5 splash-dots">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brandPrimary" />
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brandPrimary" />
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brandPrimary" />
        </div>
      </div>

      <style jsx>{`
        @keyframes splash-letter-fade {
          from {
            opacity: 0;
            transform: translateY(15px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes splash-subtitle-fade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes splash-dots-bounce {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        .splash-letter {
          animation: splash-letter-fade 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        .splash-subtitle {
          animation: splash-subtitle-fade 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 600ms;
          opacity: 0;
        }

        .splash-dots div:nth-child(1) {
          animation: splash-dots-bounce 1.4s ease-in-out infinite;
          animation-delay: 0ms;
        }

        .splash-dots div:nth-child(2) {
          animation: splash-dots-bounce 1.4s ease-in-out infinite;
          animation-delay: 200ms;
        }

        .splash-dots div:nth-child(3) {
          animation: splash-dots-bounce 1.4s ease-in-out infinite;
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  )
}

