"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEnokiFlow } from "@mysten/enoki/react";
import { EnokiClient } from "@mysten/enoki";
import { fromB64 } from "@mysten/sui/utils";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { computeZkLoginAddressFromSeed } from "@mysten/sui/zklogin";

function getIssFromJwt(jwt: string): string {
    try {
        const payload = JSON.parse(atob(jwt.split('.')[1]));
        return payload.iss;
    } catch (e) { return ""; }
}

export default function AuthPage() {
  const router = useRouter();
  const flow = useEnokiFlow();
  const [status, setStatus] = useState("Google Login...");

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isProcessing = false;

    const processLogin = async () => {
        if (isProcessing) return;
        isProcessing = true;

        if (!window.location.hash) return;

        try {
            console.log("SDK verification...");
            
            // 1. SDK 處理回調
            // @ts-ignore
            await flow.handleAuthCallback();
            
            // 2. 抓取 Session
            let session = await (flow as any).getSession();
            let retries = 0;
            while ((!session || !session.jwt) && retries < 5) {
                await new Promise(r => setTimeout(r, 500));
                session = await (flow as any).getSession();
                retries++;
            }

            if (session && session.jwt && session.ephemeralKeyPair) {
                setStatus("Get the on-chain address...");
                
                // 在這裡生成 ZKP 並算出真實地址 (Address B)
                try {
                    const enokiClient = new EnokiClient({
                        apiKey: process.env.NEXT_PUBLIC_ENOKI_PUBLIC_KEY!
                    });

                    const keypairBytes = fromB64(session.ephemeralKeyPair);
                    const keypair = Ed25519Keypair.fromSecretKey(keypairBytes);
                    const pubKey = keypair.getPublicKey();

                    console.log("正在生成 ZK Proof 以鎖定地址...");
                    const zkp = await enokiClient.createZkLoginZkp({
                        jwt: session.jwt,
                        ephemeralPublicKey: pubKey,
                        maxEpoch: session.maxEpoch,
                        randomness: session.randomness,
                        network: "testnet"
                    });

                    // 算出地址 B
                    const trueAddress = computeZkLoginAddressFromSeed(BigInt(zkp.addressSeed), getIssFromJwt(session.jwt));
                    console.log("真實地址計算完成:", trueAddress);

                    // 將正確地址寫入 Session 物件
                    session.address = trueAddress;

                } catch (calcError) {
                    console.error("Address calculation failed (using the default address):", calcError);
                    // 如果計算失敗，我們還是存 session，避免卡死，但在 Console 留紀錄
                }

                // 3. 存入 LocalStorage
                window.localStorage.setItem("demo_zk_session", JSON.stringify(session));
                
                setStatus("Login successful!");
                setTimeout(() => {
                    window.location.href = "/";
                }, 500);
            } else {
                throw new Error("Unable to retrieve session data");
            }

        } catch (e) {
            console.error(e);
            setStatus("Login failed: " + (e as Error).message);
        }
    };

    if (flow) {
        processLogin();
    }
  }, [flow, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <h2 className="text-xl font-bold mb-4">{status}</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
      </div>
    </div>
  );
}