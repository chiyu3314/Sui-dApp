"use client";

import { useUserAuth } from "../hooks/useUserAuth";
import { ConnectButton } from "@mysten/dapp-kit";

export function LandingLogin() {
  const { login } = useUserAuth();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#050b14]">
      
      {/* 背景特效 */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(6,224,249,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,224,249,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none z-0"></div>
      <div className="fixed inset-0 z-50 pointer-events-none scanline"></div>

      {/* 漂浮卡片 */}
      <div className="animate-float w-full max-w-[480px] z-10 px-4">
        <div className="relative overflow-hidden rounded-lg bg-[#0a161f]/90 border-2 border-[#06e0f9] cyber-glow backdrop-blur-md p-1">
            
            {/* 內部裝飾框 */}
            <div className="flex flex-col items-center justify-center px-6 py-12 rounded border border-white/10 bg-gradient-to-b from-white/5 to-transparent relative">
                
                {/* 角落裝飾 */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#06e0f9]"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[#06e0f9]"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[#06e0f9]"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#06e0f9]"></div>

                {/* Logo 區 */}
                <div className="mb-10 flex flex-col items-center gap-4 text-center">
                    <div className="flex items-center justify-center p-4 rounded-full border-2 border-[#06e0f9] bg-[#06e0f9]/20 shadow-[0_0_15px_rgba(6,224,249,0.5)]">
                        <span className="text-[#29B6F6]">
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className="w-12 h-12"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M19.35 18.5a9 9 0 1 0-14.7 0" 
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 11.25v.008h.008V11.25H12Z" 
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M14.835 8.165 12 11.25" 
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M9 18h6" 
    />
  </svg>
</span>
                    </div>
                    <div className="space-y-2">
<h1 className="font-['Press_Start_2P',_cursive] text-2xl sm:text-3xl text-[#06e0f9] cyber-glow-text leading-tight uppercase tracking-wider">
    CYBER<br/>PROTOCOL
</h1>
<p className="text-[#29B6F6]/80 text-[10px] tracking-[0.2em] font-bold uppercase border-l-4 border-[#06e0f9] pl-2 py-1 inline-block bg-[#06e0f9]/5">
    {/* 推薦使用這個標語，非常有科技感 */}
    STATUS: SYSTEM_LINK_ESTABLISHED
</p>
                    </div>
                </div>

                {/* 按鈕區 */}
                <div className="w-full flex flex-col gap-5">
                    
                    {/* 1. Sui Wallet (使用官方按鈕但套用我們的 CSS Class) */}
                    <div className="w-full cyber-connect-btn">
                        <ConnectButton connectText="CONNECT SUI WALLET" />
                    </div>

                    {/* 分隔線 */}
                    <div className="relative flex items-center py-1">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-4 text-[#29B6F6]/60 text-[10px] font-['Press_Start_2P',_cursive] uppercase tracking-widest">- OR -</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    {/* 2. Google Login (自訂按鈕) */}
                    <button 
                        onClick={login}
                        className="flex w-full cursor-pointer items-center justify-center rounded-sm bg-white h-14 px-4 text-[#1f1f1f] transition-all hover:bg-gray-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 group"
                    >
                        <div className="flex items-center gap-3">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-bold tracking-wide font-sans uppercase">Sign in with Google</span>
                        </div>
                    </button>
                </div>

                {/* 底部文字 */}
                <div className="mt-8 text-center">
                    <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-mono">
                        Secure connection via zkLogin
                    </p>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}