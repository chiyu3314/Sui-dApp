"use client";

import { useSuiClient } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LoginSection } from "../../../components/LoginSection";

const WALRUS_AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space/v1/blobs";

// 網址清洗 (處理直接存網址 vs 存 BlobID 的情況)
function getImageUrl(rawUrl: any) {
    if (!rawUrl) return null;
    const urlStr = String(rawUrl);
    if (urlStr.startsWith("http")) return urlStr;
    return `${WALRUS_AGGREGATOR}/${urlStr}`;
}

type RecordData = {
    id: string;
    type: number; // 1=Service, 2=Insurance
    provider: string;
    description: string;
    mileage: number;
    timestamp: number;
    attachments: string[];
};

export default function CarDetailPage() {
  // 1. 取得網址上的 id 參數
  const params = useParams();
  const carId = params.id as string;
  
  const suiClient = useSuiClient();
  const [car, setCar] = useState<any>(null);
  const [records, setRecords] = useState<RecordData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!carId) return;
      
      try {
        console.log("正在查詢車輛:", carId);

        // A. 抓取車輛基本資料 (CarNFT)
        const carObj = await suiClient.getObject({
            id: carId,
            options: { showContent: true, showDisplay: true }
        });

        if (carObj.error || !carObj.data) throw new Error("車輛不存在");

        const fields = (carObj.data?.content as any)?.fields;
        const display = carObj.data?.display?.data;
        
        let rawImg = display?.image_url || display?.url || fields?.image_url;
        if (typeof rawImg === 'object') rawImg = undefined;

        // 護照 ID (藏在 fields.passport.fields.id.id)
        // 注意：Sui Move 的 UID 在 JSON 裡通常是 { id: "0x..." }
        const passportId = fields.passport?.fields?.id?.id;

        setCar({
            id: carId,
            vin: fields.vin,
            brand: fields.brand,
            model: fields.model,
            year: fields.year,
            mileage: fields.current_mileage,
            owner: fields.owner, // 合約新加的 owner 欄位
            imageUrl: getImageUrl(rawImg),
            passportId: passportId
        });

        // B. 抓取履歷紀錄 (從 Passport ID 抓 Dynamic Fields)
        if (passportId) {
            console.log("找到護照 ID:", passportId, "正在讀取紀錄...");
            
            // 1. 取得護照下掛載的所有 Dynamic Fields (即 Record 的指標)
            const dfRes = await suiClient.getDynamicFields({ parentId: passportId });
            const recordIds = dfRes.data.map(df => df.objectId);

            if (recordIds.length > 0) {
                // 2. 批次讀取這些 Record 物件的詳細內容
                const recordsObjs = await suiClient.multiGetObjects({
                    ids: recordIds,
                    options: { showContent: true }
                });

                const parsedRecords = recordsObjs.map((r) => {
                    const rf = (r.data?.content as any)?.fields;
                    if (!rf) return null;

                    // 處理附件 (Vector<String>)
                    const attachments = rf.attachments || [];
                    
                    return {
                        id: r.data?.objectId,
                        type: Number(rf.record_type),
                        provider: rf.provider,
                        description: rf.description,
                        mileage: Number(rf.mileage),
                        timestamp: Number(rf.timestamp),
                        // 將附件 Blob ID 轉為可顯示的 URL
                        attachments: attachments.map((a: string) => getImageUrl(a))
                    };
                }).filter(r => r !== null) as RecordData[];

                // 依照時間倒序排列 (最新的在最上面)
                parsedRecords.sort((a, b) => b.timestamp - a.timestamp);
                setRecords(parsedRecords);
            }
        }

      } catch (e) {
        console.error("Fetch details failed:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [carId, suiClient]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500">正在讀取鏈上履歷...</p>
    </div>
  );

  if (!car) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">找不到車輛</h1>
        <Link href="/" className="text-blue-600 hover:underline">返回首頁</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 頂部導航 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Link href="/" className="text-gray-500 hover:text-gray-900 transition flex items-center gap-1">
                    ← 返回
                </Link>
                <span className="text-gray-300">|</span>
                <h1 className="font-bold text-lg text-gray-800">車輛履歷詳情</h1>
            </div>
            <LoginSection />
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        
        {/* 1. 車輛基本資料卡片 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8 flex flex-col md:flex-row">
            {/* 左側圖片 */}
            <div className="w-full md:w-2/5 h-64 md:h-auto bg-gray-100 relative group">
                {car.imageUrl ? (
                    <img src={car.imageUrl} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">無圖片</div>
                )}
            </div>
            
            {/* 右側資訊 */}
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-3xl font-bold text-gray-900">{car.brand} {car.model}</h2>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-mono">
                            {car.year}
                        </span>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-semibold">VIN (車身號碼)</p>
                            <p className="text-lg font-mono text-gray-800">{car.vin}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-semibold">當前車主</p>
                            <p className="text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded break-all">
                                {car.owner}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-semibold">目前里程數</p>
                            <p className="text-2xl font-bold text-blue-600 font-mono">
                                {Number(car.mileage).toLocaleString()} <span className="text-sm font-normal text-gray-500">km</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 2. 履歷時間軸 */}
        <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                📋 履歷紀錄 
                <span className="text-sm font-normal text-white bg-gray-400 px-2 py-0.5 rounded-full">{records.length}</span>
            </h3>
        </div>

        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {records.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 relative z-10">
                    <p className="text-gray-400">此車輛尚無任何維修或事故紀錄</p>
                    <p className="text-sm text-gray-300 mt-1">紀錄將存儲於區塊鏈上，不可篡改</p>
                </div>
            ) : (
                records.map((rec, index) => (
                    <div key={rec.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* 中間的時間點 */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-blue-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            {rec.type === 1 ? '🔧' : '🚨'}
                        </div>
                        
                        {/* 卡片內容 */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-2">
                                <div>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-1 ${
                                        rec.type === 1 ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                                    }`}>
                                        {rec.type === 1 ? "定期保養" : "事故/理賠"}
                                    </span>
                                    <h4 className="font-bold text-gray-800">{rec.provider}</h4>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-400">{new Date(rec.timestamp).toLocaleDateString()}</div>
                                    <div className="text-sm font-mono font-bold text-gray-600">{rec.mileage.toLocaleString()} km</div>
                                </div>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-4 whitespace-pre-wrap leading-relaxed">
                                {rec.description}
                            </p>

                            {/* 附件圖片區 (Lightbox 效果可之後加，目前先做連結) */}
                            {rec.attachments && rec.attachments.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-400 mb-2 font-semibold">附件證明 ({rec.attachments.length})</p>
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                                        {rec.attachments.map((url, i) => (
                                            <a key={i} href={url} target="_blank" rel="noreferrer" className="block w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border hover:ring-2 ring-blue-500 transition relative">
                                                <img src={url} className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}