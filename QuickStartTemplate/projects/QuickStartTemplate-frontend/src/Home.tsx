// Home.tsx
// Main landing UI: shows navbar, hero text, and feature cards.
// This file only handles layout and modals — safe place to customize design.

import React, { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { AiOutlineWallet, AiOutlineSend, AiOutlineStar, AiOutlineDeploymentUnit } from 'react-icons/ai'
import { BsArrowUpRightCircle, BsWallet2, BsArrowLeftRight } from 'react-icons/bs'

// Frontend modals
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'
import NFTmint from './components/NFTmint'
import Tokenmint from './components/Tokenmint'
import TinymanSwapWidget from './components/TinymanSwapWidget'
import TinymanDashboard from './components/tinyman/TinymanDashboard'

// Smart contract demo modal (backend app calls)
import AppCalls from './components/AppCalls'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openPaymentModal, setOpenPaymentModal] = useState<boolean>(false)
  const [openMintModal, setOpenMintModal] = useState<boolean>(false)
  const [openTokenModal, setOpenTokenModal] = useState<boolean>(false)
  const [openAppCallsModal, setOpenAppCallsModal] = useState<boolean>(false)
  const [openSwapModal, setOpenSwapModal] = useState<boolean>(false)
  const [openTinymanDashboard, setOpenTinymanDashboard] = useState<boolean>(false)

  const { activeAddress } = useWallet()

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 flex flex-col">
      {/* ---------------- Navbar ---------------- */}
      <nav className="w-full bg-neutral-800 border-b border-neutral-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
          AlgoVault
        </h1>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm font-semibold text-gray-100 transition"
          onClick={() => setOpenWalletModal(true)}
        >
          <BsWallet2 className="text-lg text-cyan-400" />
          <span>{activeAddress ? 'Wallet Connected' : 'Connect Wallet'}</span>
        </button>
      </nav>

      {/* ---------------- Hero Section ---------------- */}
      <header className="text-center py-10 px-4">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500 mb-4">
          AI-Powered DeFi Vault
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          AlgoVault combines intelligent yield farming with AI-powered portfolio optimization. Stake, govern, trade, and create assets
          with natural language commands — all on the Algorand blockchain.
        </p>
      </header>

      {/* ---------------- Features Grid ---------------- */}
      <main className="flex-1 px-6 pb-12">
        {activeAddress ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Send Payment */}
            <div className="p-6 bg-neutral-800 rounded-2xl border border-neutral-700 hover:border-cyan-500 transition">
              <AiOutlineSend className="text-4xl mb-3 text-green-400" />
              <h3 className="text-lg font-semibold mb-2">Send Payment</h3>
              <p className="text-sm text-gray-400 mb-4">
                Send ALGO payments instantly with AI assistance. Try commands like "send 5 ALGO to [address]".
              </p>
              <button
                className="w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition"
                onClick={() => setOpenPaymentModal(true)}
              >
                Open
              </button>
            </div>

            {/* Mint NFT */}
            <div className="p-6 bg-neutral-800 rounded-2xl border border-neutral-700 hover:border-pink-500 transition">
              <AiOutlineStar className="text-4xl mb-3 text-pink-400" />
              <h3 className="text-lg font-semibold mb-2">Mint NFT</h3>
              <p className="text-sm text-gray-400 mb-4">
                Create unique AlgoVault NFTs with IPFS metadata. AI can help you mint with commands like "create NFT".
              </p>
              <button
                className="w-full py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold transition"
                onClick={() => setOpenMintModal(true)}
              >
                Open
              </button>
            </div>

            {/* Create Token */}
            <div className="p-6 bg-neutral-800 rounded-2xl border border-neutral-700 hover:border-purple-500 transition">
              <BsArrowUpRightCircle className="text-4xl mb-3 text-purple-400" />
              <h3 className="text-lg font-semibold mb-2">Create Token (ASA)</h3>
              <p className="text-sm text-gray-400 mb-4">
                Launch AlgoVault-branded tokens instantly. Use AI commands like "create token VaultCoin with 1M supply".
              </p>
              <button
                className="w-full py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-semibold transition"
                onClick={() => setOpenTokenModal(true)}
              >
                Open
              </button>
            </div>

            {/* Tinyman AI Dashboard */}
            <div className="p-6 bg-neutral-800 rounded-2xl border border-neutral-700 hover:border-blue-500 transition">
              <BsArrowLeftRight className="text-4xl mb-3 text-blue-400" />
              <h3 className="text-lg font-semibold mb-2">Tinyman AI Dashboard</h3>
              <p className="text-sm text-gray-400 mb-4">
                Advanced DeFi trading with AI-powered strategies, market intelligence, and automated optimization.
              </p>
              <div className="flex gap-2">
                <button
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold transition"
                  onClick={() => setOpenTinymanDashboard(true)}
                >
                  AI Dashboard
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition"
                  onClick={() => setOpenSwapModal(true)}
                >
                  Quick Swap
                </button>
              </div>
            </div>

            {/* Contract Interactions */}
            <div className="p-6 bg-neutral-800 rounded-2xl border border-neutral-700 hover:border-amber-500 transition">
              <AiOutlineDeploymentUnit className="text-4xl mb-3 text-amber-400" />
              <h3 className="text-lg font-semibold mb-2">Smart Vault Operations</h3>
              <p className="text-sm text-gray-400 mb-4">
                Access AlgoVault's DeFi protocols: staking pools, governance voting, and yield optimization strategies.
              </p>
              <button
                className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition"
                onClick={() => setOpenAppCallsModal(true)}
              >
                Open
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-12">
            <p>⚡ Connect your wallet first to unlock the features below.</p>
          </div>
        )}
      </main>

      {/* ---------------- Modals ---------------- */}
      <ConnectWallet openModal={openWalletModal} closeModal={() => setOpenWalletModal(false)} />
      <Transact openModal={openPaymentModal} setModalState={setOpenPaymentModal} />
      <NFTmint openModal={openMintModal} setModalState={setOpenMintModal} />
      <Tokenmint openModal={openTokenModal} setModalState={setOpenTokenModal} />
      <TinymanSwapWidget openModal={openSwapModal} closeModal={() => setOpenSwapModal(false)} />
      <TinymanDashboard openModal={openTinymanDashboard} closeModal={() => setOpenTinymanDashboard(false)} />
      <AppCalls openModal={openAppCallsModal} setModalState={setOpenAppCallsModal} />
    </div>
  )
}

export default Home
