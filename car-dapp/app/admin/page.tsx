"use client";

import { useState } from "react";
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, MODULE_NAME, AUTH_REGISTRY_ID, ADMIN_CAP_ID } from "../../constants";
import { ConnectButton } from "@mysten/dapp-kit";
import Link from "next/link";

export default function AdminPage() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const [recipient, setRecipient] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("1"); // 1=Service, 2=Insurance
  const [revokeCapId, setRevokeCapId] = useState("");

  const handleGrant = async () => {
    if (!account) return alert("請先連接管理員錢包");
    if (!name || !recipient) return alert("請填寫完整資訊");

    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::grant_third_party`,
      arguments: [
        tx.object(ADMIN_CAP_ID),
        tx.object(AUTH_REGISTRY_ID), // 🔴 傳入權限表
        tx.pure.u8(Number(role)),
        tx.pure.string(name),
        tx.pure.address(recipient),
      ],
    });

    signAndExecute({ transaction: tx }, {
        onSuccess: (res) => {
            alert(`授權成功! Digest: ${res.digest}`);
            setRecipient("");
            setName("");
        },
        onError: (err) => alert(`失敗: ${err.message}`)
    });
  };

  const handleRevoke = async () => {
    if (!account) return alert("請先連接管理員錢包");
    if (!revokeCapId) return alert("請輸入 Cap ID");

    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::revoke_third_party`,
      arguments: [
        tx.object(ADMIN_CAP_ID),
        tx.object(AUTH_REGISTRY_ID),
        tx.pure.id(revokeCapId)
      ],
    });

    signAndExecute({ transaction: tx }, {
        onSuccess: (res) => {
            alert(`撤銷成功! Digest: ${res.digest}`);
            setRevokeCapId("");
        },
        onError: (err) => alert(`失敗: ${err.message}`)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-900">← 回首頁</Link>
            <h1 className="text-2xl font-bold text-gray-900">管理員後台</h1>
          </div>
          <ConnectButton />
        </div>

        {/* 只有指定錢包能操作 (可選) */}
        <div className="grid md:grid-cols-2 gap-8">
            {/* 發放權限 */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                <h2 className="text-lg font-bold mb-4 text-gray-800">✅ 發放權限 (Grant)</h2>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">機構名稱</label>
                        <input className="border p-2 w-full rounded" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Toyota 新竹廠" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">角色類型</label>
                        <select className="border p-2 w-full rounded" value={role} onChange={e => setRole(e.target.value)}>
                            <option value="1">🔧 保養廠 (Service)</option>
                            <option value="2">🛡️ 保險公司 (Insurance)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">接收者地址</label>
                        <input className="border p-2 w-full rounded font-mono text-sm" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="0x..." />
                    </div>
                    <button onClick={handleGrant} className="bg-black text-white p-3 rounded hover:bg-gray-800 transition font-medium">
                        發放憑證
                    </button>
                </div>
            </div>

            {/* 撤銷權限 */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                <h2 className="text-lg font-bold mb-4 text-gray-800">🚫 撤銷權限 (Revoke)</h2>
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-gray-500">
                        輸入要撤銷的 ThirdPartyCap ID。撤銷後，該憑證將立即失效，無法再寫入紀錄。
                    </p>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Target Cap ID</label>
                        <input className="border p-2 w-full rounded font-mono text-sm" value={revokeCapId} onChange={e => setRevokeCapId(e.target.value)} placeholder="0x..." />
                    </div>
                    <button onClick={handleRevoke} className="bg-red-50 text-red-600 border border-red-200 p-3 rounded hover:bg-red-100 transition font-medium">
                        立即撤銷
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}