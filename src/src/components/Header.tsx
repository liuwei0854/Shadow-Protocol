import { ConnectButton } from '@rainbow-me/rainbowkit';
import '../styles/Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="header-brand">
            <h1 className="header-title">Shadow Protocol</h1>
            <p className="header-subtitle">Balance hidden and public player health across the realm.</p>
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
