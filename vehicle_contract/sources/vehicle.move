module vehicle_contract::vehicle {
    use std::string::{Self, String};
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::table::{Self, Table};
    use sui::display;
    use sui::package;
    use sui::dynamic_object_field as dof;

    // --- 錯誤碼 ---
    const E_INVALID_VIN_LENGTH: u64 = 1;
    const E_NOT_AUTHORIZED: u64 = 2;    // 權限不足或被撤銷
    const E_MILEAGE_ROLLBACK: u64 = 3;
    const E_VIN_ALREADY_EXISTS: u64 = 4;

    // --- 核心結構 ---

    public struct VEHICLE has drop {}

    // 1. 管理員權限
    public struct AdminCap has key, store { id: UID }

    // 2. 第三方權限憑證 (Owned Object)
    public struct ThirdPartyCap has key, store {
        id: UID,
        org_type: u8, // 1=Service, 2=Insurance
        name: String,
        // 這裡不存 is_revoked，因為 Admin 改不到這裡
    }

    // 3. 權限註冊表 (Shared Object - 用於 Admin 管理權限)
    public struct AuthRegistry has key {
        id: UID,
        // 記錄哪些 Cap ID 是有效的 (ID -> bool)
        permissions: Table<ID, bool>
    }

    // 4. 車輛註冊表 (Shared Object - 用於前端展示)
    public struct CarRegistry has key {
        id: UID,
        cars: Table<String, ID>, // VIN -> ID
        all_ids: vector<ID>      // 所有的車輛 ID
    }

    // 5. 車輛 NFT
    public struct CarNFT has key, store {
        id: UID,
        vin: String,
        brand: String,
        model: String,
        year: u16,
        image_url: String,
        initial_mileage: u64,
        current_mileage: u64,
        passport: DigitalPassport 
    }

    #[allow(lint(missing_key))]
    public struct DigitalPassport has store {
        id: UID, // 用於掛載 Dynamic Fields
        record_count: u64
    }

    // 紀錄物件 (子物件)
    public struct Record has key, store {
        id: UID,
        record_type: u8,
        provider: String,
        description: String,
        mileage: u64,
        timestamp: u64,
        attachments: vector<String> // 支援多檔案
    }

    // --- 事件 ---
    public struct CarMinted has copy, drop {
        car_id: ID,
        vin: String,
        creator: address
    }

    public struct RecordAdded has copy, drop {
        car_id: ID,
        record_type: u8,
        provider: String
    }

    public struct ThirdPartyStatusChanged has copy, drop {
        cap_id: ID,
        is_active: bool
    }

    // --- 初始化 ---
    fun init(otw: VEHICLE, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        let publisher = package::claim(otw, ctx);

        // 設定 Display
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
            string::utf8(b"link"),
            string::utf8(b"project_url"),
        ];
        let values = vector[
            string::utf8(b"{brand} {model} ({year})"),
            string::utf8(b"VIN: {vin} | Mileage: {current_mileage} km"),
            string::utf8(b"{image_url}"),
            string::utf8(b"https://sui-car-demo.vercel.app/car/{id}"), // 之後換成你的網域
            string::utf8(b"https://sui-car-demo.vercel.app"),
        ];
        let mut display = display::new_with_fields<CarNFT>(
            &publisher, keys, values, ctx
        );
        display::update_version(&mut display);

        // 創建權限註冊表 (Shared)
        transfer::share_object(AuthRegistry {
            id: object::new(ctx),
            permissions: table::new(ctx)
        });

        // 創建車輛註冊表 (Shared)
        transfer::share_object(CarRegistry {
            id: object::new(ctx),
            cars: table::new(ctx),
            all_ids: vector::empty()
        });

        transfer::public_transfer(publisher, sender);
        transfer::public_transfer(display, sender);
        transfer::public_transfer(AdminCap { id: object::new(ctx) }, sender);
    }

    // --- 核心功能 ---

    // 1. 授權第三方 (Admin Only)
    public fun grant_third_party(
        _admin: &AdminCap,
        auth_registry: &mut AuthRegistry,   // 需傳入權限表
        org_type: u8,
        name: String,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let id = object::new(ctx);
        let cap_id = object::uid_to_inner(&id);

        let cap = ThirdPartyCap {
            id,
            org_type,
            name
        };

        // 在註冊表中登記為 true (有效)
        table::add(&mut auth_registry.permissions, cap_id, true);
        transfer::public_transfer(cap, recipient);
        event::emit(ThirdPartyStatusChanged { cap_id, is_active: true });
    }

    // 2. 撤銷第三方 (Admin Only)
    public fun revoke_third_party(
        _admin: &AdminCap,
        auth_registry: &mut AuthRegistry,
        target_cap_id: ID   // 只要知道 ID 就能撤銷，不需要拿到物件
    ) {
        if (table::contains(&auth_registry.permissions, target_cap_id)) {
            let status = table::borrow_mut(&mut auth_registry.permissions, target_cap_id);
            *status = false;    // 設為無效
        };
        event::emit(ThirdPartyStatusChanged { cap_id: target_cap_id, is_active: false });
    }

    // 3. 鑄造車輛 (User)
    #[allow(lint(self_transfer))]
    public fun mint_car(
        car_registry: &mut CarRegistry, // 需傳入車輛表
        vin: String,
        brand: String,
        model: String,
        year: u16,
        image_url: String,
        initial_mileage: u64,
        ctx: &mut TxContext
    ) {
        assert!(string::length(&vin) == 17, E_INVALID_VIN_LENGTH);
        assert!(!table::contains(&car_registry.cars, vin), E_VIN_ALREADY_EXISTS);

        let id = object::new(ctx);
        let car_id = object::uid_to_inner(&id);
        let sender = tx_context::sender(ctx);

        let passport = DigitalPassport {
            id: object::new(ctx),
            record_count: 0
        };

        let car = CarNFT {
            id,
            vin: vin, 
            brand,
            model,
            year,
            image_url,
            initial_mileage,
            current_mileage: initial_mileage,
            passport
        };

        // 註冊到全局表
        table::add(&mut car_registry.cars, vin, car_id);
        vector::push_back(&mut car_registry.all_ids, car_id);

        event::emit(CarMinted { car_id, vin, creator: sender });
        transfer::public_transfer(car, sender);
    }

    // 4. 增加紀錄 (ThirdParty)
    public fun add_record(
        cap: &ThirdPartyCap,
        auth_registry: &AuthRegistry,   // 需傳入權限表進行檢查
        car: &mut CarNFT,
        record_type: u8,
        description: String,
        new_mileage: u64,
        attachments: vector<String>, // 🔴 修改：支援多檔案
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // 檢查 1: Cap 是否在註冊表中
        let cap_id = object::id(cap);
        assert!(table::contains(&auth_registry.permissions, cap_id), E_NOT_AUTHORIZED);
        
        // 檢查 2: 狀態是否為 true (未被撤銷)
        let is_active = *table::borrow(&auth_registry.permissions, cap_id);
        assert!(is_active == true, E_NOT_AUTHORIZED);

        // 檢查 3: 防調表
        assert!(new_mileage >= car.current_mileage, E_MILEAGE_ROLLBACK);

        car.current_mileage = new_mileage;

        let record = Record {
            id: object::new(ctx),
            record_type,
            provider: cap.name,
            description,
            mileage: new_mileage,
            timestamp: clock::timestamp_ms(clock),
            attachments // 存入 Vector，容許多個檔案
        };

        let count = car.passport.record_count;
        dof::add(&mut car.passport.id, count, record);
        car.passport.record_count = car.passport.record_count + 1;

        event::emit(RecordAdded {
            car_id: object::id(car),
            record_type,
            provider: cap.name
        });
    }
}