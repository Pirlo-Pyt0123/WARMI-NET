import { useEffect, useState } from 'react'
import logoWarmi from '../assets/LogoWarmi.png'

function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setFadeOut(true)
    }, 2500)

    const finishTimer = setTimeout(() => {
      onFinish()
    }, 3000)

    return () => {
      clearTimeout(fadeOutTimer)
      clearTimeout(finishTimer)
    }
  }, [onFinish])

  return (
    <div 
      className={`fixed inset-0 bg-gradient-to-br from-warmi-white via-warmi-intense to-warmi-white flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className={`flex flex-col items-center gap-6 ${fadeOut ? 'scale-95' : 'scale-100 animate-fadeIn'} transition-transform duration-500`}>
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
          <img 
            src={logoWarmi} 
            alt="Warmi Logo" 
            className="relative w-48 h-48 object-contain rounded-3xl"
          />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Warmi</h1>
          <div className="flex gap-2 justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SplashScreen
