import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { FhevmType } from "@fhevm/hardhat-plugin";

task("task:address", "Prints the ShadowProtocol address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;
  const deployment = await deployments.get("ShadowProtocol");
  console.log("ShadowProtocol address is " + deployment.address);
});

task("task:join-shadow", "Joins the shadow zone")
  .addOptionalParam("address", "Optionally specify the ShadowProtocol contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const deployment = taskArguments.address
      ? { address: taskArguments.address as string }
      : await deployments.get("ShadowProtocol");

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("ShadowProtocol", deployment.address);
    const tx = await contract.connect(signer).joinShadow();
    await tx.wait();

    console.log(`Joined shadow zone as ${signer.address} on ${deployment.address}`);
  });

task("task:join-public", "Joins the public zone")
  .addOptionalParam("address", "Optionally specify the ShadowProtocol contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const deployment = taskArguments.address
      ? { address: taskArguments.address as string }
      : await deployments.get("ShadowProtocol");

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("ShadowProtocol", deployment.address);
    const tx = await contract.connect(signer).joinPublic();
    await tx.wait();

    console.log(`Joined public zone as ${signer.address} on ${deployment.address}`);
  });

task("task:list-players", "Lists players in shadow and public zones")
  .addOptionalParam("address", "Optionally specify the ShadowProtocol contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const deployment = taskArguments.address
      ? { address: taskArguments.address as string }
      : await deployments.get("ShadowProtocol");

    const contract = await ethers.getContractAt("ShadowProtocol", deployment.address);
    const [signer] = await ethers.getSigners();

    await fhevm.initializeCLIApi();

    const [shadowAddresses, shadowHealth] = await contract.getShadowPlayers();
    console.log("Shadow zone players:");
    for (let i = 0; i < shadowAddresses.length; i++) {
      const address = shadowAddresses[i];
      const handle = shadowHealth[i];
      let info = ` - ${address} (handle: ${handle})`;
      if (address.toLowerCase() === signer.address.toLowerCase()) {
        const decrypted = await fhevm.userDecryptEuint(FhevmType.euint32, handle, deployment.address, signer);
        info += ` | decrypted=${decrypted}`;
      }
      console.log(info);
    }

    const [publicAddresses, publicHealth] = await contract.getPublicPlayers();
    console.log("Public zone players:");
    for (let i = 0; i < publicAddresses.length; i++) {
      const address = publicAddresses[i];
      const handle = publicHealth[i];
      let info = ` - ${address} (handle: ${handle})`;
      try {
        const decrypted = await fhevm.publicDecryptEuint(FhevmType.euint32, handle);
        info += ` | public=${decrypted}`;
      } catch {
        if (address.toLowerCase() === signer.address.toLowerCase()) {
          const decrypted = await fhevm.userDecryptEuint(FhevmType.euint32, handle, deployment.address, signer);
          info += ` | decrypted=${decrypted}`;
        }
      }
      console.log(info);
    }
  });
