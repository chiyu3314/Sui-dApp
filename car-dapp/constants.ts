// 1. 合約 Package ID
export const PACKAGE_ID = "0xcb9f991b8eab545a37d1c2003b0b609c057a0a06a72ccde19ce38402cac263b7";

// 2. 模組名稱
export const MODULE_NAME = "vehicle";

// 3. Shared Objects
export const CAR_REGISTRY_ID = "0xee8f4bc07a997a4f73d40be04f602585ba851b740d011d8dc7ea708f13da3b8a";
export const AUTH_REGISTRY_ID = "0xf904b8ea543bf87c1c524ef82abceeab2956c6b9c8ac8f75fb51a889756c2114";

// 4. AdminCap (Owned Object)
export const ADMIN_CAP_ID = "0x1f190080ee17b57802651fc16403bc3bd529a3028d85d491fcaa7de9a3750cab";

// 5. 物件類型 (用於權限檢查 Hook)
export const ADMIN_CAP_TYPE = `${PACKAGE_ID}::${MODULE_NAME}::AdminCap`;
export const THIRD_PARTY_CAP_TYPE = `${PACKAGE_ID}::${MODULE_NAME}::ThirdPartyCap`;

// 6. 事件類型 (用於製作 "合作夥伴清單" 頁面)
export const EVENT_THIRD_PARTY_GRANTED = `${PACKAGE_ID}::${MODULE_NAME}::ThirdPartyGranted`;
export const EVENT_THIRD_PARTY_REVOKED = `${PACKAGE_ID}::${MODULE_NAME}::ThirdPartyRevoked`;

// RPC 節點
export const SUI_RPC_URL = "https://fullnode.testnet.sui.io:443";