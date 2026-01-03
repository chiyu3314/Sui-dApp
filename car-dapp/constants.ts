// 1. 合約 Package ID
export const PACKAGE_ID = "0xde51d4bb052944099242ce4fb2fad764405c3777f938001b6fee5915815e0109";

// 2. 模組名稱
export const MODULE_NAME = "vehicle";

// 3. Shared Objects
export const CAR_REGISTRY_ID = "0xd5d20c88044ae9e4df843c816427870afd8b1a193f501d617c612d923b9b621a";
export const AUTH_REGISTRY_ID = "0x5d7996a1067ac06dc5c8def4a7eb809bdd3f09b9732bf0047c0160a1f4d98c16";

// 4. AdminCap (Owned Object)
export const ADMIN_CAP_ID = "0xcd54f5f0bcda8727d98eafad99cc4d75598a253e672c5dbca4987554be969449";

// 5. 物件類型 (用於權限檢查 Hook)
export const ADMIN_CAP_TYPE = `${PACKAGE_ID}::${MODULE_NAME}::AdminCap`;
export const THIRD_PARTY_CAP_TYPE = `${PACKAGE_ID}::${MODULE_NAME}::ThirdPartyCap`;

// 6. 事件類型 (用於製作 "合作夥伴清單" 頁面)
export const EVENT_THIRD_PARTY_GRANTED = `${PACKAGE_ID}::${MODULE_NAME}::ThirdPartyGranted`;
export const EVENT_THIRD_PARTY_REVOKED = `${PACKAGE_ID}::${MODULE_NAME}::ThirdPartyRevoked`;

// RPC 節點
export const SUI_RPC_URL = "https://fullnode.testnet.sui.io:443";