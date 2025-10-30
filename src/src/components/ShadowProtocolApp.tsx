import { useEffect, useMemo, useState } from 'react';
import { Contract } from 'ethers';
import { useQuery } from '@tanstack/react-query';
import { useAccount, usePublicClient } from 'wagmi';

import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import '../styles/ShadowApp.css';

const Zone = {
  None: 0,
  Shadow: 1,
  Public: 2,
} as const;

type ZoneKey = keyof typeof Zone;
type ZoneValue = (typeof Zone)[ZoneKey];

type ZoneSummary = {
  addresses: string[];
  handles: string[];
};

type PlayerSnapshot = {
  exists: boolean;
  zone: ZoneValue;
  health: string;
  publiclyDecryptable: boolean;
};

type ZoneKind = 'shadow' | 'public';

const zoneLabels: Record<ZoneValue, string> = {
  [Zone.None]: 'Not joined',
  [Zone.Shadow]: 'Shadow zone',
  [Zone.Public]: 'Public zone',
};

const shortenAddress = (value: string) => `${value.slice(0, 6)}...${value.slice(-4)}`;
const formatHandle = (handle: string) => `${handle.slice(0, 10)}...${handle.slice(-6)}`;

interface ZoneSectionProps {
  title: string;
  description: string;
  zone: ZoneKind;
  addresses: string[];
  handles: string[];
  currentAddress?: string;
  decryptedValues: Record<string, string>;
  decryptingHandles: Record<string, boolean>;
  loading: boolean;
  onDecrypt: (zone: ZoneKind, owner: string, handle: string) => Promise<void>;
}

function ZoneSection({
  title,
  description,
  zone,
  addresses,
  handles,
  currentAddress,
  decryptedValues,
  decryptingHandles,
  loading,
  onDecrypt,
}: ZoneSectionProps) {
  if (loading) {
    return (
      <section className="zone-card">
        <div className="zone-header">
          <div>
            <h2 className="zone-title">{title}</h2>
            <p className="zone-description">{description}</p>
          </div>
        </div>
        <div className="zone-loading">Loading players...</div>
      </section>
    );
  }

  const isShadow = zone === 'shadow';

  return (
    <section className="zone-card">
      <div className="zone-header">
        <div>
          <h2 className="zone-title">{title}</h2>
          <p className="zone-description">{description}</p>
        </div>
        <span className="zone-count">{addresses.length} players</span>
      </div>

      {addresses.length === 0 ? (
        <div className="zone-empty">No players joined yet.</div>
      ) : (
        <ul className="zone-list">
          {addresses.map((player, index) => {
            const handle = handles[index];
            const decrypted = decryptedValues[handle];
            const decrypting = decryptingHandles[handle];
            const isSelf = currentAddress && player.toLowerCase() === currentAddress.toLowerCase();
            const showButton = isShadow ? isSelf && !decrypted : !decrypted;

            return (
              <li key={`${player}-${handle}`} className="zone-list-item">
                <div className="player-column">
                  <span className="player-pill">{shortenAddress(player)}</span>
                </div>
                <div className="status-column">
                  {decrypted ? (
                    <span className="status-value">{decrypted}</span>
                  ) : (
                    <span className="status-handle">{formatHandle(handle)}</span>
                  )}
                </div>
                <div className="action-column">
                  {showButton && (
                    <button
                      type="button"
                      className="status-button"
                      disabled={decrypting}
                      onClick={() => onDecrypt(zone, player, handle)}
                    >
                      {decrypting ? 'Decrypting...' : zone === 'public' ? 'Reveal status' : 'Decrypt mine'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function ShadowProtocolApp() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const signerPromise = useEthersSigner();
  const { instance, isLoading: instanceLoading, error: instanceError } = useZamaInstance();

  const [joiningZone, setJoiningZone] = useState<ZoneKind | null>(null);
  const [banner, setBanner] = useState<{ type: 'info' | 'error' | 'success'; message: string } | null>(null);
  const [decryptedValues, setDecryptedValues] = useState<Record<string, string>>({});
  const [decryptingHandles, setDecryptingHandles] = useState<Record<string, boolean>>({});

  const fetchZone = async (functionName: 'getShadowPlayers' | 'getPublicPlayers'): Promise<ZoneSummary> => {
    if (!publicClient) {
      return { addresses: [], handles: [] };
    }

    const response = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName,
    });

    const [addresses, handles] = response as [readonly string[], readonly string[]];

    return {
      addresses: Array.from(addresses),
      handles: Array.from(handles),
    };
  };

  const shadowQuery = useQuery({
    queryKey: ['shadowPlayers'],
    enabled: Boolean(publicClient),
    queryFn: () => fetchZone('getShadowPlayers'),
  });

  const publicQuery = useQuery({
    queryKey: ['publicPlayers'],
    enabled: Boolean(publicClient),
    queryFn: () => fetchZone('getPublicPlayers'),
  });

  const playerQuery = useQuery({
    queryKey: ['player', address],
    enabled: Boolean(publicClient && address),
    queryFn: async (): Promise<PlayerSnapshot> => {
      const response = await publicClient!.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getPlayer',
        args: [address as `0x${string}`],
      });

      const [existsRaw, zoneRaw, healthRaw, publicFlag] = response as [boolean, bigint | number, string, boolean];
      const zoneValue = Number(zoneRaw) as ZoneValue;

      return {
        exists: existsRaw,
        zone: zoneValue,
        health: healthRaw,
        publiclyDecryptable: publicFlag,
      };
    },
  });

  const shadowData = shadowQuery.data ?? { addresses: [], handles: [] };
  const publicData = publicQuery.data ?? { addresses: [], handles: [] };
  const playerData = playerQuery.data;

  const clearCachedDecryptions = () => {
    setDecryptedValues({});
    setDecryptingHandles({});
  };

  const joinZone = async (zone: ZoneKind) => {
    if (!isConnected) {
      setBanner({ type: 'error', message: 'Connect your wallet before joining a zone.' });
      return;
    }

    const signer = await signerPromise;
    if (!signer) {
      setBanner({ type: 'error', message: 'Unable to access signer from wallet.' });
      return;
    }

    setJoiningZone(zone);
    setBanner({ type: 'info', message: `Confirm the transaction to join the ${zone} zone.` });

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx =
        zone === 'shadow'
          ? await contract.joinShadow()
          : await contract.joinPublic();

      await tx.wait();
      clearCachedDecryptions();
      await Promise.all([shadowQuery.refetch(), publicQuery.refetch(), playerQuery.refetch()]);

      setBanner({
        type: 'success',
        message: zone === 'shadow' ? 'Joined the shadow zone with a fresh encrypted health!' : 'Joined the public zone successfully.',
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error';
      setBanner({ type: 'error', message: `Failed to join zone: ${reason}` });
    } finally {
      setJoiningZone(null);
    }
  };

  const decryptHandle = async (zone: ZoneKind, owner: string, handle: string) => {
    if (!instance) {
      setBanner({ type: 'error', message: 'Encryption service is not ready yet.' });
      return;
    }

    setDecryptingHandles((prev) => ({ ...prev, [handle]: true }));

    try {
      if (zone === 'public') {
        const result = await instance.publicDecrypt([handle]);
        if (result[handle]) {
          setDecryptedValues((prev) => ({ ...prev, [handle]: result[handle] }));
        }
        return;
      }

      if (!address || address.toLowerCase() !== owner.toLowerCase()) {
        setBanner({ type: 'error', message: 'Only the player can decrypt their shadow health.' });
        return;
      }

      const signer = await signerPromise;
      if (!signer) {
        setBanner({ type: 'error', message: 'Signer unavailable for decryption request.' });
        return;
      }

      const keypair = instance.generateKeypair();
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const contractAddresses = [CONTRACT_ADDRESS];

      const eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);
      const signature = await signer.signTypedData(
        eip712.domain,
        {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        eip712.message,
      );

      const decryptResult = await instance.userDecrypt(
        [
          {
            handle,
            contractAddress: CONTRACT_ADDRESS,
          },
        ],
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        address,
        startTimeStamp,
        durationDays,
      );

      const decryptedValue = decryptResult[handle];
      if (decryptedValue) {
        setDecryptedValues((prev) => ({ ...prev, [handle]: decryptedValue }));
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error';
      setBanner({ type: 'error', message: `Decryption failed: ${reason}` });
    } finally {
      setDecryptingHandles((prev) => {
        const updated = { ...prev };
        delete updated[handle];
        return updated;
      });
    }
  };

  useEffect(() => {
    if (!instance) {
      return;
    }

    const handles = publicData.handles.filter((handle) => !decryptedValues[handle]);
    if (handles.length === 0) {
      return;
    }

    let cancelled = false;

    const fetchPublicDecrypts = async () => {
      try {
        const result = await instance.publicDecrypt(handles);
        if (!cancelled) {
          setDecryptedValues((prev) => ({ ...prev, ...result }));
        }
      } catch (error) {
        console.error('Failed to perform public decrypt', error);
      }
    };

    fetchPublicDecrypts();

    return () => {
      cancelled = true;
    };
  }, [instance, publicData.handles, decryptedValues]);

  const personalDecrypted = useMemo(() => {
    if (!playerData?.health) {
      return undefined;
    }
    return decryptedValues[playerData.health];
  }, [playerData, decryptedValues]);

  const personalHandle = playerData?.health;
  const personalZone = playerData?.zone ?? Zone.None;
  const canDecryptPersonal =
    !!personalHandle &&
    (personalZone === Zone.Public || (personalZone === Zone.Shadow && !personalDecrypted));

  const handlePersonalDecrypt = () => {
    if (!personalHandle) {
      return;
    }
    const zoneKind = personalZone === Zone.Public ? 'public' : 'shadow';
    decryptHandle(zoneKind, address ?? '', personalHandle);
  };

  return (
    <div className="shadow-app">
      {banner && (
        <div className={`banner banner-${banner.type}`}>
          {banner.message}
        </div>
      )}

      {instanceError && (
        <div className="banner banner-error">
          Failed to initialize encryption services: {instanceError}
        </div>
      )}

      <section className="section-card">
        <h2 className="section-title">Choose your zone</h2>
        <p className="section-description">
          Join the shadow zone to keep your health private or enter the public zone to reveal it to everyone.
        </p>
        <div className="action-buttons">
          <button
            type="button"
            className="action-button"
            onClick={() => joinZone('shadow')}
            disabled={joiningZone !== null}
          >
            {joiningZone === 'shadow' ? 'Joining shadow...' : 'Join Shadow Zone'}
          </button>
          <button
            type="button"
            className="action-button action-button-emphasis"
            onClick={() => joinZone('public')}
            disabled={joiningZone !== null}
          >
            {joiningZone === 'public' ? 'Joining public...' : 'Join Public Zone'}
          </button>
        </div>
      </section>

      <section className="section-card">
        <h2 className="section-title">Your status</h2>
        {address ? (
          playerQuery.isLoading ? (
            <p className="section-helper">Fetching your latest status...</p>
          ) : playerData?.exists ? (
            <div className="status-panel">
              <div className="status-row">
                <span className="status-label">Current zone</span>
                <span className="status-pill">
                  {zoneLabels[personalZone]}
                </span>
              </div>
              <div className="status-row">
                <span className="status-label">Health handle</span>
                {personalHandle ? (
                  <span className="status-handle">{formatHandle(personalHandle)}</span>
                ) : (
                  <span className="status-handle">Not available</span>
                )}
              </div>
              <div className="status-row">
                <span className="status-label">Decrypted health</span>
                {personalDecrypted ? (
                  <span className="status-value">{personalDecrypted}</span>
                ) : (
                  <span className="status-pending">Encrypted</span>
                )}
              </div>
              {canDecryptPersonal && (
                <button
                  type="button"
                  className="status-button status-button-inline"
                  disabled={instanceLoading || !!decryptingHandles[personalHandle!]}
                  onClick={handlePersonalDecrypt}
                >
                  {decryptingHandles[personalHandle!] ? 'Processing...' : 'Decrypt my health'}
                </button>
              )}
            </div>
          ) : (
            <p className="section-helper">
              You have not joined the game yet. Pick a zone above to receive your encrypted health.
            </p>
          )
        ) : (
          <p className="section-helper">Connect your wallet to view your status.</p>
        )}
      </section>

      <div className="zones-grid">
        <ZoneSection
          title="Shadow zone"
          description="Only the owner can decrypt their health. Others see the encrypted handle."
          zone="shadow"
          addresses={shadowData.addresses}
          handles={shadowData.handles}
          currentAddress={address}
          decryptedValues={decryptedValues}
          decryptingHandles={decryptingHandles}
          loading={shadowQuery.isLoading}
          onDecrypt={decryptHandle}
        />

        <ZoneSection
          title="Public zone"
          description="Health values are publicly decryptable. Anyone can reveal them using the relayer."
          zone="public"
          addresses={publicData.addresses}
          handles={publicData.handles}
          currentAddress={address}
          decryptedValues={decryptedValues}
          decryptingHandles={decryptingHandles}
          loading={publicQuery.isLoading}
          onDecrypt={decryptHandle}
        />
      </div>
    </div>
  );
}
