import { ethers } from "hardhat";

const CONTRACT_ADDRESS = "0xfEA1CEA02705A45088C9b1ec4Fb6154866eeFF41";

async function main() {
  const marketplace = await ethers.getContractAt(
    "Marketplace",
    CONTRACT_ADDRESS,
  );

  const count = await marketplace.itemCount();
  console.log(`📦 Total items: ${count}\n`);

  const items = await marketplace.getAllItems();
  items.forEach((item: any) => {
    console.log(
      `#${item.id} | ${item.name} | ${ethers.formatEther(
        item.price,
      )} ETH | sold: ${item.sold}`,
    );
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
