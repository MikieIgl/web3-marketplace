import { ethers } from "hardhat";

const CONTRACT_ADDRESS = "0xfEA1CEA02705A45088C9b1ec4Fb6154866eeFF41";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const marketplace = await ethers.getContractAt(
    "Marketplace",
    CONTRACT_ADDRESS,
  );

  try {
    const count = await marketplace.itemCount();
    console.log(`Current items in contract: ${count}`);
  } catch (e) {
    console.log("Could not fetch itemCount");
  }

  const items = [
    {
      name: "Crypto T-Shirt",
      description: "Cool t-shirt for crypto enthusiasts",
      imageUrl: "https://picsum.photos/400/400?random=1",
      price: ethers.parseEther("0.001"),
    },
    {
      name: "Blockchain Mug",
      description: "Coffee mug with blockchain print",
      imageUrl: "https://picsum.photos/400/400?random=2",
      price: ethers.parseEther("0.002"),
    },
    {
      name: "NFT Sticker Pack",
      description: "Pack of 10 crypto stickers",
      imageUrl: "https://picsum.photos/400/400?random=3",
      price: ethers.parseEther("0.0005"),
    },
    {
      name: "Web3 Hoodie",
      description: "Premium hoodie for developers",
      imageUrl: "https://picsum.photos/400/400?random=4",
      price: ethers.parseEther("0.003"),
    },
  ];

  for (const item of items) {
    try {
      console.log(`\n📤 Sending: ${item.name}`);
      const tx = await marketplace.listItem(
        item.name,
        item.description,
        item.imageUrl,
        item.price,
      );
      console.log(`   TX hash: ${tx.hash}`);
      console.log(`   Waiting for confirmation...`);
      const receipt = await tx.wait();
      console.log(`✅ Confirmed in block ${receipt?.blockNumber}`);
      await sleep(3000);
    } catch (err: any) {
      console.error(`❌ Failed: ${err.message}`);
      await sleep(5000);
    }
  }

  await sleep(2000);

  try {
    const count = await marketplace.itemCount();
    console.log(`\n📦 Total items now: ${count}`);
  } catch (e) {
    console.log("Could not fetch final count");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
