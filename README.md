# Vibicle

### Decentralized Vehicle History Passport on Sui

**Vibicle** bridges the gap between Web2 usability and Web3 immutability. It creates a transparent, tamper-proof digital passport for vehicles, allowing owners, service centers, and insurance providers to collaborate on a single source of truth without friction.

![Sui](https://img.shields.io/badge/Sui-Move-4EA8DE?style=for-the-badge&logo=sui&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Walrus](https://img.shields.io/badge/Storage-Walrus-orange?style=for-the-badge)

---

## Key Features

### 1. Frictionless UX (Web2.5 Experience)
*   **Invisible Wallet (zkLogin)**: Users onboard instantly using their Google accounts. No seed phrases, no wallets to install. Powered by **Enoki**.
*   **Gasless Operations**: All transactions are sponsored via **Shinami Gas Station**, removing the barrier of acquiring gas tokens for end-users.

### 2. Robust Architecture
*   **Shared Object Model**: Unlike traditional NFTs, Vibicle utilizes Sui's **Shared Objects** to enable multi-party collaboration (Owners, Mechanics, Insurers) on a single asset without transferring ownership.
*   **Dynamic Fields**: Vehicle history (maintenance logs, accident reports) and comments are attached as dynamic fields, ensuring scalability and cost-efficiency.

### 3. Decentralized Infrastructure
*   **Immutable Storage**: All vehicle imagery and documentation are stored on **Walrus**, a decentralized blob storage network, ensuring data persistence and censorship resistance.
*   **Role-Based Access Control (RBAC)**: On-chain authority management ensures only verified Service Centers and Insurance Providers can append specific records.

---

## Tech Stack

*   **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
*   **Smart Contract**: Sui Move
*   **Authentication**: Mysten Labs Enoki (zkLogin)
*   **Relayer/Sponsor**: Shinami Gas Station
*   **Storage**: Walrus (HTTP Aggregator)

---

## Contract Deployment (Sui Testnet)

*   **Package ID**: `0xa2c2ab4d47b4132e4fb54c26ac862648efed9d61718b18d2ab2238cc024be2d3`
*   **Car Registry**: `0x6738cb52fff894ae25f0cb58b9433501559f0314ad683f881a5bfaa7265292a2`
*   **Auth Registry**: `0x48f4065ec8b5490ab6969541c7a599d95426595f9b94f434f3e79827bfd5f504`
