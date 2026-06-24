import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const artifactPath = path.join(
  __dirname,
  "../artifacts/contracts/Marketplace.sol/Marketplace.json",
);

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

const outputDir = path.join(
  __dirname,
  "../../web3-marketplace/src/app/contracts/abis",
);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, "marketplace.abi.json"),
  JSON.stringify(artifact.abi, null, 2),
);

console.log(
  "✅ ABI exported to ../web3-marketplace/src/app/contracts/abis/marketplace.abi.json",
);
