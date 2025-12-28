"use client";

import { useSuiClient } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LoginSection } from "../../components/LoginSection";
import { EVENT_THIRD_PARTY_GRANTED, EVENT_THIRD_PARTY_REVOKED } from "../../constants";

type Partner = {
    id: string; // Cap ID
    name: string;
    type: "Service" | "Insurance";
    address: string;
    status: "Active" | "Revoked";
    grantedAt: number; // timestamp
};

export default function PartnersPage() {
  const suiClient = useSuiClient();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
        try {
            // 1. 查詢所有授權事件
            const grantedEvents = await suiClient.queryEvents({
                query: { MoveEventType: EVENT_THIRD_PARTY_GRANTED }
            });

            // 2. 查詢所有撤銷事件
            const revokedEvents = await suiClient.queryEvents({
                query: { MoveEventType: EVENT_THIRD_PARTY_REVOKED }
            });

            // 建立撤銷清單 (Set 為了快速查找)
            const revokedIds = new Set(
                revokedEvents.data.map(e => (e.parsedJson as any).cap_id)
            );

            // 3. 組裝資料
            const partnerList: Partner[] = grantedEvents.data.map(e => {
                const data = e.parsedJson as any;
                return {
                    id: data.cap_id,
                    name: data.name,
                    type: Number(data.org_type) === 1 ? "Service" : "Insurance",
                    address: data.recipient,
                    status: revokedIds.has(data.cap_id) ? "Revoked" : "Active",
                    grantedAt: Number(e.timestampMs)
                };
            });

            // 排序：最新的在上面
            partnerList.sort((a, b) => b.grantedAt - a.grantedAt);
            setPartners(partnerList);

        } catch (e) {
            console.error("Fetch partners failed:", e);
        } finally {
            setIsLoading(false);
        }
    };

    fetchPartners();
  }, [suiClient]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Link href="/" className="font-bold text-xl text-gray-900 hover:text-blue-600 transition">
                    Sui Used Car
                </Link>
                <span className="text-gray-300">/</span>
                <span className="font-medium text-gray-600">合作夥伴清單</span>
            </div>
            <LoginSection />
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">認證機構一覽</h1>
            <p className="text-gray-500 mt-2">
                這裡列出了所有經由管理員授權的第三方保養廠與保險公司。
                所有的履歷紀錄都源自於這些受信任的機構。
            </p>
        </div>

        {isLoading ? (
            <div className="flex justify-center p-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        ) : partners.length === 0 ? (
            <div className="text-center p-20 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">目前沒有任何合作夥伴</p>
            </div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">機構名稱</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">類型</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">狀態</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">憑證 ID / 地址</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {partners.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        p.type === "Service" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                                    }`}>
                                        {p.type === "Service" ? "🔧 保養廠" : "🛡️ 保險公司"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {p.status === "Active" ? (
                                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span> 有效
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-500 text-sm font-medium">
                                            <span className="w-2 h-2 rounded-full bg-red-500"></span> 已撤銷
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                    <div>Cap: {p.id.slice(0, 6)}...{p.id.slice(-4)}</div>
                                    <div>Addr: {p.address.slice(0, 6)}...{p.address.slice(-4)}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}