"use client";

import { useState } from "react";
import Link from "next/link";

import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

import { fromB64, toB64 } from "@mysten/sui/utils";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { getZkLoginSignature, computeZkLoginAddressFromSeed } from "@mysten/sui/zklogin";
import { SuiClient } from "@mysten/sui/client";

import { LoginSection } from "../../components/LoginSection";
import { useUserAuth } from "../../hooks/useUserAuth";
// 若你有做角色判斷（建議），可打開：
// import { useCapabilities } from "../../hooks/useCapabilities";

import { PACKAGE_ID, MODULE_NAME, AUTH_REGISTRY_ID, ADMIN_CAP_ID } from "../../constants";

const SUI_RPC_URL = "https://fullnode.testnet.sui.io:443";

function getIssFromJwt(jwt: string) {
  try {
    return JSON.parse(atob(jwt.split(".")[1])).iss;
  } catch {
    return "";
  }
}

export default function AdminPage() {
  const { user } = useUserAuth();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // 若你有角色判斷（建議），可打開：
  // const { isAdmin } = useCapabilities();

  const [recipient, setRecipient] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("1"); // 1=Service, 2=Insurance
  const [revokeCapId, setRevokeCapId] = useState("");

  const [busy, setBusy] = useState(false);

  // ---- 共用：執行交易（支援 zkLogin sponsor / 일반錢包） ----
  async function executeTx(tx: Transaction) {
    if (!user) {
      alert("請先登入");
      return;
    }

    // zkLogin：走 sponsor + zkLogin signature
    if (user.type === "zklogin") {
      const session = (user as any).session;
      if (!session) throw new Error("Session Invalid");

      const keypairBytes = fromB64(session.ephemeralKeyPair);
      const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(keypairBytes);
      const pubKey = ephemeralKeyPair.getPublicKey();

      // 1) 取得 ZKP inputs（你專案既有 /api/zkp）
      const zkpResponse = await fetch("/api/zkp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jwt: session.jwt,
          ephemeralPublicKey: pubKey.toBase64(),
          maxEpoch: session.maxEpoch,
          randomness: session.randomness,
          network: "testnet",
        }),
      });
      const zkp = await zkpResponse.json();

      // 2) 計算真實 sender（非常重要）
      const sender = computeZkLoginAddressFromSeed(
        BigInt(zkp.addressSeed),
        getIssFromJwt(session.jwt)
      );

      tx.setSender(sender);

      // 3) 只 build kind bytes，交給 sponsor
      const sponsorClient = new SuiClient({ url: SUI_RPC_URL });
      const txBytes = await tx.build({ client: sponsorClient, onlyTransactionKind: true });

      const sponsorRes = await fetch("/api/sponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionBlockKindBytes: toB64(txBytes),
          sender,
        }),
      });
      const sponsoredData = await sponsorRes.json();

      // 4) 使用 ephemeral key 簽 sponsored tx
      const sponsoredTx = Transaction.from(fromB64(sponsoredData.bytes));
      const { signature: userSignature } = await sponsoredTx.sign({
        client: sponsorClient,
        signer: ephemeralKeyPair,
      });

      // 5) 組 zkLogin signature
      const zkSignature = getZkLoginSignature({
        inputs: { ...zkp, addressSeed: zkp.addressSeed },
        maxEpoch: session.maxEpoch,
        userSignature,
      });

      // 6) 送出：zkSignature + sponsor signature
      const result = await sponsorClient.executeTransactionBlock({
        transactionBlock: sponsoredData.bytes,
        signature: [zkSignature, sponsoredData.signature],
        options: { showEffects: true },
      });

      return { digest: result.digest };
    }

    // 一般錢包：用 dapp-kit signAndExecute
    tx.setSender(user.address);

    return await new Promise<{ digest: string }>((resolve, reject) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (res) => resolve({ digest: res.digest }),
          onError: (err) => reject(err),
        }
      );
    });
  }

  const handleGrant = async () => {
    try {
      if (!user) return alert("請先登入");
      if (!name || !recipient) return alert("請填寫完整資訊");

      setBusy(true);

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::grant_third_party`,
        arguments: [
          tx.object(ADMIN_CAP_ID),
          tx.object(AUTH_REGISTRY_ID),
          tx.pure.u8(Number(role)),
          tx.pure.string(name),
          tx.pure.address(recipient),
        ],
      });

      const res = await executeTx(tx);
      alert(`授權成功! Digest: ${res?.digest}`);
      setRecipient("");
      setName("");
    } catch (e: any) {
      alert(`失敗: ${e?.message ?? String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async () => {
    try {
      if (!user) return alert("請先登入");
      if (!revokeCapId) return alert("請輸入 Cap ID");

      setBusy(true);

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::revoke_third_party`,
        arguments: [
          tx.object(ADMIN_CAP_ID),
          tx.object(AUTH_REGISTRY_ID),
          tx.pure.id(revokeCapId),
        ],
      });

      const res = await executeTx(tx);
      alert(`撤銷成功! Digest: ${res?.digest}`);
      setRevokeCapId("");
    } catch (e: any) {
      alert(`失敗: ${e?.message ?? String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-white font-display overflow-x-hidden relative selection:bg-[#00E5FF] selection:text-black">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#112236_1px,transparent_1px),linear-gradient(to_bottom,#112236_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.2))] bg-[size:100%_4px] opacity-15 pointer-events-none z-50"></div>

      {/* Header：改成 LoginSection（跟其他頁一致） */}
      <header className="w-full border-b-2 border-[#00E5FF]/30 bg-[#050b14]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="size-8 text-[#06e0f9] animate-pulse flex items-center justify-center">
                <span className="text-3xl">⇦</span>
              </div>
              <h2 className="text-[#06e0f9] text-sm md:text-base font-['Press_Start_2P',_cursive] leading-tight tracking-widest group-hover:text-white transition-all">
                Home
              </h2>
            </Link>
          </div>

          {/* ✅ 統一登入/登出 UI */}
          <LoginSection />
        </div>
      </header>

      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12">
        {/* 未登入提示 */}
        {!user && (
          <div className="mb-8 p-4 bg-[#0a1625] border border-[#21464a] text-gray-400 font-mono text-sm">
            請先登入後再進行管理員操作。
          </div>
        )}

        {/* 若你有 isAdmin guard，可加上：
            {user && !isAdmin && (
              <div className="mb-8 p-4 bg-[#0a1625] border border-[#ff003c]/40 text-[#ff003c] font-mono text-sm">
                你沒有管理員權限。
              </div>
            )}
        */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左側：授權面板 */}
          <section className="bg-[#0a1625] border border-[#00E5FF]/30 p-8 shadow-[0_0_15px_rgba(0,229,255,0.15),inset_0_0_15px_rgba(0,229,255,0.05)] relative overflow-hidden group">
            <h3 className="font-['Press_Start_2P',_cursive] text-[#00ff41] text-sm mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00ff41] rounded-full animate-pulse shadow-[0_0_8px_#00ff41]"></span>
              GRANT_ACCESS
            </h3>

            <div className="space-y-6 relative z-10">
              <div>
                <label className="block text-xs text-[#29B6F6] font-bold tracking-widest uppercase mb-2">
                  Organization Name
                </label>
                <input
                  className="w-full bg-[#050b14] border border-[#112236] text-white px-4 py-3 focus:outline-none focus:border-[#00E5FF] focus:shadow-[0_0_10px_rgba(0,229,255,0.3)] transition-all font-mono text-sm"
                  placeholder="e.g. Toyota Taipei"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs text-[#29B6F6] font-bold tracking-widest uppercase mb-2">
                  Role Type
                </label>
                <select
                  className="w-full bg-[#050b14] border border-[#112236] text-white px-4 py-3 focus:outline-none focus:border-[#00E5FF] transition-all font-mono text-sm appearance-none cursor-pointer hover:border-[#29B6F6]"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="1">SERVICE (保養廠)</option>
                  <option value="2">INSURANCE (保險公司)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#29B6F6] font-bold tracking-widest uppercase mb-2">
                  Wallet Address
                </label>
                <input
                  className="w-full bg-[#050b14] border border-[#112236] text-white px-4 py-3 focus:outline-none focus:border-[#00E5FF] focus:shadow-[0_0_10px_rgba(0,229,255,0.3)] transition-all font-mono text-sm"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>

              <button
                onClick={handleGrant}
                disabled={!user || busy}
                className="w-full bg-[#00E5FF]/10 border border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF] hover:text-black font-bold py-4 px-6 rounded-none text-xs font-['Press_Start_2P',_cursive] transition-all duration-300 shadow-[0_0_10px_rgba(0,229,255,0.1)] hover:shadow-[0_0_20px_rgba(0,229,255,0.6)] mt-4 disabled:opacity-50"
              >
                {busy ? "PROCESSING..." : "EXECUTE_GRANT_PROTOCOL"}
              </button>
            </div>
          </section>

          {/* 右側：撤銷面板 */}
          <section className="bg-[#0a1625] border border-[#ff003c]/30 p-8 shadow-[0_0_15px_rgba(255,0,60,0.15),inset_0_0_15px_rgba(255,0,60,0.05)] relative overflow-hidden group">


            <h3 className="font-['Press_Start_2P',_cursive] text-[#ff003c] text-sm mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#ff003c] rounded-full animate-pulse shadow-[0_0_8px_#ff003c]"></span>
              REVOKE_ACCESS
            </h3>

            <div className="space-y-6 relative z-10">
              <div className="p-4 bg-[#ff003c]/10 border border-[#ff003c]/30 text-[#ff003c] text-xs font-mono mb-4">
                WARNING: This action is irreversible. The target capability will be permanently disabled.
              </div>

              <div>
                <label className="block text-xs text-[#ff003c] font-bold tracking-widest uppercase mb-2">
                  Target Cap ID
                </label>
                <input
                  className="w-full bg-[#050b14] border border-[#112236] text-white px-4 py-3 focus:outline-none focus:border-[#ff003c] focus:shadow-[0_0_10px_rgba(255,0,60,0.3)] transition-all font-mono text-sm"
                  placeholder="0x..."
                  value={revokeCapId}
                  onChange={(e) => setRevokeCapId(e.target.value)}
                />
              </div>

              <button
                onClick={handleRevoke}
                disabled={!user || busy}
                className="w-full bg-[#ff003c]/10 border border-[#ff003c] text-[#ff003c] hover:bg-[#ff003c] hover:text-white font-bold py-4 px-6 rounded-none text-xs font-['Press_Start_2P',_cursive] transition-all duration-300 shadow-[0_0_10px_rgba(255,0,60,0.1)] hover:shadow-[0_0_20px_rgba(255,0,60,0.6)] mt-auto disabled:opacity-50"
              >
                {busy ? "PROCESSING..." : "INITIATE_REVOKE_SEQUENCE"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
