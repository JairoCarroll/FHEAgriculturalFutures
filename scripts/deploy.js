import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("=".repeat(60));
  console.log("Starting Agricultural Futures Platform Deployment");
  console.log("=".repeat(60));

  // Get network information
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;
  console.log(`\nDeploying to network: ${network.name} (Chain ID: ${chainId})`);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);

  // Get deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} ETH`);

  // Check if deployer has sufficient balance
  if (balance < ethers.parseEther("0.01")) {
    console.warn("\n⚠️  Warning: Deployer balance is low. Deployment may fail.");
  }

  console.log("\n" + "-".repeat(60));
  console.log("Deploying PrivateAgriculturalFutures Contract...");
  console.log("-".repeat(60));

  // Deploy the contract
  const PrivateAgriculturalFutures = await ethers.getContractFactory(
    "PrivateAgriculturalFutures"
  );

  console.log("\nEstimating deployment gas...");
  const deploymentData = PrivateAgriculturalFutures.getDeployTransaction();
  const estimatedGas = await ethers.provider.estimateGas({
    data: deploymentData.data,
  });
  console.log(`Estimated gas: ${estimatedGas.toString()}`);

  console.log("\nDeploying contract...");
  const contract = await PrivateAgriculturalFutures.deploy();

  console.log(`Transaction hash: ${contract.deploymentTransaction().hash}`);
  console.log("Waiting for confirmations...");

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n" + "=".repeat(60));
  console.log("✅ Deployment Successful!");
  console.log("=".repeat(60));
  console.log(`Contract address: ${contractAddress}`);
  console.log(`Deployment transaction: ${contract.deploymentTransaction().hash}`);
  console.log(`Block number: ${contract.deploymentTransaction().blockNumber || "pending"}`);

  // Get contract owner
  const owner = await contract.owner();
  console.log(`Contract owner: ${owner}`);

  // Verify owner is deployer
  if (owner.toLowerCase() === deployer.address.toLowerCase()) {
    console.log("✓ Owner verification successful");
  }

  // Create deployment info object
  const deploymentInfo = {
    network: network.name,
    chainId: chainId.toString(),
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    transactionHash: contract.deploymentTransaction().hash,
    blockNumber: contract.deploymentTransaction().blockNumber || null,
    timestamp: new Date().toISOString(),
    owner: owner,
    compiler: {
      version: "0.8.24",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  };

  // Save deployment info to file
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `${network.name}-${Date.now()}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentFile}`);

  // Also save latest deployment for easy access
  const latestFile = path.join(deploymentsDir, `${network.name}-latest.json`);
  fs.writeFileSync(latestFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Latest deployment info: ${latestFile}`);

  // Display network-specific information
  console.log("\n" + "-".repeat(60));
  console.log("Network Information");
  console.log("-".repeat(60));

  if (chainId === 11155111n) {
    console.log("Network: Sepolia Testnet");
    console.log(`Block explorer: https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("\n📝 Next Steps:");
    console.log("1. Verify the contract on Etherscan:");
    console.log("   npm run verify");
    console.log("2. Interact with the contract:");
    console.log("   npm run interact");
    console.log("\n⚠️  Remember to save the contract address!");
  } else if (chainId === 31337n) {
    console.log("Network: Local Hardhat Network");
    console.log("\n📝 Next Steps:");
    console.log("1. Run simulation:");
    console.log("   npm run simulate");
    console.log("2. Interact with the contract:");
    console.log("   npm run interact:local");
  }

  console.log("\n" + "=".repeat(60));
  console.log("Deployment Complete!");
  console.log("=".repeat(60) + "\n");

  return {
    contract,
    contractAddress,
    deploymentInfo,
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n" + "=".repeat(60));
    console.error("❌ Deployment Failed");
    console.error("=".repeat(60));
    console.error(error);
    process.exit(1);
  });

export { main as default };
