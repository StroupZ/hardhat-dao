import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { networkConfig, developmentChains } from "../helper-hardhat-config"
import verify from "../helper-functions"
import { ethers } from "hardhat"

const deployBox: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre
  const { log, deploy } = deployments
  const { deployer } = await getNamedAccounts()
  log("Deploying Box...")
  const box = await deploy("Box", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  })
  log(`Deployed box at ${box.address}`)
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(box.address, [])
  }
  const timeLock = await ethers.getContract("TimeLock")
  const boxContract = await ethers.getContractAt("Box", box.address)
  const transferOwnerTx = await boxContract.transferOwnership(timeLock.address)
  await transferOwnerTx.wait(1)
  log("Box transferred!")
}

export default deployBox
