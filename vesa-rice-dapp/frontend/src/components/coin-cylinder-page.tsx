"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import SearchInput from "./SearchInput"

const mockCoins = [
  { logoUrl: "/logos/rise.png", name: "RISE Chain", symbol: "RISE", price: "1.25" },
  { logoUrl: "/logos/bitcoin.png", name: "Bitcoin", symbol: "BTC", price: "68,123.45" },
  { logoUrl: "/logos/ethereum.png", name: "Ethereum", symbol: "ETH", price: "3,789.10" },
  { logoUrl: "/logos/solana.png", name: "Solana", symbol: "SOL", price: "165.70" },
  { logoUrl: "/logos/chainlink.png", name: "Chainlink", symbol: "LINK", price: "17.55" },
  { logoUrl: "/logos/cardano.png", name: "Cardano", symbol: "ADA", price: "0.45" },
]

export default function CoinCylinderPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()

      if (isScrolling) return

      setIsScrolling(true)

      if (e.deltaY > 0) {
        // Scroll down - next coin
        setActiveIndex((prev) => (prev + 1) % mockCoins.length)
      } else {
        // Scroll up - previous coin
        setActiveIndex((prev) => (prev - 1 + mockCoins.length) % mockCoins.length)
      }

      // Debounce scrolling
      setTimeout(() => setIsScrolling(false), 300)
    }

    window.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      window.removeEventListener("wheel", handleWheel)
    }
  }, [isScrolling])

  const getCoinTransform = (index: number) => {
    const diff = index - activeIndex
    const rotateX = diff * 60 // 60 degrees per step
    const translateZ = Math.abs(diff) > 2 ? -400 : -200 // Push far items back
    const scale = Math.abs(diff) === 0 ? 1 : Math.abs(diff) === 1 ? 0.7 : 0.4
    const opacity = Math.abs(diff) > 2 ? 0 : Math.abs(diff) === 0 ? 1 : Math.abs(diff) === 1 ? 0.6 : 0.3

    return {
      rotateX,
      translateZ,
      scale,
      opacity,
      y: diff * 120, // Vertical spacing
    }
  }

  const handleCoinClick = (coin: (typeof mockCoins)[0]) => {
    router.push(`/coin?symbol=${coin.symbol}&name=${encodeURIComponent(coin.name)}&price=${coin.price}`)
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        <SearchInput coins={mockCoins} onCoinSelect={setActiveIndex} />
      </div>

      {/* 3D Container */}
      <div
        className="relative h-screen flex items-center justify-center"
        style={{
          perspective: "1000px",
          perspectiveOrigin: "center center",
        }}
      >
        <div
          className="relative"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(-10deg)",
          }}
        >
          <AnimatePresence>
            {mockCoins.map((coin, index) => {
              const transform = getCoinTransform(index)
              const isActive = index === activeIndex

              return (
                <motion.div
                  key={`${coin.symbol}-${index}`}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    rotateX: transform.rotateX,
                    translateZ: transform.translateZ,
                    scale: transform.scale,
                    opacity: transform.opacity,
                    y: transform.y,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div
                    className={`
                    bg-neutral-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8
                    ${isActive ? "w-96 h-48" : "w-80 h-40"}
                    flex items-center gap-6 transition-all duration-300 cursor-pointer
                    ${isActive ? "shadow-2xl shadow-white/10 hover:shadow-white/20" : "shadow-lg shadow-black/50 hover:shadow-white/5"}
                    hover:border-gray-600/70
                  `}
                    onClick={() => handleCoinClick(coin)}
                  >
                    <div className="ml-4 mt-2 flex items-center gap-6 w-full">
                      {/* Coin Logo */}
                      <div
                        className={`
                        rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center
                        ${isActive ? "w-20 h-20" : "w-16 h-16"}
                      `}
                      >
                        <img
                          src={`/abstract-geometric-shapes.png?height=40&width=40&query=${coin.name} cryptocurrency logo`}
                          alt={`${coin.name} logo`}
                          className={`${isActive ? "w-10 h-10" : "w-8 h-8"} rounded-full`}
                        />
                      </div>

                      {/* Coin Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-bold ${isActive ? "text-white text-2xl" : "text-neutral-400 text-xl"}`}>
                            {coin.name}
                          </h3>
                          <span className={`${isActive ? "text-white text-lg" : "text-neutral-400 text-base"}`}>
                            ({coin.symbol})
                          </span>
                        </div>
                        <div
                          className={`font-mono font-bold ${isActive ? "text-3xl text-white" : "text-2xl text-neutral-400"}`}
                        >
                          ${coin.price}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Indicators */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        {mockCoins.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${index === activeIndex ? "bg-white scale-125" : "bg-neutral-600 hover:bg-white/30"}
            `}
          />
        ))}
      </div>

      {/* Scroll Hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <div className="text-neutral-400 text-sm mb-2">Scroll to navigate • Click to view details</div>
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-gray-400 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>
      </div>
    </div>
  )
}
