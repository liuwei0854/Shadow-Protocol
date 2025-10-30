import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { ShadowProtocol, ShadowProtocol__factory } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";

enum Zone {
  None,
  Shadow,
  Public,
}

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("ShadowProtocol")) as ShadowProtocol__factory;
  const contract = (await factory.deploy()) as ShadowProtocol;
  const contractAddress = await contract.getAddress();
  return { contract, contractAddress };
}

describe("ShadowProtocol", function () {
  let signers: Signers;
  let contract: ShadowProtocol;
  let contractAddress: string;

  before(async function () {
    const [deployer, alice, bob] = await ethers.getSigners();
    signers = { deployer, alice, bob };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  it("allows a player to join the shadow zone with encrypted health", async function () {
    const tx = await contract.connect(signers.alice).joinShadow();
    await tx.wait();

    const playerData = await contract.getPlayer(signers.alice.address);
    expect(playerData.exists).to.equal(true);
    expect(playerData.zone).to.equal(Zone.Shadow);
    expect(playerData.publiclyDecryptable).to.equal(false);

    const [shadowAddresses, shadowHealth] = await contract.getShadowPlayers();
    expect(shadowAddresses).to.deep.equal([signers.alice.address]);
    expect(shadowHealth[0]).to.not.equal(ethers.ZeroHash);

    const decrypted = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      shadowHealth[0],
      contractAddress,
      signers.alice,
    );

    expect(decrypted).to.be.gte(1);
    expect(decrypted).to.be.lte(10);
  });

  it("allows a player to join the public zone and exposes public decryption", async function () {
    const tx = await contract.connect(signers.bob).joinPublic();
    await tx.wait();

    const playerData = await contract.getPlayer(signers.bob.address);
    expect(playerData.exists).to.equal(true);
    expect(playerData.zone).to.equal(Zone.Public);
    expect(playerData.publiclyDecryptable).to.equal(true);

    const [publicAddresses, publicHealth] = await contract.getPublicPlayers();
    expect(publicAddresses).to.deep.equal([signers.bob.address]);
    expect(publicHealth[0]).to.not.equal(ethers.ZeroHash);

    const decrypted = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      publicHealth[0],
      contractAddress,
      signers.bob,
    );

    expect(decrypted).to.be.gte(1);
    expect(decrypted).to.be.lte(10);
  });

  it("moves a player between zones and refreshes access controls", async function () {
    await contract.connect(signers.alice).joinShadow();
    const initialData = await contract.getPlayer(signers.alice.address);
    expect(initialData.zone).to.equal(Zone.Shadow);
    expect(initialData.publiclyDecryptable).to.equal(false);

    await contract.connect(signers.alice).joinPublic();
    const updatedData = await contract.getPlayer(signers.alice.address);
    expect(updatedData.zone).to.equal(Zone.Public);
    expect(updatedData.publiclyDecryptable).to.equal(true);

    const [shadowAddresses] = await contract.getShadowPlayers();
    expect(shadowAddresses.length).to.equal(0);

    const [publicAddresses, publicHealth] = await contract.getPublicPlayers();
    expect(publicAddresses).to.deep.equal([signers.alice.address]);
    expect(publicHealth[0]).to.equal(updatedData.health);
    expect(publicHealth[0]).to.not.equal(ethers.ZeroHash);
  });

  it("prevents rejoining the same zone without switching", async function () {
    await contract.connect(signers.alice).joinShadow();

    await expect(contract.connect(signers.alice).joinShadow())
      .to.be.revertedWithCustomError(contract, "AlreadyInZone")
      .withArgs(Zone.Shadow);
  });
});
