import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedShadowProtocol = await deploy("ShadowProtocol", {
    from: deployer,
    log: true,
  });

  console.log(`ShadowProtocol contract: `, deployedShadowProtocol.address);
};
export default func;
func.id = "deploy_shadow_protocol";
func.tags = ["ShadowProtocol"];
