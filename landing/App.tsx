
import React from 'react';
import Header from './components/Header';
import { ArrowRightIcon, CortexIcon, QuantIcon, AelfIcon, MeetonIcon } from './components/icons';
import InteractiveHeadline from './components/InteractiveHeadline';

const DataNode = ({ icon, title, value, className }: { icon: React.ReactNode, title: string, value: string, className: string }) => (
  <div className={`absolute flex items-center gap-3 ${className}`}>
    <div className="flex items-center justify-center w-8 h-8 bg-white/5 rounded-full border border-white/10">
      {icon}
    </div>
    <div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-[#B0B0B0]">{value}</p>
    </div>
  </div>
);

const RoadmapItem = ({ quarter, title, isLast = false }: { quarter: string, title: string, isLast?: boolean }) => (
  <div className="relative pl-10 pb-16">
    {/* Vertical line connecting dots */}
    {!isLast && <div className="absolute top-2 left-1.5 w-px h-full bg-white/10"></div>}
    
    {/* Dot on the timeline */}
    <div className="absolute top-2 left-0 w-4 h-4 rounded-full bg-black border-2 border-white/20 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
    </div>
    
    {/* Content */}
    <div>
      <p className="text-sm font-semibold text-white/60">{quarter}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{title}</h3>
    </div>
  </div>
);


const App: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0A0A0A] text-white p-4 md:p-8 flex items-center justify-center">
      {/* Main container with rounded corners */}
      <div className="relative w-full max-w-[1400px] h-full min-h-[90vh] bg-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-white/5">
        
        {/* Atmospheric Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-white/5 rounded-full filter blur-[200px] opacity-40"></div>
        <div className="absolute bottom-[-20%] right-[-15%] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full filter blur-[200px] opacity-20"></div>

        {/* Star particle background */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, #fff 0.5px, transparent 0.5px), radial-gradient(circle at 80% 70%, #fff 0.5px, transparent 0.5px), radial-gradient(circle at 50% 90%, #fff 0.5px, transparent 0.5px), radial-gradient(circle at 10% 80%, #fff 0.5px, transparent 0.5px), radial-gradient(circle at 90% 20%, #fff 0.5px, transparent 0.5px)',
          backgroundSize: '300px 300px',
        }}></div>
        
        {/* Vertical light trails */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 flex justify-around">
          <div className="w-px h-full bg-gradient-to-t from-white/10 to-transparent filter blur-[1px]"></div>
          <div className="w-px h-full bg-gradient-to-t from-white/10 to-transparent filter blur-[1px] opacity-60 self-end h-3/4"></div>
          <div className="w-px h-full bg-gradient-to-t from-white/10 to-transparent filter blur-[1px]"></div>
        </div>

        <div className="relative flex flex-col">
          <Header />

          {/* Hero Section */}
          <main className="relative flex flex-1 flex-col items-center justify-center text-center px-4 pt-48 pb-24 min-h-[90vh]">
            
            {/* Data Visualization Lines (SVG) */}
            <svg width="100%" height="100%" className="absolute inset-0 opacity-20">
              <path d="M 200 150 C 400 150, 400 300, 600 300" stroke="white" fill="transparent" strokeWidth="1"/>
              <path d="M 200 450 C 400 450, 400 300, 600 300" stroke="white" fill="transparent" strokeWidth="1"/>
              <path d="M 1200 180 C 1000 180, 1000 300, 800 300" stroke="white" fill="transparent" strokeWidth="1"/>
              <path d="M 1200 520 C 1000 520, 1000 300, 800 300" stroke="white" fill="transparent" strokeWidth="1"/>
            </svg>

            {/* Data Nodes */}
            <DataNode icon={<CortexIcon />} title="Cortex" value="20.945" className="top-[15%] left-[10%]" />
            <DataNode icon={<AelfIcon />} title="AI" value="19.346" className="bottom-[25%] left-[8%]" />
            <DataNode icon={<QuantIcon />} title="Quant" value="2.945" className="top-[20%] right-[12%]" />
            <DataNode icon={<MeetonIcon />} title="ZK Proof Data" value="440" className="bottom-[30%] right-[15%]" />

            <div className="relative flex flex-col items-center gap-6 max-w-3xl">
              <a href="#roadmap" className="flex items-center gap-2 text-sm bg-white/5 border border-white/10 rounded-full px-4 py-1.5 hover:bg-white/10 transition-colors">
                re u ready for future? <ArrowRightIcon />
              </a>
              
              <InteractiveHeadline />

              <p className="text-lg md:text-xl text-[#B0B0B0] max-w-2xl">
                Dive into the art of assets, where innovative blockchain technology meets financial expertise.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg shadow-lg shadow-white/20 hover:scale-105 transition-transform duration-300"
                onClick={async ()=>{ 
                  const eth = (window as any).ethereum
                  if (eth == null) { 
                    alert("Web3 wallet is required")
                  }
                  const accounts = await eth.request({ method: 'eth_requestAccounts' });
                  // rise app'i ac
                  location.replace("http://localhost:3000")
                }}
                >
                  Open App <ArrowRightIcon className="stroke-black"/>
                </button>
                <button className="px-6 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors duration-300">
                  Discover More
                </button>
              </div>
            </div>
          </main>
          
          {/* Roadmap Section */}
          <section id="roadmap" className="w-full max-w-4xl mx-auto px-4 py-16 md:py-24">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mb-16">
              Roadmap
            </h2>
            <div>
              <RoadmapItem quarter="Q1 2026" title="MOBILE APP" isLast={true} />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default App;
