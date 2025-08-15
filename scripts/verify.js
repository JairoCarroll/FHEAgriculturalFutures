import { run } from "hardhat";
import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("=".repeat(60));
  console.log("Contract Verification on Etherscan");
  console.log("=".repeat(60));

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId;

  console.log(`\nNetwork: ${network.name} (Chain ID: ${chainId})`);

  // Load latest deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const latestFile = path.join(deploymentsDir, `${network.name}-latest.json`);

  if (!fs.existsSync(latestFile)) {
    console.error("\n❌ Error: No deployment found for this network.");
    console.error("Please deploy the contract first using: npm run deploy");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(latestFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log(`Contract address: ${contractAddress}`);
  console.log(`Deployer: ${deploymentInfo.deployerAddress}`);
  console.log(`Transaction: ${deploymentInfo.transactionHash}`);

  // Check if on Sepolia
  if (chainId !== 11155111n) {
    console.warn("\n⚠️  Warning: Verification is only supported on Sepolia testnet.");
    console.log("Current network is not Sepolia. Exiting...");
    process.exit(0);
  }

  // Check for Etherscan API key
  if (!process.env.ETHERSCAN_API_KEY) {
    console.error("\n❌ Error: ETHERSCAN_API_KEY not found in .env file");
    console.error("Please add your Etherscan API key to .env:");
    console.error("ETHERSCAN_API_KEY=your_api_key_here");
    console.error("\nGet your API key at: https://etherscan.io/myapikey");
    process.exit(1);
  }

  console.log("\n" + "-".repeat(60));
  console.log("Starting Verification Process...");
  console.log("-".repeat(60));

  try {
    console.log("\nVerifying contract on Etherscan...");
    console.log("This may take a few moments...\n");

    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
      contract: "contracts/PrivateAgriculturalFutures.sol:PrivateAgriculturalFutures",
    });

    console.log("\n" + "=".repeat(60));
    console.log("✅ Verification Successful!");
    console.log("=".repeat(60));
    console.log(`\nContract verified at:`);
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}#code`);

    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verifiedAt = new Date().toISOString();
    deploymentInfo.etherscanUrl = `https://sepolia.etherscan.io/address/${contractAddress}`;

    fs.writeFileSync(latestFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\nDeployment info updated with verification status.`);

    console.log("\n" + "-".repeat(60));
    console.log("📝 Next Steps:");
    console.log("-".repeat(60));
    console.log("1. View contract on Etherscan:");
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("2. Interact with the contract:");
    console.log("   npm run interact");
    console.log("3. Run simulations:");
    console.log("   npm run simulate");

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n✓ Contract is already verified on Etherscan!");
      console.log(`View at: https://sepolia.etherscan.io/address/${contractAddress}#code`);
    } else {
      console.error("\n" + "=".repeat(60));
      console.error("❌ Verification Failed");
      console.error("=".repeat(60));
      console.error("\nError details:");
      console.error(error.message);

      if (error.message.includes("API key")) {
        console.error("\n💡 Tip: Check your ETHERSCAN_API_KEY in .env file");
      } else if (error.message.includes("does not have bytecode")) {
        console.error("\n💡 Tip: Make sure the contract is deployed on this network");
      }

      process.exit(1);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("Verification Process Complete!");
  console.log("=".repeat(60) + "\n");
}

// Execute verification
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });

export { main as default };
