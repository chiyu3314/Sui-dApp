import { useSuiClient } from "@mysten/dapp-kit";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);

  // 避免同時多次 refetch 造成競態
  const inFlightRef = useRef(false);

  const refetch = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsLoading(true);

    try {
      // 1) 讀取 CarRegistry
      const registryObj = await suiClient.getObject({
        id: CAR_REGISTRY_ID,
        options: { showContent: true },
      });

      const content = registryObj.data?.content as any;
      const allIds = (content?.fields?.all_ids as string[]) || [];

      if (allIds.length === 0) {
        setCars([]);
        return;
      }

      // 2) 讀取所有車輛
      const carObjects = await suiClient.multiGetObjects({
        ids: allIds,
        options: { showContent: true, showDisplay: true },
      });

      // 3) 整理資料
      const loadedCars = carObjects
        .map((obj) => {
          const fields = (obj.data?.content as any)?.fields;
          const display = obj.data?.display?.data;
          if (!fields) return null;

          let rawImg = display?.image_url || display?.url || fields?.image_url || fields?.url;
          if (typeof rawImg === "object") rawImg = undefined;

          const price =
            fields.price !== null && fields.price !== undefined ? fields.price : null;

          return {
            id: obj.data?.objectId,
            owner: fields.owner,
            vin: fields.vin,
            brand: fields.brand,
            model: fields.model,
            year: fields.year,
            mileage: fields.current_mileage,
            imageUrl: getImageUrl(rawImg),
            isListed: fields.is_listed,
            price,
          };
        })
        .filter((c) => c !== null);

      // 4) 過濾邏輯
      if (ownerFilter) {
        const target = normalizeSuiAddress(ownerFilter);
        setCars(loadedCars.filter((c) => normalizeSuiAddress(c.owner) === target));
      } else {
        setCars(loadedCars.filter((c) => c.isListed === true));
      }
    } catch (e) {
      console.error("Fetch cars failed:", e);
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  }, [suiClient, ownerFilter]);

  // 初次載入抓一次
  useEffect(() => {
    refetch();
  }, [refetch]);

  // ✅ 建議：市場頁不要自動每 5 秒刷（會跟 SCAN 打架，且浪費 RPC）
  // 如果你真的要輪詢，建議改成 15~30 秒並且只在 market 用，或做成可選
  //
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     refetch();
  //   }, 15000);
  //   return () => clearInterval(interval);
  // }, [refetch]);

  return { cars, isLoading, refetch };
}
