export const CONTRACT_ADDRESS = '0x57AbE515DF801590bc384818254fC966A2f1B834';

export const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "enum ShadowProtocol.Zone",
        "name": "zone",
        "type": "uint8"
      }
    ],
    "name": "AlreadyInZone",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidZone",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "PlayerNotFound",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "enum ShadowProtocol.Zone",
        "name": "zone",
        "type": "uint8"
      }
    ],
    "name": "PlayerJoined",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "enum ShadowProtocol.Zone",
        "name": "previousZone",
        "type": "uint8"
      },
      {
        "indexed": true,
        "internalType": "enum ShadowProtocol.Zone",
        "name": "newZone",
        "type": "uint8"
      }
    ],
    "name": "PlayerZoneUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "currentZone",
    "outputs": [
      {
        "internalType": "enum ShadowProtocol.Zone",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getPlayer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      },
      {
        "internalType": "enum ShadowProtocol.Zone",
        "name": "zone",
        "type": "uint8"
      },
      {
        "internalType": "euint32",
        "name": "health",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "publiclyDecryptable",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPublicPlayers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "playersList",
        "type": "address[]"
      },
      {
        "internalType": "euint32[]",
        "name": "healthList",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getShadowPlayers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "playersList",
        "type": "address[]"
      },
      {
        "internalType": "euint32[]",
        "name": "healthList",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "joinPublic",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "joinShadow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "protocolId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalPublicPlayers",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalShadowPlayers",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
