"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CoinDef } from "./coin-cylinder-page"

// Mock data for the coin
const coinData = {
  name: "RISE Chain",
  symbol: "RISE",
  price: "$0.0234",
  dailyReturn: "+12.45%",
  isPositive: true,
  logo: "/rise-chain-cryptocurrency-logo.jpg",
  aiSignal: "BUY",
  signalTimestamp: "2024-01-15 14:30:22 UTC",
}

// Mock active orders
const activeOrders = [
  { type: "Buy", price: "$0.0230", amount: "1,000 RISE" },
  { type: "Sell", price: "$0.0240", amount: "500 RISE" },
]

export default function SingleCoinPage(coin: CoinDef) {
  const [activeTab, setActiveTab] = useState<"leverage" | "stock">("leverage")
  const [selectedLeverage, setSelectedLeverage] = useState("10x")

  const leverageOptions = ["2x", "5x", "10x", "20x"]

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Row - Coin Info and AI Signal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Coin Identity Block */}
          <div className="flex items-start gap-4">
            <img
              src={coinData.logo || "/placeholder.svg"}
              alt={`${coinData.name} logo`}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{coinData.name}</h1>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xl font-semibold text-white">{coinData.price}</span>
                <span className={`text-base font-medium ${coinData.isPositive ? "text-green-500" : "text-red-500"}`}>
                  {coinData.dailyReturn}
                </span>
              </div>
            </div>
          </div>

          {/* AI Signal Card */}
          <Card className="bg-black border border-gray-800 p-4">
            <h2 className="text-xs font-semibold text-gray-400 mb-3 tracking-wider">AI SIGNAL</h2>
            <div className="text-xl font-bold text-green-500 mb-2">{coinData.aiSignal}</div>
            <p className="text-xs text-gray-500">Signal timestamp: {coinData.signalTimestamp}</p>
          </Card>
        </div>

        {/* Bottom Row - Trading Terminal and Active Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trading Terminal */}
          <Card className="bg-black border border-gray-800 p-4">
            {/* Tabs */}
            <div className="flex border-b border-gray-800 mb-4">
              <button
                onClick={() => setActiveTab("leverage")}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "leverage"
                    ? "border-white text-white"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                Leverage
              </button>
              <button
                onClick={() => setActiveTab("stock")}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "stock"
                    ? "border-white text-white"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                Stock
              </button>
            </div>

            {/* Conditional Content */}
            {activeTab === "leverage" ? (
              <div className="space-y-4">
                {/* Leverage Selector */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Leverage</h3>
                  <div className="flex gap-2">
                    {leverageOptions.map((option) => (
                      <Button
                        key={option}
                        variant={selectedLeverage === option ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedLeverage(option)}
                        className={`${
                          selectedLeverage === option
                            ? "bg-white text-black hover:bg-gray-200"
                            : "bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                        }`}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Market Sentiment Bar */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Market Sentiment</h3>
                  <div className="flex h-10 rounded overflow-hidden">
                    <div className="bg-green-600 flex-[46.33] flex items-center justify-center text-white font-medium text-sm">
                      B 46.33%
                    </div>
                    <div className="bg-red-600 flex-[53.67] flex items-center justify-center text-white font-medium text-sm">
                      S 53.67%
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2">Buy</Button>
                  <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2">Sell</Button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">Spot trading is currently in development.</p>
              </div>
            )}
          </Card>

          {/* Active Orders Section */}
          <div>
            <h2 className="text-base font-semibold text-white mb-3">Active Order(s)</h2>
            <Card className="bg-black border border-gray-800">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Price</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeOrders.map((order, index) => (
                      <tr key={index} className="border-b border-gray-800 last:border-b-0">
                        <td
                          className={`py-3 px-4 font-medium ${
                            order.type === "Buy" ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {order.type}
                        </td>
                        <td className="py-3 px-4 text-white">{order.price}</td>
                        <td className="py-3 px-4 text-gray-300">{order.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
