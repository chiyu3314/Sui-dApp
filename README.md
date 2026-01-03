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

*   **Package ID**: `0xcb9f991b8eab545a37d1c2003b0b609c057a0a06a72ccde19ce38402cac263b7`
*   **Car Registry**: `0xee8f4bc07a997a4f73d40be04f602585ba851b740d011d8dc7ea708f13da3b8a`
*   **Auth Registry**: `0xf904b8ea543bf87c1c524ef82abceeab2956c6b9c8ac8f75fb51a889756c2114`
