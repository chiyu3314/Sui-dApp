// 1. 合約 Package ID
export const PACKAGE_ID = "0xa2c2ab4d47b4132e4fb54c26ac862648efed9d61718b18d2ab2238cc024be2d3";

// 2. 模組名稱
export const MODULE_NAME = "vehicle";

// 3. Shared Objects
export const CAR_REGISTRY_ID = "0x6738cb52fff894ae25f0cb58b9433501559f0314ad683f881a5bfaa7265292a2";
export const AUTH_REGISTRY_ID = "0x48f4065ec8b5490ab6969541c7a599d95426595f9b94f434f3e79827bfd5f504";

// 4. AdminCap (Owned Object)
export const ADMIN_CAP_ID = "0x7b8b0a3f321a570c747c07ff123f98a18b105dab7ea555ce9ad012d995b7918a";

// 5. 物件類型 (用於權限檢查 Hook)
export const ADMIN_CAP_TYPE = `${PACKAGE_ID}::${MODULE_NAME}::AdminCap`;
export const THIRD_PARTY_CAP_TYPE = `${PACKAGE_ID}::${MODULE_NAME}::ThirdPartyCap`;

// 6. 事件類型 (用於製作 "合作夥伴清單" 頁面)
export const EVENT_THIRD_PARTY_GRANTED = `${PACKAGE_ID}::${MODULE_NAME}::ThirdPartyGranted`;
export const EVENT_THIRD_PARTY_REVOKED = `${PACKAGE_ID}::${MODULE_NAME}::ThirdPartyRevoked`;

// RPC 節點
export const SUI_RPC_URL = "https://fullnode.testnet.sui.io:443";