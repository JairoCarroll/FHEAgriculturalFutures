import { ethers } from "hardhat";

async function main() {
  console.log("=".repeat(60));
  console.log("Agricultural Futures Platform - Simulation Script");
  console.log("=".repeat(60));

  // Get signers (test accounts)
  const [deployer, farmer1, farmer2, trader1, trader2] = await ethers.getSigners();

  console.log("\n📋 Test Accounts:");
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Farmer 1: ${farmer1.address}`);
  console.log(`Farmer 2: ${farmer2.address}`);
  console.log(`Trader 1: ${trader1.address}`);
  console.log(`Trader 2: ${trader2.address}`);

  // Deploy contract
  console.log("\n" + "-".repeat(60));
  console.log("Deploying Contract...");
  console.log("-".repeat(60));

  const PrivateAgriculturalFutures = await ethers.getContractFactory(
    "PrivateAgriculturalFutures"
  );
  const contract = await PrivateAgriculturalFutures.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`✅ Contract deployed at: ${contractAddress}`);

  // Helper function for logging
  const logStep = (step, description) => {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Step ${step}: ${description}`);
    console.log("=".repeat(60));
  };

  const cropNames = ["WHEAT", "RICE", "CORN", "SOYBEANS", "COTTON"];
  const statusNames = ["ACTIVE", "SETTLED", "CANCELLED"];

  // Simulation Steps

  // Step 1: Deposit balances
  logStep(1, "Traders Deposit Balances");

  console.log("\n💰 Farmer 1 deposits 5 ETH...");
  let tx = await contract.connect(farmer1).depositBalance({ value: ethers.parseEther("5") });
  await tx.wait();
  console.log("✅ Deposit successful");

  console.log("\n💰 Trader 1 deposits 10 ETH...");
  tx = await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });
  await tx.wait();
  console.log("✅ Deposit successful");

  console.log("\n💰 Trader 2 deposits 3 ETH...");
  tx = await contract.connect(trader2).depositBalance({ value: ethers.parseEther("3") });
  await tx.wait();
  console.log("✅ Deposit successful");

  // Step 2: Create multiple futures contracts
  logStep(2, "Creating Futures Contracts");

  console.log("\n📝 Trader 1 creates WHEAT contract with Farmer 1...");
  tx = await contract.connect(trader1).createFuturesContract(
    farmer1.address,
    0, // WHEAT
    100, // 100 tons
    ethers.parseEther("0.5") // 0.5 ETH per ton
  );
  let receipt = await tx.wait();
  let event = receipt.logs.find(log => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed.name === "ContractCreated";
    } catch {
      return false;
    }
  });
  let contractId1 = event ? contract.interface.parseLog(event).args.contractId : 1;
  console.log(`✅ Contract created with ID: ${contractId1}`);

  console.log("\n📝 Farmer 1 creates CORN contract with Trader 2...");
  tx = await contract.connect(farmer1).createFuturesContract(
    trader2.address,
    2, // CORN
    50, // 50 tons
    ethers.parseEther("0.3") // 0.3 ETH per ton
  );
  receipt = await tx.wait();
  event = receipt.logs.find(log => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed.name === "ContractCreated";
    } catch {
      return false;
    }
  });
  let contractId2 = event ? contract.interface.parseLog(event).args.contractId : 2;
  console.log(`✅ Contract created with ID: ${contractId2}`);

  console.log("\n📝 Trader 1 creates SOYBEANS contract with Farmer 2...");
  tx = await contract.connect(trader1).createFuturesContract(
    farmer2.address,
    3, // SOYBEANS
    75, // 75 tons
    ethers.parseEther("0.4") // 0.4 ETH per ton
  );
  receipt = await tx.wait();
  event = receipt.logs.find(log => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed.name === "ContractCreated";
    } catch {
      return false;
    }
  });
  let contractId3 = event ? contract.interface.parseLog(event).args.contractId : 3;
  console.log(`✅ Contract created with ID: ${contractId3}`);

  // Step 3: View created contracts
  logStep(3, "Viewing Created Contracts");

  for (let id of [contractId1, contractId2, contractId3]) {
    const info = await contract.getContractInfo(id);
    console.log(`\nContract ID: ${id}`);
    console.log(`  Buyer: ${info.buyer}`);
    console.log(`  Seller: ${info.seller}`);
    console.log(`  Crop: ${cropNames[info.cropType]}`);
    console.log(`  Status: ${statusNames[info.status]}`);
    console.log(`  Buyer Confirmed: ${info.buyerConfirmed}`);
    console.log(`  Seller Confirmed: ${info.sellerConfirmed}`);
    console.log(`  Settlement Date: ${new Date(Number(info.settlementDate) * 1000).toLocaleDateString()}`);
  }

  // Step 4: Confirm contracts
  logStep(4, "Confirming Contracts");

  console.log(`\n✓ Farmer 1 confirms contract ${contractId1}...`);
  tx = await contract.connect(farmer1).confirmContract(contractId1);
  await tx.wait();
  console.log("✅ Confirmed");

  console.log(`\n✓ Trader 2 confirms contract ${contractId2}...`);
  tx = await contract.connect(trader2).confirmContract(contractId2);
  await tx.wait();
  console.log("✅ Confirmed");

  console.log(`\n✓ Farmer 2 confirms contract ${contractId3}...`);
  tx = await contract.connect(farmer2).confirmContract(contractId3);
  await tx.wait();
  console.log("✅ Confirmed");

  // Step 5: View trader profiles
  logStep(5, "Viewing Trader Profiles");

  const addresses = [
    { name: "Deployer", address: deployer.address },
    { name: "Farmer 1", address: farmer1.address },
    { name: "Farmer 2", address: farmer2.address },
    { name: "Trader 1", address: trader1.address },
    { name: "Trader 2", address: trader2.address },
  ];

  for (const { name, address } of addresses) {
    const profile = await contract.getTraderInfo(address);
    console.log(`\n${name} (${address}):`);
    console.log(`  Active Contracts: ${profile.activeContracts}`);
    console.log(`  Total Trades: ${profile.totalTrades}`);
    console.log(`  Verified: ${profile.isVerified}`);
  }

  // Step 6: View market data
  logStep(6, "Viewing Market Data");

  for (let i = 0; i < 5; i++) {
    const marketInfo = await contract.getMarketInfo(i);
    console.log(`\n${cropNames[i]}:`);
    console.log(`  Total Volume: ${marketInfo.totalVolume} contracts`);
    console.log(`  Last Updated: ${new Date(Number(marketInfo.lastUpdated) * 1000).toLocaleString()}`);
  }

  // Step 7: Update market prices (owner only)
  logStep(7, "Updating Market Prices");

  const newPrices = [
    { crop: 0, name: "WHEAT", price: ethers.parseEther("0.55") },
    { crop: 2, name: "CORN", price: ethers.parseEther("0.35") },
    { crop: 3, name: "SOYBEANS", price: ethers.parseEther("0.45") },
  ];

  for (const { crop, name, price } of newPrices) {
    console.log(`\n💹 Updating ${name} price to ${ethers.formatEther(price)} ETH...`);
    tx = await contract.connect(deployer).updateMarketPrice(crop, price);
    await tx.wait();
    console.log("✅ Price updated");
  }

  // Step 8: Cancel a contract
  logStep(8, "Cancelling Unconfirmed Contract");

  console.log("\n📝 Creating a new contract to cancel...");
  tx = await contract.connect(trader1).createFuturesContract(
    farmer1.address,
    1, // RICE
    30, // 30 tons
    ethers.parseEther("0.6") // 0.6 ETH per ton
  );
  receipt = await tx.wait();
  event = receipt.logs.find(log => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed.name === "ContractCreated";
    } catch {
      return false;
    }
  });
  let contractIdToCancel = event ? contract.interface.parseLog(event).args.contractId : 4;
  console.log(`✅ Contract created with ID: ${contractIdToCancel}`);

  console.log(`\n❌ Farmer 1 cancels contract ${contractIdToCancel}...`);
  tx = await contract.connect(farmer1).cancelContract(
    contractIdToCancel,
    "Changed market conditions"
  );
  await tx.wait();
  console.log("✅ Contract cancelled");

  // Step 9: View all trader contracts
  logStep(9, "Viewing All Trader Contracts");

  const tradersToCheck = [
    { name: "Farmer 1", signer: farmer1 },
    { name: "Trader 1", signer: trader1 },
    { name: "Trader 2", signer: trader2 },
  ];

  for (const { name, signer } of tradersToCheck) {
    const address = await signer.getAddress();
    const contractIds = await contract.getTraderContracts(address);
    console.log(`\n${name} has ${contractIds.length} contract(s):`);
    console.log(`  Contract IDs: [${contractIds.join(", ")}]`);
  }

  // Step 10: Simulate time passing and settlement
  logStep(10, "Time Travel Simulation");

  console.log("\n⏰ Note: In a real scenario, you would need to wait 30 days for settlement.");
  console.log("On Hardhat network, you can use time manipulation:");
  console.log("\nExample code to fast-forward time:");
  console.log('  await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // 30 days');
  console.log('  await ethers.provider.send("evm_mine");');
  console.log("\nThen you could settle the contracts:");
  console.log(`  await contract.connect(trader1).settleContract(${contractId1});`);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("Simulation Summary");
  console.log("=".repeat(60));

  console.log("\n✅ Completed Actions:");
  console.log("  - Deployed contract");
  console.log("  - 3 traders deposited balances");
  console.log("  - Created 4 futures contracts");
  console.log("  - Confirmed 3 contracts");
  console.log("  - Updated market prices for 3 commodities");
  console.log("  - Cancelled 1 contract");
  console.log("  - Viewed trader profiles and market data");

  console.log("\n📊 Final Statistics:");
  const finalStats = {
    totalContracts: Number(await contract.nextContractId()) - 1,
    activeContracts: 3,
    cancelledContracts: 1,
    marketVolume: 0,
  };

  console.log(`  Total Contracts Created: ${finalStats.totalContracts}`);
  console.log(`  Active Contracts: ${finalStats.activeContracts}`);
  console.log(`  Cancelled Contracts: ${finalStats.cancelledContracts}`);

  console.log("\n💡 Next Steps:");
  console.log("  - Deploy to testnet: npm run deploy");
  console.log("  - Verify contract: npm run verify");
  console.log("  - Interact with contract: npm run interact");

  console.log("\n" + "=".repeat(60));
  console.log("Simulation Complete!");
  console.log("=".repeat(60) + "\n");
}

// Execute simulation
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Simulation failed:", error);
    process.exit(1);
  });

export { main as default };
