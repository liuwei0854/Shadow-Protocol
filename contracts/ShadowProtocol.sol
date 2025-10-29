// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract ShadowProtocol is SepoliaConfig {
    enum Zone {
        None,
        Shadow,
        Public
    }

    struct PlayerData {
        euint32 health;
        Zone zone;
        bool exists;
    }

    address[] private shadowPlayers;
    address[] private publicPlayers;

    mapping(address => PlayerData) private players;
    mapping(address => uint256) private shadowIndex;
    mapping(address => uint256) private publicIndex;

    error InvalidZone();
    error AlreadyInZone(Zone zone);
    error PlayerNotFound(address player);

    event PlayerJoined(address indexed player, Zone indexed zone);
    event PlayerZoneUpdated(address indexed player, Zone indexed previousZone, Zone indexed newZone);

    function joinShadow() external {
        _upsertPlayer(msg.sender, Zone.Shadow);
    }

    function joinPublic() external {
        _upsertPlayer(msg.sender, Zone.Public);
    }

    function getPlayer(address player)
        external
        view
        returns (bool exists, Zone zone, euint32 health, bool publiclyDecryptable)
    {
        PlayerData memory data = players[player];
        return (data.exists, data.zone, data.health, FHE.isPubliclyDecryptable(data.health));
    }

    function getShadowPlayers() external view returns (address[] memory playersList, euint32[] memory healthList) {
        uint256 length = shadowPlayers.length;
        playersList = new address[](length);
        healthList = new euint32[](length);

        for (uint256 i = 0; i < length; i++) {
            address player = shadowPlayers[i];
            playersList[i] = player;
            healthList[i] = players[player].health;
        }
    }

    function getPublicPlayers() external view returns (address[] memory playersList, euint32[] memory healthList) {
        uint256 length = publicPlayers.length;
        playersList = new address[](length);
        healthList = new euint32[](length);

        for (uint256 i = 0; i < length; i++) {
            address player = publicPlayers[i];
            playersList[i] = player;
            healthList[i] = players[player].health;
        }
    }

    function totalShadowPlayers() external view returns (uint256) {
        return shadowPlayers.length;
    }

    function totalPublicPlayers() external view returns (uint256) {
        return publicPlayers.length;
    }

    function currentZone(address player) external view returns (Zone) {
        if (!players[player].exists) {
            revert PlayerNotFound(player);
        }
        return players[player].zone;
    }

    function _upsertPlayer(address player, Zone newZone) private {
        if (newZone == Zone.None) {
            revert InvalidZone();
        }

        PlayerData storage data = players[player];
        Zone previousZone = data.zone;
        bool existed = data.exists;

        if (existed && previousZone == newZone) {
            revert AlreadyInZone(newZone);
        }

        data.health = _generateHealth(player, newZone);
        data.zone = newZone;
        data.exists = true;

        if (previousZone == Zone.Shadow) {
            _removeFromShadow(player);
        } else if (previousZone == Zone.Public) {
            _removeFromPublic(player);
        }

        if (existed) {
            emit PlayerZoneUpdated(player, previousZone, newZone);
        } else {
            emit PlayerJoined(player, newZone);
        }

        if (newZone == Zone.Shadow) {
            _addToShadow(player);
        } else if (newZone == Zone.Public) {
            _addToPublic(player);
        }
    }

    function _generateHealth(address player, Zone zone) private returns (euint32) {
        euint32 randomValue = FHE.randEuint32();
        euint32 bounded = FHE.rem(randomValue, 10);
        euint32 health = FHE.add(bounded, FHE.asEuint32(1));

        FHE.allowThis(health);
        FHE.allow(health, player);

        if (zone == Zone.Public) {
            FHE.makePubliclyDecryptable(health);
        }

        return health;
    }

    function _addToShadow(address player) private {
        shadowIndex[player] = shadowPlayers.length;
        shadowPlayers.push(player);
    }

    function _addToPublic(address player) private {
        publicIndex[player] = publicPlayers.length;
        publicPlayers.push(player);
    }

    function _removeFromShadow(address player) private {
        uint256 index = shadowIndex[player];
        uint256 lastIndex = shadowPlayers.length - 1;

        if (index != lastIndex) {
            address lastPlayer = shadowPlayers[lastIndex];
            shadowPlayers[index] = lastPlayer;
            shadowIndex[lastPlayer] = index;
        }

        shadowPlayers.pop();
        delete shadowIndex[player];
    }

    function _removeFromPublic(address player) private {
        uint256 index = publicIndex[player];
        uint256 lastIndex = publicPlayers.length - 1;

        if (index != lastIndex) {
            address lastPlayer = publicPlayers[lastIndex];
            publicPlayers[index] = lastPlayer;
            publicIndex[lastPlayer] = index;
        }

        publicPlayers.pop();
        delete publicIndex[player];
    }
}
