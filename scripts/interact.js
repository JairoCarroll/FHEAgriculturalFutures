import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to prompt user
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Display menu
function displayMenu() {
  console.log("\n" + "=".repeat(60));
  console.log("Agricultural Futures Platform - Contract Interaction");
  console.log("=".repeat(60));
  console.log("\n📋 Available Actions:\n");
  console.log("  1. View contract information");
  console.log("  2. Deposit balance");
  console.log("  3. Create futures contract");
  console.log("  4. Confirm contract");
  console.log("  5. View my contracts");
  console.log("  6. View trader profile");
  console.log("  7. View market data");
  console.log("  8. Settle contract");
  console.log("  9. Cancel contract");
  console.log("  10. Update market price (owner only)");
  console.log("  0. Exit\n");
}

// Load deployed contract
async function loadContract() {
  const network = await ethers.provider.getNetwork();
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const latestFile = path.join(deploymentsDir, `${network.name}-latest.json`);

  if (!fs.existsSync(latestFile)) {
    throw new Error(
      `No deployment found for network: ${network.name}\nPlease deploy the contract first.`
    );
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(latestFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  const contract = await ethers.getContractAt(
    "PrivateAgriculturalFutures",
    contractAddress
  );

  return { contract, contractAddress, network };
}

// Action handlers
async function viewContractInfo(contract, contractAddress) {
  console.log("\n" + "-".repeat(60));
  console.log("📄 Contract Information");
  console.log("-".repeat(60));

  const owner = await contract.owner();
  const nextContractId = await contract.nextContractId();

  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Owner: ${owner}`);
  console.log(`Next Contract ID: ${nextContractId}`);
  console.log(`Settlement Period: 30 days`);
}

async function depositBalance(contract, signer) {
  console.log("\n" + "-".repeat(60));
  console.log("💰 Deposit Balance");
  console.log("-".repeat(60));

  const amount = await prompt("Enter amount to deposit (in ETH): ");
  const amountWei = ethers.parseEther(amount);

  console.log(`\nDepositing ${amount} ETH...`);
  const tx = await contract.depositBalance({ value: amountWei });
  console.log(`Transaction hash: ${tx.hash}`);

  console.log("Waiting for confirmation...");
  await tx.wait();

  console.log("✅ Deposit successful!");
}

async function createFuturesContract(contract, signer) {
  console.log("\n" + "-".repeat(60));
  console.log("📝 Create Futures Contract");
  console.log("-".repeat(60));

  const seller = await prompt("Enter seller address: ");

  console.log("\nCrop Types:");
  console.log("  0 - WHEAT");
  console.log("  1 - RICE");
  console.log("  2 - CORN");
  console.log("  3 - SOYBEANS");
  console.log("  4 - COTTON");
  const cropType = await prompt("Select crop type (0-4): ");

  const quantity = await prompt("Enter quantity (in tons): ");
  const pricePerTon = await prompt("Enter price per ton (in wei, e.g., 1000000000000000000 for 1 ETH): ");

  console.log(`\nCreating futures contract...`);
  const tx = await contract.createFuturesContract(
    seller,
    parseInt(cropType),
    parseInt(quantity),
    BigInt(pricePerTon)
  );

  console.log(`Transaction hash: ${tx.hash}`);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();

  // Extract contract ID from event
  const event = receipt.logs.find(log => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed.name === "ContractCreated";
    } catch {
      return false;
    }
  });

  if (event) {
    const parsed = contract.interface.parseLog(event);
    console.log(`✅ Contract created with ID: ${parsed.args.contractId}`);
  } else {
    console.log("✅ Contract created successfully!");
  }
}

async function confirmContract(contract) {
  console.log("\n" + "-".repeat(60));
  console.log("✓ Confirm Contract");
  console.log("-".repeat(60));

  const contractId = await prompt("Enter contract ID to confirm: ");

  console.log(`\nConfirming contract ${contractId}...`);
  const tx = await contract.confirmContract(parseInt(contractId));
  console.log(`Transaction hash: ${tx.hash}`);

  console.log("Waiting for confirmation...");
  await tx.wait();

  console.log("✅ Contract confirmed!");
}

async function viewMyContracts(contract, signer) {
  console.log("\n" + "-".repeat(60));
  console.log("📋 My Contracts");
  console.log("-".repeat(60));

  const address = await signer.getAddress();
  const contractIds = await contract.getTraderContracts(address);

  if (contractIds.length === 0) {
    console.log("No contracts found.");
    return;
  }

  console.log(`\nFound ${contractIds.length} contract(s):\n`);

  const cropNames = ["WHEAT", "RICE", "CORN", "SOYBEANS", "COTTON"];
  const statusNames = ["ACTIVE", "SETTLED", "CANCELLED"];

  for (const id of contractIds) {
    const info = await contract.getContractInfo(id);
    console.log(`Contract ID: ${id}`);
    console.log(`  Buyer: ${info.buyer}`);
    console.log(`  Seller: ${info.seller}`);
    console.log(`  Crop: ${cropNames[info.cropType]}`);
    console.log(`  Status: ${statusNames[info.status]}`);
    console.log(`  Buyer Confirmed: ${info.buyerConfirmed}`);
    console.log(`  Seller Confirmed: ${info.sellerConfirmed}`);
    console.log(`  Settlement Date: ${new Date(Number(info.settlementDate) * 1000).toLocaleDateString()}`);
    console.log(`  Created: ${new Date(Number(info.creationTime) * 1000).toLocaleDateString()}`);
    console.log();
  }
}

async function viewTraderProfile(contract) {
  console.log("\n" + "-".repeat(60));
  console.log("👤 Trader Profile");
  console.log("-".repeat(60));

  const address = await prompt("Enter trader address (or press Enter for your address): ");
  const [signer] = await ethers.getSigners();
  const targetAddress = address || (await signer.getAddress());

  const profile = await contract.getTraderInfo(targetAddress);

  console.log(`\nTrader: ${targetAddress}`);
  console.log(`Active Contracts: ${profile.activeContracts}`);
  console.log(`Total Trades: ${profile.totalTrades}`);
  console.log(`Verified: ${profile.isVerified ? "Yes" : "No"}`);
}

async function viewMarketData(contract) {
  console.log("\n" + "-".repeat(60));
  console.log("📊 Market Data");
  console.log("-".repeat(60));

  const cropNames = ["WHEAT", "RICE", "CORN", "SOYBEANS", "COTTON"];

  console.log();
  for (let i = 0; i < 5; i++) {
    const marketInfo = await contract.getMarketInfo(i);
    console.log(`${cropNames[i]}:`);
    console.log(`  Total Volume: ${marketInfo.totalVolume} contracts`);
    console.log(`  Last Updated: ${new Date(Number(marketInfo.lastUpdated) * 1000).toLocaleString()}`);
    console.log();
  }
}

async function settleContract(contract) {
  console.log("\n" + "-".repeat(60));
  console.log("💼 Settle Contract");
  console.log("-".repeat(60));

  const contractId = await prompt("Enter contract ID to settle: ");

  console.log(`\nSettling contract ${contractId}...`);
  const tx = await contract.settleContract(parseInt(contractId));
  console.log(`Transaction hash: ${tx.hash}`);

  console.log("Waiting for confirmation...");
  await tx.wait();

  console.log("✅ Contract settled!");
}

async function cancelContract(contract) {
  console.log("\n" + "-".repeat(60));
  console.log("❌ Cancel Contract");
  console.log("-".repeat(60));

  const contractId = await prompt("Enter contract ID to cancel: ");
  const reason = await prompt("Enter cancellation reason: ");

  console.log(`\nCancelling contract ${contractId}...`);
  const tx = await contract.cancelContract(parseInt(contractId), reason);
  console.log(`Transaction hash: ${tx.hash}`);

  console.log("Waiting for confirmation...");
  await tx.wait();

  console.log("✅ Contract cancelled!");
}

async function updateMarketPrice(contract) {
  console.log("\n" + "-".repeat(60));
  console.log("💹 Update Market Price (Owner Only)");
  console.log("-".repeat(60));

  console.log("\nCrop Types:");
  console.log("  0 - WHEAT");
  console.log("  1 - RICE");
  console.log("  2 - CORN");
  console.log("  3 - SOYBEANS");
  console.log("  4 - COTTON");
  const cropType = await prompt("Select crop type (0-4): ");

  const newPrice = await prompt("Enter new price (in wei, e.g., 1000000000000000000 for 1 ETH): ");

  console.log(`\nUpdating market price...`);
  const tx = await contract.updateMarketPrice(parseInt(cropType), BigInt(newPrice));
  console.log(`Transaction hash: ${tx.hash}`);

  console.log("Waiting for confirmation...");
  await tx.wait();

  console.log("✅ Market price updated!");
}

// Main interaction loop
async function main() {
  try {
    console.log("\n🔗 Loading contract...");
    const { contract, contractAddress, network } = await loadContract();
    const [signer] = await ethers.getSigners();

    console.log(`Connected to network: ${network.name}`);
    console.log(`Contract address: ${contractAddress}`);
    console.log(`Your address: ${await signer.getAddress()}`);

    let running = true;

    while (running) {
      displayMenu();
      const choice = await prompt("Select an action (0-10): ");

      try {
        switch (choice.trim()) {
          case "1":
            await viewContractInfo(contract, contractAddress);
            break;
          case "2":
            await depositBalance(contract, signer);
            break;
          case "3":
            await createFuturesContract(contract, signer);
            break;
          case "4":
            await confirmContract(contract);
            break;
          case "5":
            await viewMyContracts(contract, signer);
            break;
          case "6":
            await viewTraderProfile(contract);
            break;
          case "7":
            await viewMarketData(contract);
            break;
          case "8":
            await settleContract(contract);
            break;
          case "9":
            await cancelContract(contract);
            break;
          case "10":
            await updateMarketPrice(contract);
            break;
          case "0":
            running = false;
            console.log("\n👋 Goodbye!\n");
            break;
          default:
            console.log("\n❌ Invalid choice. Please try again.");
        }
      } catch (error) {
        console.error("\n❌ Error:", error.message);
      }
    }

    rl.close();
  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
    rl.close();
    process.exit(1);
  }
}

// Execute interaction script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export { main as default };
