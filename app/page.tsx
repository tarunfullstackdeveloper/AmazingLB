"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { ArrowLeft, Lock, Share2, ChevronRight, Trophy, Check, Calendar, User, Clock, Bell } from "lucide-react"

// Types
type Screen = "splash" | "otp" | "game" | "prize" | "collection" | "leaderboard" | "calendar" | "stats"
type OtpStep = "phone" | "code"
type GamePhase = "waiting" | "moment" | "card" | "complete"
type LeaderboardTab = "thisMatch" | "hallOfFame"

interface Benefit {
  id: string
  icon: string
  title: string
  description: string
  banner: string
}

// Benefits data
const BENEFITS: Benefit[] = [
  {
    id: "bone",
    icon: "🦴",
    title: "BONE HEALTH",
    description: "Almonds have Calcium, Magnesium & Phosphorus which help maintain strong bones which let you hit the ball out of the park.",
    banner: "🏏 WHAT A SIX!"
  },
  {
    id: "muscle",
    icon: "💪",
    title: "MUSCLE RECOVERY",
    description: "Almonds are high in protein which help build and preserve muscles.",
    banner: "💪 INCREDIBLE CATCH!"
  },
  {
    id: "heart",
    icon: "❤️",
    title: "HEART HEALTH",
    description: "Almonds have monounsaturated fats which can help keep the heart healthy.",
    banner: "❤️ BOWLED HIM!"
  },
  {
    id: "calm",
    icon: "🧘",
    title: "CALM NERVES",
    description: "Almonds have Magnesium which helps the body manage stress.",
    banner: "🧘 LAST OVER THRILLER!"
  }
]

// Components
function CaliforniaAlmondsLogo({ className = "", small = false }: { className?: string; small?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 24 24" className={small ? "w-5 h-5" : "w-8 h-8"} fill="currentColor">
        <ellipse cx="12" cy="12" rx="6" ry="10" fill="#d4a017" />
        <ellipse cx="12" cy="12" rx="4" ry="7" fill="#c49a16" />
        <path d="M12 3 Q14 8, 12 21" stroke="#a88614" strokeWidth="0.5" fill="none" />
      </svg>
      <span className={`italic font-medium ${small ? "text-sm" : "text-lg"} text-white`}>
        california almonds™
      </span>
    </div>
  )
}

function AlmondSprite({ 
  onClick, 
  position 
}: { 
  onClick: () => void
  position: { x: number; y: number }
}) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -15 }}
      animate={{ 
        scale: 1, 
        rotate: 0,
        y: [0, -8, 0]
      }}
      transition={{
        scale: { type: "spring", stiffness: 300, damping: 15 },
        y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
      }}
      onClick={onClick}
      className="absolute cursor-pointer z-30"
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)"
      }}
    >
      <div className="relative">
        <motion.div
          animate={{ 
            boxShadow: [
              "0 0 20px rgba(212, 160, 23, 0.5)",
              "0 0 40px rgba(212, 160, 23, 0.8)",
              "0 0 20px rgba(212, 160, 23, 0.5)"
            ]
          }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-20 h-28 rounded-[50%] bg-gradient-to-br from-[#d4a017] via-[#c49a16] to-[#a88614] flex items-center justify-center"
        >
          <svg viewBox="0 0 24 32" className="w-16 h-24" fill="currentColor">
            <ellipse cx="12" cy="16" rx="10" ry="14" fill="#d4a017" />
            <ellipse cx="12" cy="16" rx="7" ry="10" fill="#c49a16" />
            <path d="M12 3 Q15 12, 12 29" stroke="#a88614" strokeWidth="1" fill="none" />
          </svg>
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-white text-center font-bold mt-2 text-sm drop-shadow-lg"
        >
          TAP!
        </motion.p>
      </div>
    </motion.div>
  )
}

function BenefitCard({ 
  benefit, 
  onCollect 
}: { 
  benefit: Benefit
  onCollect: () => void
}) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
      style={{ height: "70%" }}
    >
      <div className="h-full bg-gradient-to-br from-[#e67e22] to-[#c0392b] p-6 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl shrink-0">
            {benefit.icon}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white uppercase tracking-wide">{benefit.title}</h3>
          </div>
        </div>
        <p className="text-white text-base leading-relaxed flex-1">{benefit.description}</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onCollect}
          className="w-full bg-white text-[#e67e22] font-bold py-4 rounded-full text-lg mt-4"
        >
          COLLECT NOW
        </motion.button>
      </div>
    </motion.div>
  )
}

function MomentBanner({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ y: "-100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ duration: 0.3 }}
      className="absolute top-16 left-0 right-0 z-40 bg-[#e67e22] py-3 px-4"
    >
      <p className="text-white text-center font-bold text-xl uppercase tracking-wide">{text}</p>
    </motion.div>
  )
}

function FloatingGameNav({ 
  collectedBenefits,
  justCollectedId,
  onViewCollection,
  onViewLeaderboard,
  allCollected
}: { 
  collectedBenefits: string[]
  justCollectedId: string | null
  onViewCollection: () => void
  onViewLeaderboard: () => void
  allCollected: boolean
}) {
  const collectedCount = collectedBenefits.length
  
  return (
    <div className="absolute bottom-5 left-4 right-4 z-30">
      <div className="bg-black/70 backdrop-blur-xl rounded-2xl border border-white/[0.08] px-3 py-3">
        <div className="flex items-center">
          {/* Progress line behind circles */}
          <div className="absolute left-[calc(22px+12px)] right-[calc(22px+60px)] h-[2px] top-1/2 -translate-y-1/2">
            <div className="absolute inset-0 bg-white/10 rounded-full" />
            <motion.div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#e67e22] to-[#d4a017] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${(collectedCount / 4) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          
          {/* 4 Benefit Slots */}
          <div className="flex items-center justify-around flex-1 relative z-10">
            {BENEFITS.map((benefit, index) => {
              const isCollected = collectedBenefits.includes(benefit.id)
              const isJustCollected = justCollectedId === benefit.id
              
              return (
                <motion.button
                  key={benefit.id}
                  onClick={isCollected ? onViewCollection : undefined}
                  animate={isJustCollected ? { 
                    scale: [1, 1.5, 1],
                    boxShadow: [
                      "0 0 0px rgba(212,160,23,0)",
                      "0 0 30px rgba(212,160,23,0.8)",
                      "0 0 12px rgba(230,126,34,0.4)"
                    ]
                  } : {}}
                  transition={{ duration: 0.4 }}
                  className="relative"
                >
                  <div 
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCollected 
                        ? "bg-gradient-to-br from-[#e67e22] to-[#d4a017] border-2 border-[#d4a017] shadow-[0_0_12px_rgba(230,126,34,0.4)]" 
                        : "bg-white/[0.06] border border-dashed border-white/15"
                    }`}
                  >
                    {isCollected ? (
                      <span className="text-lg">{benefit.icon}</span>
                    ) : (
                      <span className="text-white/50 text-sm font-medium">?</span>
                    )}
                  </div>
                  
                  {/* Check badge for collected */}
                  {isCollected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-[#27ae60] rounded-full flex items-center justify-center"
                    >
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                </motion.button>
              )
            })}
          </div>
          
          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-3" />
          
          {/* Leaderboard Icon */}
          <motion.button
            onClick={allCollected ? onViewLeaderboard : undefined}
            animate={allCollected ? {
              boxShadow: [
                "0 0 8px rgba(212,160,23,0.3)",
                "0 0 20px rgba(212,160,23,0.6)",
                "0 0 8px rgba(212,160,23,0.3)"
              ]
            } : {}}
            transition={allCollected ? { repeat: Infinity, duration: 2 } : {}}
            className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              allCollected 
                ? "bg-gradient-to-br from-[#d4a017] to-[#e67e22]"
                : "bg-white/[0.06]"
            }`}
          >
            <Trophy className={`w-5 h-5 ${allCollected ? "text-white" : "text-white/30"}`} />
            
            {/* Lock overlay when not all collected */}
            {!allCollected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-3 h-3 text-white/40 absolute bottom-1 right-1" />
              </div>
            )}
            
            {/* Rank badge when all collected */}
            {allCollected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-[#c0392b] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              >
                #128
              </motion.div>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

// Screens
function SplashScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="h-full bg-gradient-to-b from-[#1a5276] to-[#0d1b2a] flex flex-col items-center justify-between p-6 relative overflow-hidden">
      {/* Floodlight effects */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-300/10 rounded-full blur-2xl" />
      
      <CaliforniaAlmondsLogo className="mt-8 z-10" />
      
      {/* Hero Almond */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <motion.div
          animate={{ 
            rotate: 360,
            boxShadow: [
              "0 0 30px rgba(212, 160, 23, 0.3)",
              "0 0 60px rgba(212, 160, 23, 0.6)",
              "0 0 30px rgba(212, 160, 23, 0.3)"
            ]
          }}
          transition={{ 
            rotate: { repeat: Infinity, duration: 20, ease: "linear" },
            boxShadow: { repeat: Infinity, duration: 3 }
          }}
          className="w-32 h-44 rounded-[50%] bg-gradient-to-br from-[#d4a017] via-[#c49a16] to-[#a88614] flex items-center justify-center"
        >
          <svg viewBox="0 0 24 32" className="w-24 h-36" fill="currentColor">
            <ellipse cx="12" cy="16" rx="10" ry="14" fill="#d4a017" />
            <ellipse cx="12" cy="16" rx="7" ry="10" fill="#c49a16" />
            <path d="M12 3 Q15 12, 12 29" stroke="#a88614" strokeWidth="1" fill="none" />
          </svg>
        </motion.div>
      </div>
      
      {/* Hero Text */}
      <div className="text-center z-10 mb-4">
        <h1 className="text-2xl font-bold text-white uppercase leading-tight tracking-wide text-balance">
          UNLOCK THE BENEFIT<br />OF ALMONDS.<br />UNLOCK TICKETS TO<br />THE FINALS.
        </h1>
        <p className="text-[#b0c4de] text-sm mt-4 leading-relaxed text-pretty">
          Look for almonds around you during key<br />moments of the match.<br />Find and tap them to collect the benefits.
        </p>
      </div>
      
      {/* CTA Button */}
      <motion.button
        onClick={onStart}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-full bg-[#27ae60] text-white font-bold py-4 rounded-full text-lg mb-4 z-10"
      >
        START
      </motion.button>
      
      {/* Footer */}
      <div className="flex items-center gap-2 text-white/60 text-xs z-10">
        <span>Powered by California Almonds</span>
        <span>🏏</span>
      </div>
    </div>
  )
}

function OTPScreen({ 
  onBack, 
  onVerify 
}: { 
  onBack: () => void
  onVerify: () => void
}) {
  const [step, setStep] = useState<OtpStep>("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState(["", "", "", ""])
  const [timer, setTimer] = useState(30)
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (step === "code" && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000)
      return () => clearInterval(interval)
    }
  }, [step, timer])

  const handleSendOTP = () => {
    if (phone.length === 10) {
      setStep("code")
      setTimer(30)
    }
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleVerify = () => {
    if (otp.every(d => d !== "")) {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        onVerify()
      }, 1000)
    }
  }

  const maskedPhone = phone.slice(0, 2) + "XXXXXX" + phone.slice(-2)

  return (
    <div className="h-full bg-[#d6eaf8] flex flex-col p-6">
      <button onClick={onBack} className="self-start mb-4">
        <ArrowLeft className="w-6 h-6 text-[#1a1a2e]" />
      </button>
      
      <CaliforniaAlmondsLogo className="self-center mb-8 [&_span]:text-[#1a1a2e]" small />
      
      <AnimatePresence mode="wait">
        {step === "phone" ? (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-2xl font-bold text-[#1a1a2e] mb-2">Enter your phone number</h2>
            <p className="text-[#1a1a2e]/60 text-sm mb-6">{"We'll send you a one-time code to verify"}</p>
            
            <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 mb-6">
              <span className="text-xl">🇮🇳</span>
              <span className="text-[#1a1a2e] font-medium">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="98765 43210"
                className="flex-1 text-xl font-medium text-[#1a1a2e] outline-none bg-transparent"
              />
            </div>
            
            <button
              onClick={handleSendOTP}
              disabled={phone.length !== 10}
              className="w-full bg-[#e67e22] text-white font-bold py-4 rounded-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send OTP
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="code"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-2xl font-bold text-[#1a1a2e] mb-2">Enter the 4-digit code</h2>
            <p className="text-[#1a1a2e]/60 text-sm mb-6">Sent to +91 {maskedPhone}</p>
            
            <div className="flex justify-center gap-4 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="tel"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  className="w-14 h-16 text-center text-2xl font-bold text-[#1a1a2e] bg-white rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-[#e67e22]"
                />
              ))}
            </div>
            
            <div className="text-center mb-6">
              {timer > 0 ? (
                <p className="text-[#1a1a2e]/60 text-sm">Resend in 0:{timer.toString().padStart(2, "0")}</p>
              ) : (
                <button 
                  onClick={() => setTimer(30)}
                  className="text-[#e67e22] font-medium text-sm"
                >
                  Resend OTP
                </button>
              )}
            </div>
            
            <button
              onClick={handleVerify}
              disabled={!otp.every(d => d !== "") || loading}
              className="w-full bg-[#e67e22] text-white font-bold py-4 rounded-full text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                "Verify"
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function GameScreen({ 
  collectedBenefits,
  onCollectBenefit,
  onComplete,
  onViewCollection,
  onViewLeaderboard
}: { 
  collectedBenefits: string[]
  onCollectBenefit: (id: string) => void
  onComplete: () => void
  onViewCollection: () => void
  onViewLeaderboard: () => void
}) {
  const [gamePhase, setGamePhase] = useState<GamePhase>("waiting")
  const [currentMomentIndex, setCurrentMomentIndex] = useState(0)
  const [showBanner, setShowBanner] = useState(false)
  const [showAlmond, setShowAlmond] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [almondPosition, setAlmondPosition] = useState({ x: 50, y: 40 })
  const [justCollectedId, setJustCollectedId] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Camera state
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const getRandomPosition = () => ({
    x: 20 + Math.random() * 60,
    y: 25 + Math.random() * 35
  })

  // Camera initialization
  useEffect(() => {
    let mounted = true
    
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        })
        
        if (mounted) {
          setCameraStream(stream)
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        }
      } catch (err) {
        if (mounted) {
          setCameraError(true)
        }
      }
    }
    
    startCamera()
    
    return () => {
      mounted = false
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const triggerMoment = useCallback((index: number) => {
    if (index >= BENEFITS.length) {
      // All benefits collected
      setGamePhase("complete")
      
      // Fire confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#d4a017", "#e67e22", "#ffffff"]
      })
      
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#d4a017", "#e67e22", "#ffffff"]
        })
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#d4a017", "#e67e22", "#ffffff"]
        })
      }, 250)
      
      setTimeout(onComplete, 3000)
      return
    }

    setGamePhase("moment")
    setAlmondPosition(getRandomPosition())
    setShowBanner(true)
    setShowAlmond(true)
    
    setTimeout(() => setShowBanner(false), 3000)
  }, [onComplete])

  useEffect(() => {
    // Start first moment after 5 seconds
    timeoutRef.current = setTimeout(() => {
      triggerMoment(0)
    }, 5000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [triggerMoment])

  const handleAlmondTap = () => {
    // Burst animation effect
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { 
        x: almondPosition.x / 100, 
        y: almondPosition.y / 100 
      },
      colors: ["#d4a017", "#e67e22"],
      startVelocity: 20,
      gravity: 0.5
    })
    
    setShowAlmond(false)
    setShowCard(true)
    setGamePhase("card")
  }

  const handleCollect = () => {
    const benefit = BENEFITS[currentMomentIndex]
    onCollectBenefit(benefit.id)
    setJustCollectedId(benefit.id)
    setShowCard(false)
    setGamePhase("waiting")
    
    setTimeout(() => setJustCollectedId(null), 600)
    
    // Trigger next moment after 15 seconds
    const nextIndex = currentMomentIndex + 1
    setCurrentMomentIndex(nextIndex)
    
    if (nextIndex < BENEFITS.length) {
      timeoutRef.current = setTimeout(() => {
        triggerMoment(nextIndex)
      }, 15000)
    } else {
      // All collected - trigger completion
      triggerMoment(nextIndex)
    }
  }

  const currentBenefit = BENEFITS[currentMomentIndex]

  return (
    <div className="h-full relative overflow-hidden">
      {/* TIER 1: Real camera feed */}
      {!cameraError && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}

      {/* TIER 2: Fallback - animated room simulation */}
      {cameraError && (
        <div className="absolute inset-0 w-full h-full z-0">
          <div className="w-full h-full bg-gradient-to-b from-slate-700 via-slate-600 to-slate-800 relative overflow-hidden">
            {/* Simulated room elements */}
            <div className="absolute top-[10%] left-[5%] w-[40%] h-[20%] bg-slate-500/30 rounded-lg" />
            <div className="absolute top-[8%] right-[10%] w-[35%] h-[25%] bg-slate-500/20 rounded-lg" />
            <div className="absolute top-[35%] left-[8%] w-[25%] h-[15%] bg-slate-500/25 rounded" />
            <div className="absolute bottom-[15%] left-[10%] w-[80%] h-[30%] bg-slate-500/20 rounded-xl" />
            <div className="absolute bottom-[20%] right-[5%] w-[30%] h-[35%] bg-slate-500/15 rounded-full" />
            
            {/* Subtle moving light effect */}
            <div
              className="absolute w-[200%] h-[200%] opacity-10 animate-camera-pan"
              style={{
                background: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 50%)'
              }}
            />
          </div>
        </div>
      )}
      
      {/* LIVE badge */}
      <div className="absolute top-16 left-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-2 h-2 rounded-full bg-red-500"
        />
        <span className="text-white text-[11px] font-medium">LIVE</span>
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/60 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <CaliforniaAlmondsLogo small className="scale-75 origin-left" />
        <span className="text-white text-xs">CSK vs MI • 14.3 Overs</span>
        <div className="flex items-center gap-1">
          <span className="text-lg">🌰</span>
          <span className="text-[#e67e22] font-bold">{collectedBenefits.length}/4</span>
        </div>
      </div>

      {/* Moment Banner */}
      <AnimatePresence>
        {showBanner && currentBenefit && (
          <MomentBanner text={currentBenefit.banner} />
        )}
      </AnimatePresence>

      {/* Waiting state */}
      <AnimatePresence>
        {gamePhase === "waiting" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-5xl mb-4"
              >
                🏏
              </motion.div>
              <p className="text-white font-bold text-lg mb-2">Watching with you!</p>
              <p className="text-white/70 text-sm">
                Almonds will appear during epic<br />match moments. Stay ready!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete state */}
      <AnimatePresence>
        {gamePhase === "complete" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center z-40 bg-black/70"
          >
            <div className="text-center p-6">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white mb-4"
              >
                DEKHA, BADAAM KHAANE<br />KE FAAYEDA!
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/80"
              >
                {"You've collected all 4 benefits!"}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Almond Sprite */}
      <AnimatePresence>
        {showAlmond && (
          <AlmondSprite 
            position={almondPosition}
            onClick={handleAlmondTap}
          />
        )}
      </AnimatePresence>

      {/* Benefit Card */}
      <AnimatePresence>
        {showCard && currentBenefit && (
          <BenefitCard 
            benefit={currentBenefit}
            onCollect={handleCollect}
          />
        )}
      </AnimatePresence>

      {/* Floating Bottom Nav */}
      <FloatingGameNav
        collectedBenefits={collectedBenefits}
        justCollectedId={justCollectedId}
        onViewCollection={onViewCollection}
        onViewLeaderboard={onViewLeaderboard}
        allCollected={collectedBenefits.length === 4}
      />
    </div>
  )
}

// Leaderboard data
const LEADERBOARD_DATA = [
  { rank: 1, name: "Priya S.", initials: "PS", time: "0:42s" },
  { rank: 2, name: "Rahul M.", initials: "RM", time: "0:48s" },
  { rank: 3, name: "Deepak K.", initials: "DK", time: "0:51s" },
  { rank: 4, name: "Ananya R.", initials: "AR", time: "0:55s" },
  { rank: 5, name: "Vikram T.", initials: "VT", time: "1:02s" },
  { rank: 6, name: "Meera J.", initials: "MJ", time: "1:08s" },
  { rank: 7, name: "Arjun P.", initials: "AP", time: "1:12s" },
  { rank: 8, name: "Sneha D.", initials: "SD", time: "1:15s" },
  { rank: 9, name: "Karan B.", initials: "KB", time: "1:22s" },
  { rank: 10, name: "Neha G.", initials: "NG", time: "1:28s" },
  { rank: 11, name: "Ravi V.", initials: "RV", time: "1:30s" },
  { rank: 12, name: "Pooja L.", initials: "PL", time: "1:31s" },
  { rank: 128, name: "You", initials: "YO", time: "1:32s", isUser: true },
]

const HALL_OF_FAME = [
  {
    match: "CSK vs MI",
    date: "Mar 10",
    winner: "Rahul M.",
    initials: "RM",
    time: "0:42s",
    totalFans: 189,
    isFeatured: true
  },
  {
    match: "RCB vs KKR",
    date: "Mar 8",
    winner: "Ananya R.",
    initials: "AR",
    time: "0:38s",
    totalFans: 212
  },
  {
    match: "DC vs SRH",
    date: "Mar 6",
    winner: "Vikram T.",
    initials: "VT",
    time: "0:45s",
    totalFans: 156
  }
]

// Match schedule data
type MatchStatus = "played" | "missed" | "live" | "upcoming"
interface Match {
  date: string
  day: string
  dayOfWeek: string
  month: string
  teams: string
  venue: string
  time: string
  status: MatchStatus
  rank?: number
}

const MATCH_SCHEDULE: Match[] = [
  { date: "6", day: "6", dayOfWeek: "THU", month: "MAR", teams: "DC vs SRH", venue: "Arun Jaitley Stadium", time: "7:30 PM", status: "played", rank: 87 },
  { date: "8", day: "8", dayOfWeek: "SAT", month: "MAR", teams: "RCB vs KKR", venue: "Chinnaswamy Stadium", time: "7:30 PM", status: "missed" },
  { date: "10", day: "10", dayOfWeek: "MON", month: "MAR", teams: "CSK vs MI", venue: "Chepauk Stadium", time: "7:30 PM", status: "played", rank: 128 },
  { date: "13", day: "13", dayOfWeek: "THU", month: "MAR", teams: "MI vs RCB", venue: "Wankhede Stadium", time: "7:30 PM", status: "live" },
  { date: "16", day: "16", dayOfWeek: "SUN", month: "MAR", teams: "CSK vs RCB", venue: "Chepauk Stadium", time: "7:30 PM", status: "upcoming" },
  { date: "18", day: "18", dayOfWeek: "TUE", month: "MAR", teams: "KKR vs DC", venue: "Eden Gardens", time: "7:30 PM", status: "upcoming" },
  { date: "20", day: "20", dayOfWeek: "THU", month: "MAR", teams: "SRH vs MI", venue: "Rajiv Gandhi Stadium", time: "3:30 PM", status: "upcoming" },
  { date: "22", day: "22", dayOfWeek: "SAT", month: "MAR", teams: "RCB vs CSK", venue: "Chinnaswamy Stadium", time: "7:30 PM", status: "upcoming" },
  { date: "25", day: "25", dayOfWeek: "TUE", month: "MAR", teams: "MI vs KKR", venue: "Wankhede Stadium", time: "7:30 PM", status: "upcoming" },
  { date: "28", day: "28", dayOfWeek: "FRI", month: "MAR", teams: "DC vs RCB", venue: "Arun Jaitley Stadium", time: "7:30 PM", status: "upcoming" },
]

// User season stats
const USER_STATS = {
  name: "Nishant P.",
  initials: "NP",
  joinDate: "Mar 6",
  streak: 3,
  matchesPlayed: 2,
  totalMatches: 3,
  almondsCollected: 8,
  bestRank: 42,
  bestRankMatch: "DC vs SRH",
  bestRankDate: "Mar 6",
  fastestTime: "1:12s",
  fastestMatch: "DC vs SRH",
  fastestDate: "Mar 6",
  almondDNA: {
    bone: 80,
    muscle: 100,
    heart: 80,
    calm: 60
  },
  personalityType: "Muscle Collector",
  matchHistory: [
    { date: "Mar 10", teams: "CSK vs MI", collected: 4, rank: 128, time: "1:32s" },
    { date: "Mar 6", teams: "DC vs SRH", collected: 4, rank: 42, time: "1:12s" },
    { date: "Mar 8", teams: "RCB vs KKR", collected: 0, rank: null, time: null, missed: true }
  ]
}

// Circular progress ring component
function ProgressRing({ progress, size = 40, strokeWidth = 3 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        className="stroke-white/10"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <motion.circle
        className="stroke-[#e67e22]"
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ strokeDasharray: circumference }}
      />
    </svg>
  )
}

function QuickRankCard({ onViewLeaderboard }: { onViewLeaderboard: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-6"
    >
      {/* Quick Rank Card */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-xl p-4">
        <div className="flex items-center gap-4">
          {/* Rank Number */}
          <div className="text-[#e67e22] font-bold text-3xl">#128</div>
          
          {/* Center Info */}
          <div className="flex-1">
            <p className="text-white font-bold">Your Rank</p>
            <p className="text-white/50 text-xs">Out of 243 fans this match</p>
            <p className="text-[#e67e22] text-[11px] italic mt-1">
              Top 53% — be faster next time!
            </p>
          </div>
          
          {/* Progress Ring */}
          <div className="relative">
            <ProgressRing progress={53} size={44} strokeWidth={4} />
            <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">
              53%
            </span>
          </div>
        </div>
      </div>
      
      {/* View Full Leaderboard Link */}
      <button
        onClick={onViewLeaderboard}
        className="w-full mt-3 text-[#e67e22] text-sm font-medium flex items-center justify-center gap-1 hover:underline"
      >
        View Full Leaderboard
        <Trophy className="w-4 h-4" />
        <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

function PrizeScreen({ 
  onShare,
  onPlayAgain,
  onViewLeaderboard,
  onViewCalendar,
  onViewStats
}: { 
  onShare: () => void
  onPlayAgain: () => void
  onViewLeaderboard: () => void
  onViewCalendar: () => void
  onViewStats: () => void
}) {
  useEffect(() => {
    // Ambient confetti
    const interval = setInterval(() => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.5 },
        colors: ["#d4a017", "#e67e22"],
        gravity: 0.3
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.5 },
        colors: ["#d4a017", "#e67e22"],
        gravity: 0.3
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-full bg-[#0d1b2a] overflow-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="p-6 flex flex-col min-h-full">
        {/* Header icons */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={onViewStats} className="p-2 bg-white/5 rounded-full">
            <User className="w-5 h-5 text-white/70" />
          </button>
          <button onClick={onViewCalendar} className="p-2 bg-white/5 rounded-full">
            <Calendar className="w-5 h-5 text-white/70" />
          </button>
        </div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">{"You're in the draw!"}</h1>
          <p className="text-white/70 text-sm">
            {"You've unlocked all the benefits of California Almonds and you're now entered to win "}
            <span className="text-[#e67e22] font-bold">IPL Finals Tickets</span>!
          </p>
        </motion.div>

        <p className="text-[#e67e22] font-bold uppercase text-sm tracking-wider mb-4">
          YOUR BADAM COLLECTION
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {BENEFITS.map((benefit, index) => (
            <motion.div
              key={benefit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-gradient-to-br from-[#e67e22] to-[#c0392b] rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shrink-0">
                  {benefit.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm">{benefit.title}</p>
                  <p className="text-white/80 text-xs line-clamp-2">
                    {benefit.description.split(" ").slice(0, 6).join(" ")}...
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Rank Card */}
        <QuickRankCard onViewLeaderboard={onViewLeaderboard} />

        {/* Mini navigation buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={onViewCalendar}
            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl py-3 px-4 flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4 text-white/70" />
            <span className="text-white text-xs font-medium">Match Schedule</span>
          </button>
          <button
            onClick={onViewStats}
            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl py-3 px-4 flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4 text-white/70" />
            <span className="text-white text-xs font-medium">My Stats</span>
          </button>
        </div>

        <p className="text-[#e67e22] font-bold italic text-center text-lg mb-6">
          Dekha, Badaam Khaane Ke Faayeda!
        </p>

        <div className="space-y-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onShare}
            className="w-full bg-[#27ae60] text-white font-semibold py-3 rounded-full text-sm flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share & Improve Your Chances
          </motion.button>

          <button 
            onClick={onPlayAgain}
            className="w-full text-white/70 text-sm py-2 flex items-center justify-center gap-1"
          >
            Play again in the next match
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 pt-4">
            <CaliforniaAlmondsLogo small />
          </div>
          <p className="text-center text-white/40 text-xs">T&C Apply</p>
        </div>
      </div>
    </div>
  )
}

function CollectionScreen({ 
  collectedBenefits,
  onBack
}: { 
  collectedBenefits: string[]
  onBack: () => void
}) {
  return (
    <div className="h-full bg-[#0d1b2a] flex flex-col">
      {/* Header */}
      <div className="bg-[#1a5276] px-4 pt-10 pb-4 flex items-center gap-4">
        <button onClick={onBack}>
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-white font-bold flex-1 text-center pr-6">YOUR BADAM COLLECTION</h1>
      </div>
      
      {/* Progress */}
      <div className="p-4">
        <p className="text-white/70 text-sm mb-2">
          {collectedBenefits.length} of 4 benefits collected
        </p>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(collectedBenefits.length / 4) * 100}%` }}
            className="h-full bg-[#e67e22] rounded-full"
          />
        </div>
      </div>

      {/* Benefit Cards */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {BENEFITS.map((benefit) => {
          const isCollected = collectedBenefits.includes(benefit.id)
          return (
            <motion.div
              key={benefit.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-xl p-4 ${
                isCollected 
                  ? "bg-gradient-to-br from-[#e67e22] to-[#c0392b]" 
                  : "bg-[#1a1a2e]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${
                  isCollected ? "bg-white" : "bg-white/10"
                }`}>
                  {isCollected ? benefit.icon : <Lock className="w-5 h-5 text-white/50" />}
                </div>
                <div className="min-w-0">
                  <p className={`font-bold ${isCollected ? "text-white" : "text-white/50"}`}>
                    {isCollected ? benefit.title : "???"}
                  </p>
                  <p className={`text-sm ${isCollected ? "text-white/90" : "text-white/30"}`}>
                    {isCollected ? benefit.description : "Collect during the next match moment"}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Bottom text */}
      <div className="p-4">
        <p className="text-white/60 text-center text-sm mb-4">
          Keep watching! More almonds will appear during epic moments.
        </p>
        <button
          onClick={onBack}
          className="w-full bg-[#e67e22] text-white font-bold py-4 rounded-full"
        >
          Back to Game
        </button>
      </div>
    </div>
  )
}

// Dedicated Leaderboard Screen (Screen 6)
function LeaderboardScreen({ 
  onBack,
  onPlayAgain,
  onViewCalendar
}: { 
  onBack: () => void
  onPlayAgain: () => void
  onViewCalendar: () => void
}) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("thisMatch")
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to user's row after 1 second
    if (activeTab === "thisMatch" && listRef.current) {
      setTimeout(() => {
        const userRow = listRef.current?.querySelector('[data-user="true"]')
        userRow?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 1000)
    }
  }, [activeTab])

  const featuredWinner = HALL_OF_FAME.find(w => w.isFeatured)

  return (
    <div className="h-full bg-[#0d1b2a] flex flex-col">
      {/* Header */}
      <div className="bg-[#1a5276] px-4 pt-10 pb-4 flex items-center justify-between">
        <button onClick={onBack}>
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-white font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#d4a017]" />
          Leaderboard
        </h1>
        <button onClick={onViewCalendar}>
          <Calendar className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* Tab Toggle */}
      <div className="px-4 pt-4">
        <div className="flex bg-white/[0.06] rounded-full p-1">
          <motion.button
            onClick={() => setActiveTab("thisMatch")}
            className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === "thisMatch"
                ? "bg-[#e67e22] text-white"
                : "text-white/50"
            }`}
          >
            This Match
          </motion.button>
          <motion.button
            onClick={() => setActiveTab("hallOfFame")}
            className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === "hallOfFame"
                ? "bg-[#e67e22] text-white"
                : "text-white/50"
            }`}
          >
            Hall of Fame
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === "thisMatch" ? (
            <motion.div
              key="thisMatch"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              {/* Match Stats Row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { value: "243", label: "Fans Played", color: "#e67e22" },
                  { value: "0:38s", label: "Fastest Time", color: "#d4a017" },
                  { value: "4", label: "Prizes Left", color: "#27ae60" }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-xl p-3 text-center"
                  >
                    <p className="font-bold text-xl" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-white/50 text-[10px]">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Your Rank Card (Pinned) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="relative mb-4"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#e67e22] to-[#d4a017] opacity-20 blur-sm" />
                <div className="relative bg-[#0d1b2a] border-2 border-[#e67e22] rounded-xl p-4 overflow-hidden">
                  {/* Animated border glow */}
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-xl border-2 border-[#e67e22]"
                  />
                  
                  <div className="flex items-center gap-3 relative z-10">
                    {/* Rank badge */}
                    <div className="w-12 h-12 rounded-full bg-[#e67e22]/20 border-2 border-[#e67e22] flex items-center justify-center">
                      <span className="text-[#e67e22] font-bold text-lg">#128</span>
                    </div>
                    
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 text-sm font-medium">
                      YO
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1">
                      <p className="text-white font-bold">You</p>
                      <p className="text-white/50 text-xs">98XXXX1234</p>
                    </div>
                    
                    {/* Benefits & Time */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end mb-1">
                        <span className="text-[#27ae60] font-bold text-sm">4/4</span>
                        <div className="flex gap-0.5">
                          {BENEFITS.map((b) => (
                            <span key={b.id} className="text-[10px]">{b.icon}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-white text-sm">1:32s</p>
                    </div>
                  </div>
                  
                  {/* Subtext bar */}
                  <div className="mt-3 -mx-4 -mb-4 px-4 py-2 bg-[#e67e22]/10">
                    <p className="text-[#e67e22] text-xs italic text-center">
                      {"⚡ You're in the top 53% of collectors! Be faster to climb up."}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Leaderboard List */}
              <div className="relative" ref={listRef}>
                {/* Top 3 Podium */}
                <div className="space-y-2 mb-2">
                  {LEADERBOARD_DATA.slice(0, 3).map((entry, index) => {
                    const medals = ["🥇", "🥈", "🥉"]
                    const borderColors = ["#d4a017", "#c0c0c0", "#cd7f32"]
                    const bgGlows = [
                      "shadow-[0_0_20px_rgba(212,160,23,0.2)]",
                      "shadow-[0_0_15px_rgba(192,192,192,0.15)]",
                      "shadow-[0_0_15px_rgba(205,127,50,0.15)]"
                    ]
                    
                    return (
                      <motion.div
                        key={entry.rank}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className={`bg-black/40 backdrop-blur-xl rounded-xl p-3 border-l-4 ${bgGlows[index]}`}
                        style={{ borderLeftColor: borderColors[index] }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{medals[index]}</span>
                          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 text-xs font-medium"
                            style={{ boxShadow: index === 0 ? `0 0 10px ${borderColors[index]}` : undefined }}
                          >
                            {entry.initials}
                          </div>
                          <span className="text-white font-medium flex-1">{entry.name}</span>
                          <span className="text-[#27ae60] text-xs font-medium">4/4</span>
                          <span className="text-white/50 text-xs w-12 text-right">{entry.time}</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Rest of the list */}
                <div className="space-y-1">
                  {LEADERBOARD_DATA.slice(3).map((entry, index) => (
                    <motion.div
                      key={entry.rank}
                      data-user={entry.isUser || undefined}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      className={`flex items-center gap-3 py-2.5 px-3 rounded-lg ${
                        entry.isUser 
                          ? "bg-[#e67e22]/[0.08] border-l-2 border-[#e67e22]" 
                          : index % 2 === 0 ? "bg-white/[0.02]" : ""
                      }`}
                    >
                      <span className={`w-8 text-sm ${entry.isUser ? "text-[#e67e22] font-bold" : "text-white/40"}`}>
                        #{entry.rank}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-[10px] font-medium">
                        {entry.initials}
                      </div>
                      <span className={`flex-1 text-sm ${entry.isUser ? "text-white font-medium" : "text-white"}`}>
                        {entry.name}
                      </span>
                      <span className="text-[#27ae60] text-xs">4/4</span>
                      <span className="text-white/50 text-xs w-12 text-right">{entry.time}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0d1b2a] to-transparent pointer-events-none" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="hallOfFame"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              {/* Hero Winner Spotlight */}
              {featuredWinner && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative mb-6 overflow-hidden rounded-2xl"
                >
                  {/* Animated shimmer border */}
                  <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-[#d4a017] via-[#e67e22] to-[#d4a017] animate-shimmer" 
                    style={{ 
                      backgroundSize: "200% 100%",
                      animation: "shimmer 3s linear infinite"
                    }}
                  />
                  <div className="relative bg-[#0d1b2a] rounded-2xl p-6 m-[2px]">
                    {/* Radial glow behind trophy */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#d4a017]/20 rounded-full blur-2xl" />
                    
                    <div className="text-center relative z-10">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-5xl mb-3"
                      >
                        🏆
                      </motion.div>
                      <h3 className="text-white font-bold text-2xl mb-1">{featuredWinner.winner}</h3>
                      <p className="text-[#d4a017] font-bold mb-2">Won 2 IPL Finals Tickets!</p>
                      <span className="inline-block bg-[#1a5276] text-white text-xs px-3 py-1 rounded-full mb-3">
                        {featuredWinner.match} • {featuredWinner.date}
                      </span>
                      <p className="text-white/60 text-sm">
                        Collected 4/4 in <span className="text-white font-bold">{featuredWinner.time}</span> — Fastest of {featuredWinner.totalFans} fans
                      </p>
                      <p className="text-[#27ae60] text-xs mt-2 flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" /> Verified Winner
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* All Match Winners */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-white font-bold">All Match Winners</h4>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="space-y-3">
                  {HALL_OF_FAME.map((winner, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 border-l-4 border-l-[#d4a017]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 text-sm font-medium shrink-0">
                          {winner.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-bold">{winner.winner}</span>
                            <span className="bg-[#1a5276] text-white text-[10px] px-2 py-0.5 rounded-full">
                              {winner.match} • {winner.date}
                            </span>
                          </div>
                          <p className="text-[#d4a017] font-bold text-sm mb-2">Won 2 IPL Finals Tickets</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white">Collected in <span className="font-bold">{winner.time}</span></span>
                            <span className="text-white/50">Fastest of {winner.totalFans} fans</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Motivational Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-[#e67e22] to-[#c0392b] rounded-xl p-4 text-center"
              >
                <p className="text-white font-bold mb-1">
                  Be the fastest collector to win tickets for the next match!
                </p>
                <p className="text-white/80 text-sm mb-3">New winners every match day</p>
                <button
                  onClick={onPlayAgain}
                  className="bg-white text-[#e67e22] font-bold py-2 px-6 rounded-full text-sm"
                >
                  Play Next Match →
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  )
}

// Screen 7: IPL Match Calendar
function CalendarScreen({ 
  onBack,
  onPlayNow,
  onViewStats
}: { 
  onBack: () => void
  onPlayNow: () => void
  onViewStats: () => void
}) {
  const [reminderSet, setReminderSet] = useState<string | null>(null)
  const liveMatch = MATCH_SCHEDULE.find(m => m.status === "live")
  const upcomingMatches = MATCH_SCHEDULE.filter(m => m.status === "upcoming")
  const matchesLeft = upcomingMatches.length

  const handleSetReminder = (matchDate: string) => {
    setReminderSet(matchDate)
    setTimeout(() => setReminderSet(null), 2000)
  }

  return (
    <div className="h-full bg-[#0d1b2a] flex flex-col">
      {/* Header */}
      <div className="bg-[#1a5276] px-4 pt-10 pb-4 flex items-center justify-between">
        <button onClick={onBack} className="w-10">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-white font-bold text-lg tracking-wide">
          IPL 2026 Schedule
        </h1>
        <button onClick={onViewStats} className="w-10 flex justify-end">
          <User className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-b from-[#1a5276] to-[#0d1b2a] px-4 py-5 relative overflow-hidden">
        {/* Floodlight glow dots */}
        <div className="absolute top-2 left-4 w-2 h-2 bg-[#d4a017]/30 rounded-full blur-sm" />
        <div className="absolute top-2 right-4 w-2 h-2 bg-[#d4a017]/30 rounded-full blur-sm" />
        
        <p className="text-white text-center font-bold text-sm mb-1">
          Collect almonds every match day.
        </p>
        <p className="text-white/70 text-center text-xs mb-3">
          More matches = more chances to win.
        </p>
        
        {/* Streak indicator */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg">{"🔥🔥🔥"}</span>
          <span className="text-[#e67e22] font-bold text-xs">
            3-match streak! Play tomorrow for 2x entries
          </span>
        </div>
      </div>

      {/* Current/Live Match Card */}
      {liveMatch && (
        <div className="px-4 -mt-2 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl p-[2px] overflow-hidden"
            style={{
              background: "conic-gradient(from 0deg, #e67e22, #d4a017, #e67e22, #d4a017, #e67e22)"
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
              style={{
                background: "conic-gradient(from 0deg, #e67e22, #d4a017, #e67e22, #d4a017, #e67e22)"
              }}
            />
            <div className="relative bg-[#0d1b2a] rounded-2xl p-4">
              {/* Live badge */}
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-2 h-2 bg-[#27ae60] rounded-full"
                />
                <span className="bg-[#27ae60] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  LIVE NOW
                </span>
              </div>
              
              {/* Teams */}
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{liveMatch.teams.split(" vs ")[0]}</span>
                  </div>
                </div>
                <span className="text-white/50 text-sm">vs</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{liveMatch.teams.split(" vs ")[1]}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-white/50 text-xs text-center mb-1">Tonight • {liveMatch.time} IST</p>
              <p className="text-white/40 text-[10px] text-center mb-3">{liveMatch.venue}</p>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                onClick={onPlayNow}
                className="w-full bg-[#27ae60] text-white font-bold py-2.5 rounded-full text-sm"
              >
                Play Now
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Match Schedule List */}
      <div className="flex-1 overflow-auto scrollbar-hide px-4 pb-20">
        <p className="text-[#e67e22] uppercase text-xs font-bold tracking-widest mb-3">
          MARCH 2026
        </p>
        
        <div className="space-y-2">
          {MATCH_SCHEDULE.map((match, index) => {
            const borderColor = 
              match.status === "played" ? "border-l-[#27ae60]" :
              match.status === "missed" ? "border-l-[#c0392b]" :
              match.status === "live" ? "border-l-[#e67e22]" : "border-l-transparent"
            
            const bgHighlight = match.status === "live" ? "bg-[#e67e22]/5" : ""
            
            return (
              <motion.div
                key={match.date}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 border-l-[3px] ${borderColor} ${bgHighlight}`}
              >
                <div className="flex items-center gap-3">
                  {/* Date column */}
                  <div className="w-12 text-center">
                    <p className="text-white font-bold text-xl">{match.day}</p>
                    <p className="text-white/40 text-[10px]">{match.month}</p>
                    <p className="text-white/40 text-[10px]">{match.dayOfWeek}</p>
                  </div>
                  
                  {/* Match info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm">{match.teams}</p>
                    <p className="text-white/40 text-[10px]">{match.venue}</p>
                    <p className="text-white/40 text-[10px]">{match.time} IST</p>
                  </div>
                  
                  {/* Status column */}
                  <div className="text-right">
                    {match.status === "played" && (
                      <div className="flex items-center gap-1">
                        <span className="bg-[#e67e22]/20 text-[#e67e22] text-xs font-bold px-2 py-0.5 rounded-full">
                          #{match.rank}
                        </span>
                        <span className="text-[#27ae60] text-[10px]">Played</span>
                      </div>
                    )}
                    {match.status === "missed" && (
                      <span className="text-[#c0392b] text-xs">Missed</span>
                    )}
                    {match.status === "live" && (
                      <div className="flex items-center gap-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-2 h-2 bg-[#27ae60] rounded-full"
                        />
                        <span className="text-[#27ae60] text-xs font-bold">LIVE</span>
                      </div>
                    )}
                    {match.status === "upcoming" && (
                      <button
                        onClick={() => handleSetReminder(match.date)}
                        className={`flex items-center gap-1 text-xs ${
                          reminderSet === match.date ? "text-[#27ae60]" : "text-white/50"
                        }`}
                      >
                        {reminderSet === match.date ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{match.time}</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Bottom motivational bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-xl border-t border-white/[0.06] px-4 py-3">
        <p className="text-white text-xs text-center">
          {matchesLeft} matches left this season - {"Don't miss a single almond!"}
        </p>
      </div>

      {/* Reminder toast */}
      <AnimatePresence>
        {reminderSet && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-16 left-4 right-4 bg-[#27ae60] text-white text-sm text-center py-3 rounded-xl"
          >
            <Bell className="w-4 h-4 inline mr-2" />
            {"We'll notify you when the match starts!"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Screen 8: Your Season Stats
function StatsScreen({ 
  onBack,
  onShare
}: { 
  onBack: () => void
  onShare: () => void
}) {
  const [showShareToast, setShowShareToast] = useState(false)

  const handleShare = () => {
    setShowShareToast(true)
    onShare()
    setTimeout(() => setShowShareToast(false), 2000)
  }

  return (
    <div className="h-full bg-[#0d1b2a] overflow-auto scrollbar-hide">
      {/* Header */}
      <div className="bg-[#1a5276] px-4 pt-10 pb-4 flex items-center justify-between">
        <button onClick={onBack} className="w-10">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-white font-bold text-lg tracking-wide">
          Your IPL Season
        </h1>
        <button onClick={handleShare} className="w-10 flex justify-end">
          <Share2 className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* Hero Profile Section */}
      <div className="bg-gradient-to-b from-[#1a5276] to-[#0d1b2a] px-4 py-8 relative overflow-hidden">
        {/* Floating gold particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#d4a017]/40 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
        
        <div className="flex flex-col items-center relative z-10">
          {/* Avatar */}
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-black/40 border-2 border-[#e67e22] flex items-center justify-center shadow-[0_0_20px_rgba(230,126,34,0.3)]">
              <span className="text-white font-bold text-2xl">{USER_STATS.initials}</span>
            </div>
          </div>
          
          <h2 className="text-white font-bold text-xl mb-1">{USER_STATS.name}</h2>
          <p className="text-white/50 italic text-xs mb-3">Almond Collector since {USER_STATS.joinDate}</p>
          
          {/* Streak badge */}
          <div className="bg-[#e67e22] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
            <span>{"🔥"}</span>
            <span>{USER_STATS.streak}-Match Streak</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6">
        {/* Season Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { value: USER_STATS.matchesPlayed.toString(), label: "Matches Played", sub: `out of ${USER_STATS.totalMatches} so far`, color: "#e67e22", icon: "📊" },
            { value: USER_STATS.almondsCollected.toString(), label: "Almonds Collected", sub: "across all matches", color: "#d4a017", icon: "🌰" },
            { value: `#${USER_STATS.bestRank}`, label: "Best Rank", sub: `${USER_STATS.bestRankMatch} • ${USER_STATS.bestRankDate}`, color: "#27ae60", icon: "🏆" },
            { value: USER_STATS.fastestTime, label: "Fastest Collection", sub: `${USER_STATS.fastestMatch} • ${USER_STATS.fastestDate}`, color: "#ffffff", icon: "⚡" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="bg-white/[0.05] border border-white/[0.06] rounded-xl p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="font-bold text-3xl mb-1" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-white/50 text-[10px]">{stat.label}</p>
              <p className="text-white/30 text-[9px]">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Almond DNA Section */}
        <div className="mb-6">
          <p className="text-[#e67e22] uppercase text-xs font-bold tracking-widest mb-3">
            {"🧬"} YOUR ALMOND DNA
          </p>
          
          <div className="space-y-3">
            {[
              { icon: "🦴", label: "Bone Health", value: USER_STATS.almondDNA.bone },
              { icon: "💪", label: "Muscle Recovery", value: USER_STATS.almondDNA.muscle },
              { icon: "❤️", label: "Heart Health", value: USER_STATS.almondDNA.heart },
              { icon: "🧘", label: "Calm Nerves", value: USER_STATS.almondDNA.calm }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-lg w-6">{item.icon}</span>
                <span className="text-white/70 text-xs w-28">{item.label}</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                    className="h-full bg-[#e67e22] rounded-full"
                  />
                </div>
                <span className="text-white/50 text-xs w-8">{item.value}%</span>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-4 flex justify-center"
          >
            <span className="bg-[#e67e22] text-white text-xs font-bold px-4 py-1.5 rounded-full">
              {"💪"} {"You're a " + USER_STATS.personalityType + "!"}
            </span>
          </motion.div>
        </div>

        {/* Match History */}
        <div className="mb-6">
          <p className="text-[#e67e22] uppercase text-xs font-bold tracking-widest mb-3">
            {"📋"} MATCH HISTORY
          </p>
          
          <div className="space-y-2">
            {USER_STATS.matchHistory.map((match, index) => (
              <motion.div
                key={match.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className={`bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 border-l-[3px] ${
                  match.missed ? "border-l-[#c0392b]" : "border-l-[#27ae60]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${
                    match.missed ? "bg-[#c0392b]/20" : "bg-white/10"
                  }`}>
                    <span className="text-white font-bold text-xs">{match.date.split(" ")[0]}</span>
                    <span className="text-white/50 text-[10px]">{match.date.split(" ")[1]}</span>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">{match.teams}</p>
                    {match.missed ? (
                      <p className="text-[#c0392b]/70 text-xs">{"Missed — you could've been a winner!"}</p>
                    ) : (
                      <p className="text-white/50 text-xs">
                        {match.collected}/4 collected • Rank #{match.rank} • {match.time}
                      </p>
                    )}
                  </div>
                  
                  <div className="relative w-8 h-8">
                    <svg className="w-8 h-8 transform -rotate-90">
                      <circle
                        className="stroke-white/10"
                        fill="transparent"
                        strokeWidth={2}
                        r={12}
                        cx={16}
                        cy={16}
                      />
                      <circle
                        className={match.missed ? "stroke-white/20" : "stroke-[#e67e22]"}
                        fill="transparent"
                        strokeWidth={2}
                        strokeLinecap="round"
                        r={12}
                        cx={16}
                        cy={16}
                        strokeDasharray={75.4}
                        strokeDashoffset={75.4 - (75.4 * (match.collected || 0)) / 4}
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Shareable Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="relative rounded-2xl overflow-hidden mb-4"
        >
          {/* Premium gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b2a] via-[#1a5276] to-[#0d1b2a]" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4a017]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#e67e22]/10 rounded-full blur-2xl" />
          
          <div className="relative p-6 text-center">
            <CaliforniaAlmondsLogo small />
            
            <p className="text-white font-bold uppercase text-sm tracking-widest mt-4 mb-2">
              MY IPL 2026 ALMOND SEASON
            </p>
            
            <div className="w-16 h-px bg-[#d4a017] mx-auto mb-4" />
            
            <div className="space-y-3 mb-4">
              <div>
                <span className="text-[#e67e22] font-bold text-2xl">{USER_STATS.matchesPlayed} Matches</span>
                <span className="text-white/50 text-xs block">Played</span>
              </div>
              <div>
                <span className="text-[#d4a017] font-bold text-2xl">{USER_STATS.almondsCollected} Almonds</span>
                <span className="text-white/50 text-xs block">Collected</span>
              </div>
              <div>
                <span className="text-[#27ae60] font-bold text-2xl">#{USER_STATS.bestRank}</span>
                <span className="text-white/50 text-xs block">Best Rank</span>
              </div>
              <div>
                <span className="text-white font-bold">{"💪"} {USER_STATS.personalityType}</span>
              </div>
            </div>
            
            <div className="w-16 h-px bg-[#d4a017] mx-auto mb-4" />
            
            <p className="text-[#e67e22] italic text-sm mb-2">
              Dekha, Badaam Khaane Ke Faayeda!
            </p>
            <p className="text-white/40 text-[10px]">california almonds x IPL 2026</p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="w-full bg-[#27ae60] text-white font-bold py-3 rounded-full text-sm flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share Your Season Card
        </motion.button>
      </div>

      {/* Share toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 bg-[#27ae60] text-white text-sm text-center py-3 rounded-xl z-50"
          >
            {"Card saved! Share it on your story 🎉"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Main App
export default function CaliforniaAlmondsIPL() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash")
  const [collectedBenefits, setCollectedBenefits] = useState<string[]>([])

  const handleCollectBenefit = (id: string) => {
    setCollectedBenefits(prev => [...prev, id])
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "I collected all California Almonds benefits!",
        text: "Join the IPL 2026 California Almonds campaign and win Finals tickets!",
        url: window.location.href
      })
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const handlePlayAgain = () => {
    setCollectedBenefits([])
    setCurrentScreen("game")
  }

  return (
    <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center p-4">
      {/* Phone frame for desktop */}
      <div className="w-full max-w-[390px] h-[844px] bg-black rounded-[40px] overflow-hidden shadow-2xl shadow-black/50 relative">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-50" />
        
        {/* Screen content */}
        <div className="h-full overflow-hidden">
          <AnimatePresence mode="wait">
            {currentScreen === "splash" && (
              <motion.div
                key="splash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -100 }}
                className="h-full"
              >
                <SplashScreen onStart={() => setCurrentScreen("otp")} />
              </motion.div>
            )}

            {currentScreen === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="h-full"
              >
                <OTPScreen 
                  onBack={() => setCurrentScreen("splash")}
                  onVerify={() => setCurrentScreen("game")}
                />
              </motion.div>
            )}

            {currentScreen === "game" && (
              <motion.div
                key="game"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="h-full"
              >
                <GameScreen
                  collectedBenefits={collectedBenefits}
                  onCollectBenefit={handleCollectBenefit}
                  onComplete={() => setCurrentScreen("prize")}
                  onViewCollection={() => setCurrentScreen("collection")}
                  onViewLeaderboard={() => setCurrentScreen("leaderboard")}
                />
              </motion.div>
            )}

            {currentScreen === "prize" && (
              <motion.div
                key="prize"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <PrizeScreen 
                  onShare={handleShare}
                  onPlayAgain={handlePlayAgain}
                  onViewLeaderboard={() => setCurrentScreen("leaderboard")}
                  onViewCalendar={() => setCurrentScreen("calendar")}
                  onViewStats={() => setCurrentScreen("stats")}
                />
              </motion.div>
            )}

            {currentScreen === "collection" && (
              <motion.div
                key="collection"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="h-full"
              >
                <CollectionScreen
                  collectedBenefits={collectedBenefits}
                  onBack={() => setCurrentScreen("game")}
                />
              </motion.div>
            )}

            {currentScreen === "leaderboard" && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="h-full"
              >
                <LeaderboardScreen
                  onBack={() => setCurrentScreen("prize")}
                  onPlayAgain={handlePlayAgain}
                  onViewCalendar={() => setCurrentScreen("calendar")}
                />
              </motion.div>
            )}

            {currentScreen === "calendar" && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="h-full"
              >
                <CalendarScreen
                  onBack={() => setCurrentScreen("prize")}
                  onPlayNow={() => setCurrentScreen("game")}
                  onViewStats={() => setCurrentScreen("stats")}
                />
              </motion.div>
            )}

            {currentScreen === "stats" && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="h-full"
              >
                <StatsScreen
                  onBack={() => setCurrentScreen("prize")}
                  onShare={handleShare}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
