import { useSuiClient } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import { CAR_REGISTRY_ID } from "../constants";

const WALRUS_AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space/v1/blobs";

function getImageUrl(rawUrl: any) {
    if (!rawUrl) return null;
    const urlStr = String(rawUrl);
    if (urlStr.startsWith("http")) return urlStr;
    return `${WALRUS_AGGREGATOR}/${urlStr}`;
}

export function useCars(ownerFilter?: string) {
  const suiClient = useSuiClient();
  const [cars, setCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        // 1. 讀取 CarRegistry
        const registryObj = await suiClient.getObject({
            id: CAR_REGISTRY_ID,
            options: { showContent: true }
        });

        const content = registryObj.data?.content as any;
        const allIds = content?.fields?.all_ids as string[] || [];

        if (allIds.length === 0) {
            setCars([]);
            setIsLoading(false);
            return;
        }

        // 2. 讀取所有車輛
        const carObjects = await suiClient.multiGetObjects({
            ids: allIds,
            options: { showContent: true, showDisplay: true }
        });

        // 3. 整理資料
        const loadedCars = carObjects.map(obj => {
            const fields = (obj.data?.content as any)?.fields;
            const display = obj.data?.display?.data;
            if (!fields) return null;

            let rawImg = display?.image_url || display?.url || fields?.image_url || fields?.url;
            if (typeof rawImg === 'object') rawImg = undefined;

            // 處理 Price Option (Sui Move Option 在 JSON 裡可能是 null 或 { fields: { vec: [...] } })
            // 但通常透過 RPC 讀取時，如果是 u64 Option:
            // 有值: fields.price (number)
            // 沒值: null
            let price = null;
            if (fields.price !== null && fields.price !== undefined) {
                price = fields.price;
            }

            return {
                id: obj.data?.objectId,
                owner: fields.owner, 
                vin: fields.vin,
                brand: fields.brand,
                model: fields.model,
                year: fields.year,
                mileage: fields.current_mileage,
                imageUrl: getImageUrl(rawImg),
                isListed: fields.is_listed, // 這是 boolean
                price: price
            };
        }).filter(c => c !== null);

        // 4. 過濾邏輯
        if (ownerFilter) {
            // A. 我的車庫：只看 Owner
            const target = normalizeSuiAddress(ownerFilter);
            const myCars = loadedCars.filter(c => normalizeSuiAddress(c.owner) === target);
            setCars(myCars);
        } else {
            // B. 二手市場：嚴格過濾 isListed === true
            // 🔴 關鍵：這裡會把剛鑄造(預設 false)的車濾掉
            const marketCars = loadedCars.filter(c => c.isListed === true);
            setCars(marketCars);
        }

      } catch (e) {
        console.error("Fetch cars failed:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCars();
    const interval = setInterval(fetchCars, 5000);
    return () => clearInterval(interval);

  }, [suiClient, ownerFilter]);

  return { cars, isLoading };
}