import * as fs from "fs";
import * as path from "path";

const artifactPath = path.join(
  __dirname,
  "../artifacts/contracts/Marketplace.sol/Marketplace.json",
);

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

const outputDir = path.join(__dirname, "../abi");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

fs.writeFileSync(
  path.join(outputDir, "Marketplace.json"),
  JSON.stringify(artifact.abi, null, 2),
);

console.log("✅ ABI exported to ./abi/Marketplace.json");
