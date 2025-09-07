
import React from 'react';
import { CrescentLogo, WalletIcon } from './icons';

const navLinks = ["Home", "Pricing", "Roadmap"];

const Header: React.FC = () => {
  const [walletaddr, setWalletaddr] = React.useState("")
  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <nav className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center">
            <CrescentLogo />
          </div>

          {/* Navigation Links */}
          <div className="lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2 bg-black/30 backdrop-blur-md rounded-full border border-white/10 h-12 px-4">
            {navLinks.map((link) => (
              <a 
                key={link} 
                href={link === "Roadmap" ? "#roadmap" : "#"}
                className={`flex items-center gap-2 text-sm font-medium transition-colors rounded-full px-4 py-2 ${
                  link === "Home" 
                    ? "text-black bg-white" 
                    : "text-[#B0B0B0] hover:text-white"
                }`}
              >
                {link}
              </a>
            ))}
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center gap-6">
            <button className="text-white hover:text-gray-300 transition-colors" aria-label="Connect Wallet" onClick={async ()=> { 
              const eth = (window as any).ethereum
              if (eth) {
                try {
                    const accounts = await eth.request({ method: 'eth_requestAccounts' });
                    setWalletaddr(accounts[0])
                } catch (error) {
                    console.error('Error connecting to wallet:', error);
                    alert('Error connecting to wallet. Please make sure you have a web3 wallet installed and unlocked.');
                }
            } else {
                alert('Web3 wallet not found. Please install a wallet like MetaMask.');
            }
            }}>
              <WalletIcon />
              {walletaddr}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
