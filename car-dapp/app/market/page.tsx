"use client";
import Link from "next/link";
import { LoginSection } from "../../components/LoginSection";
import { useCars } from "../../hooks/useCars";

export default function MarketPage() {
  const { cars, isLoading } = useCars(); // 不傳參數 = 抓取所有 isListed=true 的車

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Link href="/" className="font-bold text-xl text-gray-900 hover:text-blue-600 transition">
                    Sui Used Car
                </Link>
                <span className="text-gray-300">/</span>
                <span className="font-medium text-gray-600">二手車市場</span>
            </div>
            <LoginSection />
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">全網車輛列表</h1>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                出售中: {cars.length}
            </span>
        </div>
        
        {isLoading ? (
            <div className="flex justify-center p-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        ) : cars.length === 0 ? (
            <div className="text-center p-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-lg">目前市場上沒有車輛出售</p>
                <p className="text-sm text-gray-400 mt-2">快去「我的車庫」上架第一台車吧！</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cars.map((car) => (
                    // 🔴 整張卡片可點擊
                    <Link key={car.id} href={`/car/${car.id}`} className="block group">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                            {/* 圖片區 */}
                            <div className="h-56 w-full bg-gray-100 relative overflow-hidden">
                                {car.imageUrl ? (
                                    <img 
                                        src={car.imageUrl} 
                                        alt={car.model} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        onError={(e) => e.currentTarget.src = "https://placehold.co/600x400?text=No+Image"}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
                                        <span className="text-sm">無圖片</span>
                                    </div>
                                )}
                                
                                {/* 價格標籤 */}
                                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-bold text-gray-900 shadow-md border border-gray-100">
                                    {car.price ? (
                                        <span className="text-green-600">
                                            {/* 假設 price 是 MIST，轉換為 SUI (除以 10^9) */}
                                            {/* 這裡簡單顯示，如果有小數點需求可再處理 */}
                                            {(Number(car.price) / 1_000_000_000).toLocaleString()} SUI
                                        </span>
                                    ) : (
                                        <span className="text-blue-500">議價中</span>
                                    )}
                                </div>
                            </div>

                            {/* 資訊區 */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">
                                    {car.brand} {car.model}
                                </h3>
                                
                                {/* 車主資訊 */}
                                <div className="flex items-center gap-2 mb-4 mt-1">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                                        Owner
                                    </div>
                                    <p className="text-xs text-gray-500 font-mono truncate">
                                        {car.owner ? `${car.owner.slice(0,6)}...${car.owner.slice(-4)}` : "Unknown"}
                                    </p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                                    <div className="text-gray-500">
                                        <span className="block text-xs text-gray-400">里程數</span>
                                        <span className="font-semibold text-gray-700">{Number(car.mileage).toLocaleString()} km</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xs text-gray-400">年份</span>
                                        <span className="font-mono text-gray-600">{car.year}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}