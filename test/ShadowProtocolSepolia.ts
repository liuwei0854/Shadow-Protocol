import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, fhevm, deployments } from "hardhat";
import { ShadowProtocol } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";

enum Zone {
  None,
  Shadow,
  Public,
}

describe("ShadowProtocolSepolia", function () {
  let signer: HardhatEthersSigner;
  let contract: ShadowProtocol;
  let contractAddress: string;

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const deployment = await deployments.get("ShadowProtocol");
      contractAddress = deployment.address;
      contract = await ethers.getContractAt("ShadowProtocol", contractAddress);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    [signer] = await ethers.getSigners();
  });

  it("allows joining the public zone on Sepolia and decrypting health", async function () {
    this.timeout(4 * 40000);

    const tx = await contract.connect(signer).joinPublic();
    await tx.wait();

    const player = await contract.getPlayer(signer.address);
    expect(player.exists).to.equal(true);
    expect(player.zone).to.equal(Zone.Public);
    expect(player.publiclyDecryptable).to.equal(true);

    const decrypted = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      player.health,
      contractAddress,
      signer,
    );

    expect(decrypted).to.be.gte(1);
    expect(decrypted).to.be.lte(10);
  });
});
