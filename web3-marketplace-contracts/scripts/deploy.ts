import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  console.log("\n✅ Marketplace deployed to:", address);
  console.log("View on Etherscan:");
  console.log(`https://sepolia.etherscan.io/address/${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
