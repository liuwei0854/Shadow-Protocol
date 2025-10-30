# Shadow Protocol

A privacy-preserving, zone-based blockchain game built with Fully Homomorphic Encryption (FHE) technology. Shadow Protocol demonstrates how encrypted computation can revolutionize on-chain gaming by allowing sensitive game state to remain private while still being verifiable and executable on-chain.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Why Shadow Protocol?](#why-shadow-protocol)
- [Technology Stack](#technology-stack)
- [Problems Solved](#problems-solved)
- [Architecture](#architecture)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Development](#development)
  - [Testing](#testing)
  - [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Smart Contract Documentation](#smart-contract-documentation)
- [Frontend Application](#frontend-application)
- [Use Cases](#use-cases)
- [Security Considerations](#security-considerations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Overview

Shadow Protocol is an innovative blockchain game that leverages Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine) to enable true privacy in on-chain gaming. Players can join one of two zones:

- **Shadow Zone**: Where player stats (health) remain encrypted and private, known only to the player
- **Public Zone**: Where player stats are publicly decryptable and visible to all

This dual-zone system showcases the power of encrypted computation, allowing game logic to execute on-chain while maintaining player privacy when desired.

## Key Features

### Privacy-Preserving Gameplay
- **Encrypted Health Values**: Player health is stored as encrypted values (euint32) using FHE
- **Selective Privacy**: Players choose between private (Shadow) and public zones
- **Dynamic Zone Switching**: Players can move between zones, with automatic access control updates

### On-Chain Verifiability
- **Transparent Logic**: All game rules execute on-chain in a trustless manner
- **Verifiable Randomness**: Health generation uses FHE-compatible random number generation
- **Immutable Records**: All player actions are permanently recorded on the blockchain

### Advanced Encryption Features
- **Homomorphic Operations**: Perform computations on encrypted data without decryption
- **Access Control Lists**: Fine-grained permission management for encrypted values
- **Public Decryptability**: Optional feature for Public zone players

### Developer-Friendly
- **Comprehensive Test Suite**: Full test coverage for both local and testnet environments
- **Type-Safe Contracts**: TypeChain integration for end-to-end type safety
- **Hardhat Integration**: Modern development environment with deployment scripts
- **React Frontend**: Full-featured web interface with wallet integration

## Why Shadow Protocol?

### The Problem with Traditional Blockchain Games

Current blockchain games face critical limitations:

1. **No Privacy**: All game state is public, eliminating strategic depth
2. **MEV Exploitation**: Transparent transactions allow front-running and manipulation
3. **Limited Game Mechanics**: Can't implement hidden information games (poker, fog of war, etc.)
4. **Trust Requirements**: Must use centralized servers for private game state

### The Shadow Protocol Solution

Shadow Protocol solves these problems by:

1. **True On-Chain Privacy**: Encrypted state enables hidden information mechanics
2. **MEV Resistance**: Encrypted transactions prevent front-running attacks
3. **Rich Game Design**: Enables complex game mechanics previously impossible on-chain
4. **Trustless Operation**: No centralized servers needed for private state

## Technology Stack

### Smart Contract Layer

| Technology | Purpose | Version |
|------------|---------|---------|
| **Solidity** | Smart contract language | ^0.8.24 |
| **FHEVM** | Fully homomorphic encryption VM | ^0.8.0 |
| **Hardhat** | Development environment | ^2.26.0 |
| **TypeChain** | TypeScript contract bindings | ^8.3.2 |
| **Ethers.js** | Ethereum library | ^6.15.0 |

### Frontend Layer

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI framework | ^19.1.1 |
| **TypeScript** | Type safety | ~5.8.3 |
| **Vite** | Build tool | ^7.1.6 |
| **wagmi** | Ethereum React hooks | ^2.17.0 |
| **RainbowKit** | Wallet connection | ^2.2.8 |
| **Zama Relayer SDK** | FHE decryption | ^0.2.0 |

### Development Tools

- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Solhint**: Solidity linting
- **Hardhat Deploy**: Deployment management
- **Hardhat Gas Reporter**: Gas optimization analysis
- **Solidity Coverage**: Test coverage reporting

## Problems Solved

### 1. Privacy in Blockchain Gaming

**Problem**: Traditional blockchain games expose all game state publicly, making it impossible to implement games with hidden information.

**Solution**: Shadow Protocol uses FHE to encrypt sensitive game state (player health) while still allowing on-chain computation. Players in the Shadow zone can keep their stats private, enabling new game mechanics.

### 2. Verifiable Randomness with Privacy

**Problem**: Generating random numbers on-chain is difficult, and using external oracles introduces trust assumptions. Combining randomness with privacy is even harder.

**Solution**: FHEVM provides cryptographically secure random number generation that produces encrypted values. Health values are generated randomly and remain encrypted, ensuring fairness without revealing the value.

### 3. Dynamic Access Control for Encrypted Data

**Problem**: Managing permissions for encrypted data is complex, especially when players move between different privacy levels.

**Solution**: Shadow Protocol implements automatic access control management. When players switch zones, the contract updates encryption permissions seamlessly, making private data public or vice versa.

### 4. Gas-Efficient Encrypted State Management

**Problem**: Homomorphic encryption operations are typically expensive, making them impractical for on-chain games.

**Solution**: Shadow Protocol uses FHEVM's optimized operations and efficient data structures (indexed arrays for zone management) to minimize gas costs while maintaining encryption.

### 5. User-Friendly Encrypted DApps

**Problem**: Interacting with encrypted data requires complex key management and decryption flows.

**Solution**: The integrated frontend uses Zama's Relayer SDK and wagmi hooks to abstract away complexity. Users can decrypt their private data with simple function calls.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React UI   │  │  RainbowKit  │  │  Wagmi Hooks │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
│                 ┌──────────▼──────────┐                     │
│                 │  Zama Relayer SDK   │                     │
│                 └─────────────────────┘                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   Ethers.js     │
                   └────────┬────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Blockchain Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           ShadowProtocol Smart Contract              │  │
│  │                                                       │  │
│  │  ┌─────────────┐         ┌─────────────┐           │  │
│  │  │ Shadow Zone │         │ Public Zone │           │  │
│  │  │  (Private)  │         │  (Public)   │           │  │
│  │  └─────────────┘         └─────────────┘           │  │
│  │         │                        │                  │  │
│  │         └────────┬───────────────┘                  │  │
│  │                  │                                   │  │
│  │         ┌────────▼────────┐                         │  │
│  │         │  Player Data    │                         │  │
│  │         │  (euint32)      │                         │  │
│  │         └─────────────────┘                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│  ┌─────────────────────────▼──────────────────────────┐   │
│  │              FHEVM (Zama Protocol)                  │   │
│  │  - Encrypted computation                            │   │
│  │  - Access control (ACL)                             │   │
│  │  - Random number generation                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Smart Contract Architecture

The `ShadowProtocol` contract implements a zone-based system:

1. **Data Structures**:
   - `PlayerData`: Stores encrypted health, zone assignment, and existence flag
   - `shadowPlayers` & `publicPlayers`: Arrays tracking players in each zone
   - Index mappings: Enable O(1) player removal from zones

2. **Core Functions**:
   - `joinShadow()`: Add player to Shadow zone with private health
   - `joinPublic()`: Add player to Public zone with public health
   - `getPlayer()`: Retrieve player data (returns encrypted health handle)
   - `getShadowPlayers()` / `getPublicPlayers()`: List all zone members

3. **Internal Logic**:
   - `_upsertPlayer()`: Handles zone transitions and permission updates
   - `_generateHealth()`: Creates random encrypted health (1-10)
   - Zone management: Efficient add/remove operations with index tracking

## How It Works

### 1. Player Registration

When a player joins a zone:

```solidity
// Player calls joinShadow() or joinPublic()
function joinShadow() external {
    _upsertPlayer(msg.sender, Zone.Shadow);
}
```

### 2. Health Generation

The contract generates encrypted random health:

```solidity
function _generateHealth(address player, Zone zone) private returns (euint32) {
    // Generate random value
    euint32 randomValue = FHE.randEuint32();

    // Bound to 0-9, then add 1 for range 1-10
    euint32 bounded = FHE.rem(randomValue, 10);
    euint32 health = FHE.add(bounded, FHE.asEuint32(1));

    // Set permissions
    FHE.allowThis(health);      // Contract can use it
    FHE.allow(health, player);   // Player can decrypt it

    // If public zone, make publicly decryptable
    if (zone == Zone.Public) {
        FHE.makePubliclyDecryptable(health);
    }

    return health;
}
```

### 3. Zone Management

Players are tracked in separate arrays with efficient O(1) removal:

```solidity
function _removeFromShadow(address player) private {
    uint256 index = shadowIndex[player];
    uint256 lastIndex = shadowPlayers.length - 1;

    // Swap with last element
    if (index != lastIndex) {
        address lastPlayer = shadowPlayers[lastIndex];
        shadowPlayers[index] = lastPlayer;
        shadowIndex[lastPlayer] = index;
    }

    shadowPlayers.pop();
    delete shadowIndex[player];
}
```

### 4. Frontend Interaction

The React frontend handles encrypted data decryption:

1. Connect wallet using RainbowKit
2. Call contract functions using wagmi hooks
3. Retrieve encrypted health handles
4. Decrypt using Zama Relayer SDK
5. Display decrypted values to authorized users

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js**: Version 20 or higher
- **npm**: Version 7.0.0 or higher (or yarn/pnpm)
- **Git**: For cloning the repository
- **MetaMask** (or compatible wallet): For blockchain interaction

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/Shadow-Protocol.git
cd Shadow-Protocol
```

2. **Install contract dependencies**

```bash
npm install
```

3. **Install frontend dependencies**

```bash
cd src
npm install
cd ..
```

### Configuration

1. **Create environment file**

Create a `.env` file in the project root:

```bash
# Wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Infura API key for Sepolia testnet
INFURA_API_KEY=your_infura_key_here

# Optional: Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_key_here

# Optional: Enable gas reporting
REPORT_GAS=false
```

2. **Frontend configuration**

Update `src/src/config/contracts.ts` with your deployed contract address after deployment.

### Development

#### Compile Contracts

```bash
npm run compile
```

This will:
- Compile Solidity contracts
- Generate TypeScript types with TypeChain
- Create artifacts in `./artifacts`

#### Run Local FHEVM Node

```bash
npx hardhat node
```

This starts a local Hardhat node with FHEVM support on `http://localhost:8545`.

#### Run Tests

```bash
# Run all tests
npm run test

# Run with gas reporting
REPORT_GAS=true npm run test

# Run coverage
npm run coverage
```

#### Deploy to Local Network

In a new terminal (with local node running):

```bash
npx hardhat deploy --network localhost
```

#### Start Frontend Development Server

```bash
cd src
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Testing

The project includes comprehensive tests:

#### Unit Tests (Local)

```bash
npm run test
```

Tests include:
- ✓ Player registration in Shadow zone
- ✓ Player registration in Public zone
- ✓ Zone switching functionality
- ✓ Access control verification
- ✓ Error handling (duplicate joins, invalid zones)

#### Integration Tests (Sepolia)

```bash
npm run test:sepolia
```

Tests the contract on live Sepolia testnet with real FHEVM operations.

### Deployment

#### Deploy to Sepolia Testnet

1. **Fund your wallet** with Sepolia ETH from a faucet

2. **Deploy contract**

```bash
npx hardhat deploy --network sepolia
```

3. **Verify contract** (optional)

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

4. **Update frontend** with the deployed contract address

5. **Deploy frontend**

```bash
cd src
npm run build
# Deploy the ./dist folder to your hosting provider
```

The project includes Netlify configuration (`netlify.toml`) for easy deployment.

## Project Structure

```
Shadow-Protocol/
├── contracts/              # Solidity smart contracts
│   └── ShadowProtocol.sol # Main game contract
│
├── deploy/                 # Deployment scripts
│   └── deploy.ts          # Hardhat-deploy script
│
├── tasks/                  # Custom Hardhat tasks
│   ├── accounts.ts        # Account management
│   └── shadowProtocol.ts  # Contract interaction tasks
│
├── test/                   # Test files
│   ├── ShadowProtocol.ts  # Local tests
│   └── ShadowProtocolSepolia.ts # Sepolia integration tests
│
├── types/                  # Generated TypeChain types
│
├── src/                    # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── config/        # Configuration files
│   │   ├── styles/        # CSS styles
│   │   └── App.tsx        # Main app component
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
│
├── hardhat.config.ts       # Hardhat configuration
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
└── .env                    # Environment variables (create this)
```

## Smart Contract Documentation

### Contract: `ShadowProtocol`

#### State Variables

- `shadowPlayers`: Array of addresses in Shadow zone
- `publicPlayers`: Array of addresses in Public zone
- `players`: Mapping from address to PlayerData
- `shadowIndex`: Mapping for O(1) removal from Shadow zone
- `publicIndex`: Mapping for O(1) removal from Public zone

#### Enums

```solidity
enum Zone {
    None,    // 0: Not in any zone
    Shadow,  // 1: Private zone
    Public   // 2: Public zone
}
```

#### Structs

```solidity
struct PlayerData {
    euint32 health;  // Encrypted health value (1-10)
    Zone zone;       // Current zone
    bool exists;     // Registration status
}
```

#### External Functions

**`joinShadow()`**
- Adds caller to Shadow zone with private encrypted health
- Emits: `PlayerJoined` or `PlayerZoneUpdated`
- Reverts: `AlreadyInZone` if already in Shadow zone

**`joinPublic()`**
- Adds caller to Public zone with publicly decryptable health
- Emits: `PlayerJoined` or `PlayerZoneUpdated`
- Reverts: `AlreadyInZone` if already in Public zone

**`getPlayer(address player)`**
- Returns player data: exists, zone, health (encrypted), publiclyDecryptable flag
- View function, no gas cost

**`getShadowPlayers()`**
- Returns arrays of Shadow zone player addresses and encrypted health values
- View function

**`getPublicPlayers()`**
- Returns arrays of Public zone player addresses and encrypted health values
- View function

**`totalShadowPlayers()`**
- Returns count of Shadow zone players
- View function

**`totalPublicPlayers()`**
- Returns count of Public zone players
- View function

**`currentZone(address player)`**
- Returns the zone of specified player
- Reverts: `PlayerNotFound` if player hasn't joined

#### Events

```solidity
event PlayerJoined(address indexed player, Zone indexed zone);
event PlayerZoneUpdated(address indexed player, Zone indexed previousZone, Zone indexed newZone);
```

#### Custom Errors

```solidity
error InvalidZone();                    // Zone.None not allowed
error AlreadyInZone(Zone zone);        // Can't join current zone
error PlayerNotFound(address player);   // Player hasn't registered
```

## Frontend Application

### Features

The React frontend provides:

1. **Wallet Connection**: RainbowKit integration for easy wallet connection
2. **Zone Selection**: UI for joining Shadow or Public zones
3. **Player Dashboard**: View your encrypted health and current zone
4. **Zone Explorer**: See all players in each zone (respecting privacy)
5. **Health Decryption**: Decrypt your private health value using Zama Relayer
6. **Real-time Updates**: Automatic UI updates on blockchain events

### Key Components

- **WalletConnect**: Handles wallet connection and network switching
- **ZoneSelector**: UI for joining zones
- **PlayerCard**: Displays player information
- **ZoneList**: Shows players in Shadow/Public zones
- **DecryptButton**: Triggers health decryption via Relayer

### Technologies Used

- **React 19**: Latest React with concurrent features
- **wagmi**: Type-safe Ethereum interactions
- **RainbowKit**: Beautiful wallet connection UI
- **Zama Relayer SDK**: FHE decryption services
- **Vite**: Fast build tool with HMR

## Use Cases

### 1. Privacy-Enhanced Gaming

- **Strategy Games**: Hide unit positions and stats from opponents
- **Card Games**: Implement on-chain poker with encrypted hole cards
- **RPGs**: Private inventory and character stats

### 2. DeFi Applications

- **Private Trading**: Execute trades without revealing intent to MEV bots
- **Sealed-Bid Auctions**: Hide bid amounts until reveal phase
- **Anonymous Voting**: Vote without revealing choices

### 3. Identity and Credentials

- **Private KYC**: Prove compliance without revealing personal data
- **Credential Verification**: Verify qualifications without exposure
- **Age Verification**: Prove age requirements without sharing birthdate

### 4. Research and Development

- **FHE Experimentation**: Test homomorphic encryption in production
- **Privacy Protocol Development**: Build privacy-preserving dApps
- **Academic Research**: Study encrypted computation performance

## Security Considerations

### Cryptographic Security

- **FHE Security**: Relies on Zama's audited FHEVM implementation
- **Key Management**: Player private keys control access to encrypted data
- **Random Number Generation**: Uses FHEVM's cryptographically secure RNG

### Smart Contract Security

- **Access Control**: Proper permission management for encrypted values
- **Reentrancy**: Not vulnerable (no external calls in critical sections)
- **Integer Overflow**: Using Solidity 0.8+ with built-in checks
- **Gas Optimization**: Efficient data structures to prevent DoS

### Known Limitations

1. **Gas Costs**: FHE operations are more expensive than standard operations
2. **Decryption Latency**: Public decryption requires waiting for Zama relayers
3. **FHEVM Dependency**: Requires FHEVM-compatible chain (currently Sepolia testnet)
4. **Key Rotation**: No mechanism for rotating encryption keys

### Best Practices

- Always verify contract addresses before interaction
- Keep private keys secure and never share them
- Test on testnet before mainnet deployment
- Monitor gas costs in production
- Implement rate limiting for frontend requests

## Roadmap

### Phase 1: Foundation (Current)
- ✅ Core contract implementation
- ✅ Basic zone system (Shadow/Public)
- ✅ Random health generation
- ✅ Access control management
- ✅ Comprehensive test suite
- ✅ React frontend with wallet integration

### Phase 2: Enhanced Gameplay (Q2 2025)
- ⬜ Combat system with encrypted damage calculation
- ⬜ Player-vs-player battles
- ⬜ Item system with encrypted attributes
- ⬜ Zone-specific abilities and bonuses
- ⬜ Leaderboard with privacy preservation
- ⬜ Achievement system

### Phase 3: Advanced Features (Q3 2025)
- ⬜ Multi-zone system (add more zone types)
- ⬜ Guild/team functionality
- ⬜ Encrypted messaging between players
- ⬜ Dynamic zone rules and modifiers
- ⬜ NFT integration for characters
- ⬜ Marketplace for encrypted items

### Phase 4: Scalability (Q4 2025)
- ⬜ Layer 2 deployment for lower costs
- ⬜ Batch operations for multiple players
- ⬜ Off-chain computation with on-chain verification
- ⬜ Cross-chain bridge support
- ⬜ Mobile app development
- ⬜ Performance optimizations

### Phase 5: Ecosystem (2026)
- ⬜ SDK for building Shadow Protocol games
- ⬜ Plugin system for custom zones
- ⬜ Developer grants program
- ⬜ Game creation tools and templates
- ⬜ Mainnet deployment
- ⬜ Decentralized governance

### Research Goals
- Advanced FHE operations (comparison, conditionals)
- Improved gas efficiency techniques
- Novel privacy-preserving game mechanics
- Integration with other privacy protocols
- Academic publications and presentations

## Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Contribution Guidelines

- **Code Style**: Follow the existing code style (use ESLint and Prettier)
- **Tests**: Add tests for new features
- **Documentation**: Update docs for significant changes
- **Commits**: Write clear, descriptive commit messages
- **Gas Optimization**: Consider gas costs in contract changes

### Areas for Contribution

- 🎮 New game mechanics
- 🔐 Security improvements
- 📊 Frontend enhancements
- 📝 Documentation improvements
- 🐛 Bug fixes
- ⚡ Performance optimizations
- 🧪 Additional test cases

### Development Setup

See the [Getting Started](#getting-started) section for setup instructions.

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards other community members

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

See the [LICENSE](LICENSE) file for full details.

### What this means:

✅ You can:
- Use the code commercially
- Modify the code
- Distribute the code
- Use the code privately

❌ You cannot:
- Hold the authors liable
- Use the authors' names for endorsement

⚠️ You must:
- Include the original license
- Include the copyright notice

## Support

### Documentation

- **Zama FHEVM Docs**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Hardhat Docs**: [https://hardhat.org/docs](https://hardhat.org/docs)
- **React Docs**: [https://react.dev](https://react.dev)

### Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/your-username/Shadow-Protocol/issues)
- **GitHub Discussions**: [Ask questions and share ideas](https://github.com/your-username/Shadow-Protocol/discussions)
- **Zama Discord**: [https://discord.gg/zama](https://discord.gg/zama)

### Getting Help

1. **Check Documentation**: Review this README and linked docs
2. **Search Issues**: Someone may have asked your question
3. **Ask the Community**: Post in GitHub Discussions
4. **Report Bugs**: Create a detailed issue with reproduction steps

### Contact

- **Email**: your-email@example.com
- **Twitter**: @YourTwitter
- **Website**: https://your-website.com

---

**Built with privacy and innovation by the Shadow Protocol team**

*Powered by Zama's FHEVM - Making privacy-preserving smart contracts a reality*
