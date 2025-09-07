"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search } from "lucide-react"

interface Coin {
  logoUrl: string
  name: string
  symbol: string
  price: string
}

interface SearchInputProps {
  coins: Coin[]
  onCoinSelect: (index: number) => void
}

export default function SearchInput({ coins, onCoinSelect }: SearchInputProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [filteredCoins, setFilteredCoins] = useState<{ coin: Coin; index: number }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim()) {
      const filtered = coins
        .map((coin, index) => ({ coin, index }))
        .filter(
          ({ coin }) =>
            coin.name.toLowerCase().includes(query.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(query.toLowerCase()),
        )
      setFilteredCoins(filtered)
      setIsOpen(filtered.length > 0)
    } else {
      setFilteredCoins([])
      setIsOpen(false)
    }
  }, [query, coins])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCoinSelect = (index: number) => {
    onCoinSelect(index)
    setQuery("")
    setIsOpen(false)
    inputRef.current?.blur()
  }

  return (
    <div className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a coin..."
          className="w-full pl-12 pr-4 py-3 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-500 transition-colors"
        />
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl overflow-hidden z-50"
          >
            {filteredCoins.map(({ coin, index }) => (
              <button
                key={index}
                onClick={() => handleCoinSelect(index)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-700/50 transition-colors text-left"
              >
                <img
                  src={`/abstract-geometric-shapes.png?height=32&width=32&query=${coin.name} cryptocurrency logo`}
                  alt={`${coin.name} logo`}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">{coin.name}</div>
                  <div className="text-neutral-400 text-sm">{coin.symbol}</div>
                </div>
                <div className="text-white font-mono">${coin.price}</div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
