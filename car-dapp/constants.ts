// 1. 合約 Package ID
export const PACKAGE_ID = "0x781ebcf6049b015b991983a0db5e1a5aaad673ad68ee18ab8f94e45a073bea4f";

// 2. 模組名稱
export const MODULE_NAME = "vehicle";

// 3. Shared Objects
export const CAR_REGISTRY_ID = "0x2167b0c857ab8d99813dec5661fafbcb175f214059ccfdf370a81d1656c38e38";
export const AUTH_REGISTRY_ID = "0x4abdbcaa3bcaea3369f216b4a442880b71aff59d8a5310337de2ace7e0b72a8a";

// 4. AdminCap (Owned Object)
export const ADMIN_CAP_ID = "0xa36089280d79521ac7778f21670287c4388459e601c668480755becbf66bfc39";

// 5. 物件類型 (用於權限檢查 Hook)
export const ADMIN_CAP_TYPE = `${PACKAGE_ID}::${MODULE_NAME}::AdminCap`;
export const THIRD_PARTY_CAP_TYPE = `${PACKAGE_ID}::${MODULE_NAME}::ThirdPartyCap`;

// 6. 事件類型 (用於製作 "合作夥伴清單" 頁面)
export const EVENT_THIRD_PARTY_GRANTED = `${PACKAGE_ID}::${MODULE_NAME}::ThirdPartyGranted`;
export const EVENT_THIRD_PARTY_REVOKED = `${PACKAGE_ID}::${MODULE_NAME}::ThirdPartyRevoked`;

// RPC 節點
export const SUI_RPC_URL = "https://fullnode.testnet.sui.io:443";