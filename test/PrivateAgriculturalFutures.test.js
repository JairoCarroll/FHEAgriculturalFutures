import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Agricultural Futures Trading Platform", function () {
  let contract;
  let contractAddress;
  let owner;
  let farmer1;
  let farmer2;
  let trader1;
  let trader2;
  let unauthorized;

  const CropType = {
    WHEAT: 0,
    RICE: 1,
    CORN: 2,
    SOYBEANS: 3,
    COTTON: 4,
  };

  const ContractStatus = {
    ACTIVE: 0,
    SETTLED: 1,
    CANCELLED: 2,
  };

  // Deployment fixture
  async function deployFixture() {
    [owner, farmer1, farmer2, trader1, trader2, unauthorized] = await ethers.getSigners();

    const PrivateAgriculturalFutures = await ethers.getContractFactory(
      "PrivateAgriculturalFutures"
    );
    const deployedContract = await PrivateAgriculturalFutures.deploy();
    await deployedContract.waitForDeployment();

    const address = await deployedContract.getAddress();

    return { contract: deployedContract, contractAddress: address };
  }

  beforeEach(async function () {
    ({ contract, contractAddress } = await deployFixture());
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should initialize nextContractId to 1", async function () {
      expect(await contract.nextContractId()).to.equal(1);
    });

    it("Should verify the owner trader", async function () {
      const traderInfo = await contract.getTraderInfo(owner.address);
      expect(traderInfo.isVerified).to.be.true;
    });

    it("Should initialize market data for all crop types", async function () {
      for (let i = 0; i < 5; i++) {
        const marketInfo = await contract.getMarketInfo(i);
        expect(marketInfo.totalVolume).to.equal(0);
        expect(marketInfo.lastUpdated).to.be.gt(0);
      }
    });
  });

  describe("Trader Verification and Balance", function () {
    it("Should verify trader manually by owner", async function () {
      await contract.verifyTrader(trader1.address);
      const traderInfo = await contract.getTraderInfo(trader1.address);
      expect(traderInfo.isVerified).to.be.true;
    });

    it("Should auto-verify trader on deposit", async function () {
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("1") });
      const traderInfo = await contract.getTraderInfo(trader1.address);
      expect(traderInfo.isVerified).to.be.true;
    });

    it("Should emit BalanceDeposited event on deposit", async function () {
      await expect(contract.connect(trader1).depositBalance({ value: ethers.parseEther("1") }))
        .to.emit(contract, "BalanceDeposited")
        .withArgs(trader1.address, await time.latest());
    });

    it("Should revert on zero deposit", async function () {
      await expect(
        contract.connect(trader1).depositBalance({ value: 0 })
      ).to.be.revertedWith("Must deposit some ETH");
    });
  });

  describe("Futures Contract Creation", function () {
    beforeEach(async function () {
      // Deposit balances for testing
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });
      await contract.connect(farmer1).depositBalance({ value: ethers.parseEther("5") });
    });

    it("Should create a futures contract successfully", async function () {
      const quantity = 100;
      const pricePerTon = ethers.parseEther("0.5");

      await expect(
        contract.connect(trader1).createFuturesContract(
          farmer1.address,
          CropType.WHEAT,
          quantity,
          pricePerTon
        )
      )
        .to.emit(contract, "ContractCreated")
        .withArgs(1, trader1.address, farmer1.address, CropType.WHEAT);

      const contractInfo = await contract.getContractInfo(1);
      expect(contractInfo.buyer).to.equal(trader1.address);
      expect(contractInfo.seller).to.equal(farmer1.address);
      expect(contractInfo.cropType).to.equal(CropType.WHEAT);
      expect(contractInfo.status).to.equal(ContractStatus.ACTIVE);
      expect(contractInfo.buyerConfirmed).to.be.true;
      expect(contractInfo.sellerConfirmed).to.be.false;
    });

    it("Should auto-verify both parties on contract creation", async function () {
      await contract.connect(trader1).createFuturesContract(
        trader2.address,
        CropType.CORN,
        50,
        ethers.parseEther("0.3")
      );

      const trader1Info = await contract.getTraderInfo(trader1.address);
      const trader2Info = await contract.getTraderInfo(trader2.address);

      expect(trader1Info.isVerified).to.be.true;
      expect(trader2Info.isVerified).to.be.true;
    });

    it("Should increment nextContractId", async function () {
      await contract.connect(trader1).createFuturesContract(
        farmer1.address,
        CropType.WHEAT,
        100,
        ethers.parseEther("0.5")
      );

      expect(await contract.nextContractId()).to.equal(2);
    });

    it("Should revert when trading with yourself", async function () {
      await expect(
        contract.connect(trader1).createFuturesContract(
          trader1.address,
          CropType.WHEAT,
          100,
          ethers.parseEther("0.5")
        )
      ).to.be.revertedWith("Cannot trade with yourself");
    });

    it("Should revert with zero quantity", async function () {
      await expect(
        contract.connect(trader1).createFuturesContract(
          farmer1.address,
          CropType.WHEAT,
          0,
          ethers.parseEther("0.5")
        )
      ).to.be.revertedWith("Quantity must be greater than 0");
    });

    it("Should revert with zero price", async function () {
      await expect(
        contract.connect(trader1).createFuturesContract(
          farmer1.address,
          CropType.WHEAT,
          100,
          0
        )
      ).to.be.revertedWith("Price must be greater than 0");
    });

    it("Should update trader active contracts count", async function () {
      await contract.connect(trader1).createFuturesContract(
        farmer1.address,
        CropType.WHEAT,
        100,
        ethers.parseEther("0.5")
      );

      const trader1Info = await contract.getTraderInfo(trader1.address);
      const farmer1Info = await contract.getTraderInfo(farmer1.address);

      expect(trader1Info.activeContracts).to.equal(1);
      expect(farmer1Info.activeContracts).to.equal(1);
    });

    it("Should add contract to trader's contract list", async function () {
      await contract.connect(trader1).createFuturesContract(
        farmer1.address,
        CropType.WHEAT,
        100,
        ethers.parseEther("0.5")
      );

      const trader1Contracts = await contract.getTraderContracts(trader1.address);
      const farmer1Contracts = await contract.getTraderContracts(farmer1.address);

      expect(trader1Contracts.length).to.equal(1);
      expect(farmer1Contracts.length).to.equal(1);
      expect(trader1Contracts[0]).to.equal(1);
      expect(farmer1Contracts[0]).to.equal(1);
    });
  });

  describe("Contract Confirmation", function () {
    beforeEach(async function () {
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });
      await contract.connect(trader1).createFuturesContract(
        farmer1.address,
        CropType.WHEAT,
        100,
        ethers.parseEther("0.5")
      );
    });

    it("Should allow seller to confirm contract", async function () {
      await expect(contract.connect(farmer1).confirmContract(1))
        .to.emit(contract, "ContractConfirmed")
        .withArgs(1, farmer1.address);

      const contractInfo = await contract.getContractInfo(1);
      expect(contractInfo.sellerConfirmed).to.be.true;
    });

    it("Should allow buyer to re-confirm contract", async function () {
      await expect(contract.connect(trader1).confirmContract(1))
        .to.emit(contract, "ContractConfirmed")
        .withArgs(1, trader1.address);

      const contractInfo = await contract.getContractInfo(1);
      expect(contractInfo.buyerConfirmed).to.be.true;
    });

    it("Should revert if non-party tries to confirm", async function () {
      await expect(
        contract.connect(trader2).confirmContract(1)
      ).to.be.revertedWith("Not a contract party");
    });

    it("Should revert if contract is not active", async function () {
      await contract.connect(farmer1).cancelContract(1, "Test cancellation");

      await expect(
        contract.connect(farmer1).confirmContract(1)
      ).to.be.revertedWith("Contract not active");
    });
  });

  describe("Contract Settlement", function () {
    beforeEach(async function () {
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });
      await contract.connect(trader1).createFuturesContract(
        farmer1.address,
        CropType.WHEAT,
        100,
        ethers.parseEther("0.5")
      );
      await contract.connect(farmer1).confirmContract(1);
    });

    it("Should settle contract after settlement period", async function () {
      // Fast forward 30 days
      await time.increase(30 * 24 * 60 * 60);

      await expect(contract.connect(trader1).settleContract(1))
        .to.emit(contract, "ContractSettled")
        .withArgs(1, trader1.address, farmer1.address);

      const contractInfo = await contract.getContractInfo(1);
      expect(contractInfo.status).to.equal(ContractStatus.SETTLED);
    });

    it("Should update trader statistics on settlement", async function () {
      await time.increase(30 * 24 * 60 * 60);
      await contract.connect(trader1).settleContract(1);

      const trader1Info = await contract.getTraderInfo(trader1.address);
      const farmer1Info = await contract.getTraderInfo(farmer1.address);

      expect(trader1Info.activeContracts).to.equal(0);
      expect(trader1Info.totalTrades).to.equal(1);
      expect(farmer1Info.activeContracts).to.equal(0);
      expect(farmer1Info.totalTrades).to.equal(1);
    });

    it("Should update market data on settlement", async function () {
      await time.increase(30 * 24 * 60 * 60);
      await contract.connect(trader1).settleContract(1);

      const marketInfo = await contract.getMarketInfo(CropType.WHEAT);
      expect(marketInfo.totalVolume).to.equal(1);
    });

    it("Should revert if settlement period not reached", async function () {
      await expect(
        contract.connect(trader1).settleContract(1)
      ).to.be.revertedWith("Settlement period not reached");
    });

    it("Should revert if both parties haven't confirmed", async function () {
      await contract.connect(trader1).createFuturesContract(
        farmer2.address,
        CropType.CORN,
        50,
        ethers.parseEther("0.3")
      );

      await time.increase(30 * 24 * 60 * 60);

      await expect(
        contract.connect(trader1).settleContract(2)
      ).to.be.revertedWith("Both parties must confirm");
    });

    it("Should revert if non-party tries to settle", async function () {
      await time.increase(30 * 24 * 60 * 60);

      await expect(
        contract.connect(trader2).settleContract(1)
      ).to.be.revertedWith("Not a contract party");
    });
  });

  describe("Contract Cancellation", function () {
    beforeEach(async function () {
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });
      await contract.connect(trader1).createFuturesContract(
        farmer1.address,
        CropType.WHEAT,
        100,
        ethers.parseEther("0.5")
      );
    });

    it("Should cancel unconfirmed contract", async function () {
      await expect(contract.connect(farmer1).cancelContract(1, "Changed my mind"))
        .to.emit(contract, "ContractCancelled")
        .withArgs(1, "Changed my mind");

      const contractInfo = await contract.getContractInfo(1);
      expect(contractInfo.status).to.equal(ContractStatus.CANCELLED);
    });

    it("Should update active contracts count on cancellation", async function () {
      await contract.connect(farmer1).cancelContract(1, "Test");

      const trader1Info = await contract.getTraderInfo(trader1.address);
      const farmer1Info = await contract.getTraderInfo(farmer1.address);

      expect(trader1Info.activeContracts).to.equal(0);
      expect(farmer1Info.activeContracts).to.equal(0);
    });

    it("Should revert if both parties confirmed", async function () {
      await contract.connect(farmer1).confirmContract(1);

      await expect(
        contract.connect(farmer1).cancelContract(1, "Too late")
      ).to.be.revertedWith("Cannot cancel confirmed contract");
    });

    it("Should revert if non-party tries to cancel", async function () {
      await expect(
        contract.connect(trader2).cancelContract(1, "Not my contract")
      ).to.be.revertedWith("Not a contract party");
    });

    it("Should revert if contract not active", async function () {
      await contract.connect(farmer1).cancelContract(1, "First cancellation");

      await expect(
        contract.connect(trader1).cancelContract(1, "Second cancellation")
      ).to.be.revertedWith("Contract not active");
    });
  });

  describe("Market Price Updates", function () {
    it("Should allow owner to update market price", async function () {
      const newPrice = ethers.parseEther("1.5");

      await expect(contract.updateMarketPrice(CropType.WHEAT, newPrice))
        .to.emit(contract, "MarketDataUpdated")
        .withArgs(CropType.WHEAT, await time.latest());
    });

    it("Should revert if non-owner tries to update", async function () {
      await expect(
        contract.connect(trader1).updateMarketPrice(CropType.WHEAT, ethers.parseEther("1.5"))
      ).to.be.revertedWith("Not authorized");
    });

    it("Should revert with zero price", async function () {
      await expect(
        contract.updateMarketPrice(CropType.WHEAT, 0)
      ).to.be.revertedWith("Price must be greater than 0");
    });
  });

  describe("View Functions", function () {
    it("Should return correct contract info", async function () {
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });
      await contract.connect(trader1).createFuturesContract(
        farmer1.address,
        CropType.WHEAT,
        100,
        ethers.parseEther("0.5")
      );

      const info = await contract.getContractInfo(1);
      expect(info.buyer).to.equal(trader1.address);
      expect(info.seller).to.equal(farmer1.address);
      expect(info.cropType).to.equal(CropType.WHEAT);
    });

    it("Should return correct trader info", async function () {
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });

      const info = await contract.getTraderInfo(trader1.address);
      expect(info.isVerified).to.be.true;
      expect(info.activeContracts).to.equal(0);
      expect(info.totalTrades).to.equal(0);
    });

    it("Should return trader contracts", async function () {
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });
      await contract.connect(trader1).createFuturesContract(
        farmer1.address,
        CropType.WHEAT,
        100,
        ethers.parseEther("0.5")
      );
      await contract.connect(trader1).createFuturesContract(
        farmer2.address,
        CropType.CORN,
        50,
        ethers.parseEther("0.3")
      );

      const contracts = await contract.getTraderContracts(trader1.address);
      expect(contracts.length).to.equal(2);
      expect(contracts[0]).to.equal(1);
      expect(contracts[1]).to.equal(2);
    });

    it("Should return market info", async function () {
      const info = await contract.getMarketInfo(CropType.WHEAT);
      expect(info.totalVolume).to.equal(0);
      expect(info.lastUpdated).to.be.gt(0);
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to emergency withdraw", async function () {
      // Deposit some ETH into contract
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("5") });

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      const contractBalance = await ethers.provider.getBalance(await contract.getAddress());

      const tx = await contract.emergencyWithdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      expect(ownerBalanceAfter).to.equal(
        ownerBalanceBefore + contractBalance - gasUsed
      );
    });

    it("Should revert if non-owner tries emergency withdraw", async function () {
      await expect(
        contract.connect(trader1).emergencyWithdraw()
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should deploy within reasonable gas limits", async function () {
      const PrivateAgriculturalFutures = await ethers.getContractFactory(
        "PrivateAgriculturalFutures"
      );
      const deployTx = await PrivateAgriculturalFutures.getDeployTransaction();
      const estimatedGas = await ethers.provider.estimateGas({ data: deployTx.data });

      // Deployment should use less than 3 million gas
      expect(estimatedGas).to.be.lt(3000000);
    });

    it("Should create contract with acceptable gas cost", async function () {
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });

      const tx = await contract.connect(trader1).createFuturesContract(
        farmer1.address,
        CropType.WHEAT,
        100,
        ethers.parseEther("0.5")
      );
      const receipt = await tx.wait();

      // Contract creation should use less than 500k gas
      expect(receipt.gasUsed).to.be.lt(500000);
    });

    it("Should confirm contract efficiently", async function () {
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });
      await contract.connect(trader1).createFuturesContract(
        farmer1.address,
        CropType.WHEAT,
        100,
        ethers.parseEther("0.5")
      );

      const tx = await contract.connect(farmer1).confirmContract(1);
      const receipt = await tx.wait();

      // Confirmation should use less than 150k gas
      expect(receipt.gasUsed).to.be.lt(150000);
    });
  });

  describe("Edge Cases and Boundary Tests", function () {
    it("Should handle minimum price value (1 wei)", async function () {
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("1") });

      await expect(
        contract.connect(trader1).createFuturesContract(
          farmer1.address,
          CropType.WHEAT,
          1,
          1 // 1 wei
        )
      ).to.not.be.reverted;
    });

    it("Should handle large quantity values", async function () {
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });

      const largeQuantity = 1000000; // 1 million tons
      await expect(
        contract.connect(trader1).createFuturesContract(
          farmer1.address,
          CropType.WHEAT,
          largeQuantity,
          ethers.parseEther("0.001")
        )
      ).to.not.be.reverted;
    });

    it("Should handle all crop types correctly", async function () {
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });

      for (let cropType = 0; cropType < 5; cropType++) {
        await expect(
          contract.connect(trader1).createFuturesContract(
            farmer1.address,
            cropType,
            100,
            ethers.parseEther("0.5")
          )
        ).to.not.be.reverted;
      }
    });

    it("Should handle rapid succession of operations", async function () {
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });
      await contract.connect(farmer1).depositBalance({ value: ethers.parseEther("5") });

      // Create multiple contracts quickly
      for (let i = 0; i < 3; i++) {
        await contract.connect(trader1).createFuturesContract(
          farmer1.address,
          CropType.WHEAT,
          100,
          ethers.parseEther("0.5")
        );
      }

      const trader1Contracts = await contract.getTraderContracts(trader1.address);
      expect(trader1Contracts.length).to.equal(3);
    });

    it("Should maintain state consistency across multiple traders", async function () {
      // Setup multiple traders
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });
      await contract.connect(trader2).depositBalance({ value: ethers.parseEther("10") });
      await contract.connect(farmer1).depositBalance({ value: ethers.parseEther("5") });

      // Create contracts
      await contract.connect(trader1).createFuturesContract(
        farmer1.address,
        CropType.WHEAT,
        100,
        ethers.parseEther("0.5")
      );

      await contract.connect(trader2).createFuturesContract(
        farmer1.address,
        CropType.CORN,
        50,
        ethers.parseEther("0.3")
      );

      // Verify independent state
      const trader1Info = await contract.getTraderInfo(trader1.address);
      const trader2Info = await contract.getTraderInfo(trader2.address);
      const farmer1Info = await contract.getTraderInfo(farmer1.address);

      expect(trader1Info.activeContracts).to.equal(1);
      expect(trader2Info.activeContracts).to.equal(1);
      expect(farmer1Info.activeContracts).to.equal(2);
    });
  });

  describe("Contract Lifecycle Tests", function () {
    it("Should track complete contract lifecycle from creation to settlement", async function () {
      // Setup
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });

      // Create
      await contract.connect(trader1).createFuturesContract(
        farmer1.address,
        CropType.WHEAT,
        100,
        ethers.parseEther("0.5")
      );

      let info = await contract.getContractInfo(1);
      expect(info.status).to.equal(ContractStatus.ACTIVE);
      expect(info.buyerConfirmed).to.be.true;
      expect(info.sellerConfirmed).to.be.false;

      // Confirm
      await contract.connect(farmer1).confirmContract(1);
      info = await contract.getContractInfo(1);
      expect(info.sellerConfirmed).to.be.true;

      // Fast forward time
      await time.increase(30 * 24 * 60 * 60);

      // Settle
      await contract.connect(trader1).settleContract(1);
      info = await contract.getContractInfo(1);
      expect(info.status).to.equal(ContractStatus.SETTLED);
    });

    it("Should emit all expected events during lifecycle", async function () {
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });

      // Contract creation event
      await expect(
        contract.connect(trader1).createFuturesContract(
          farmer1.address,
          CropType.WHEAT,
          100,
          ethers.parseEther("0.5")
        )
      ).to.emit(contract, "ContractCreated");

      // Confirmation event
      await expect(
        contract.connect(farmer1).confirmContract(1)
      ).to.emit(contract, "ContractConfirmed");

      // Fast forward and settle
      await time.increase(30 * 24 * 60 * 60);

      // Settlement event
      await expect(
        contract.connect(trader1).settleContract(1)
      ).to.emit(contract, "ContractSettled");
    });
  });

  describe("Multiple Contracts Management", function () {
    it("Should allow trader to manage multiple contracts simultaneously", async function () {
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("20") });

      // Create 5 different contracts
      await contract.connect(trader1).createFuturesContract(
        farmer1.address, CropType.WHEAT, 100, ethers.parseEther("0.5")
      );
      await contract.connect(trader1).createFuturesContract(
        farmer2.address, CropType.RICE, 80, ethers.parseEther("0.4")
      );
      await contract.connect(trader1).createFuturesContract(
        farmer1.address, CropType.CORN, 120, ethers.parseEther("0.3")
      );
      await contract.connect(trader1).createFuturesContract(
        farmer2.address, CropType.SOYBEANS, 90, ethers.parseEther("0.6")
      );
      await contract.connect(trader1).createFuturesContract(
        farmer1.address, CropType.COTTON, 150, ethers.parseEther("0.7")
      );

      const contracts = await contract.getTraderContracts(trader1.address);
      expect(contracts.length).to.equal(5);

      const traderInfo = await contract.getTraderInfo(trader1.address);
      expect(traderInfo.activeContracts).to.equal(5);
    });

    it("Should correctly update counts when contracts are settled", async function () {
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });

      // Create and confirm contract
      await contract.connect(trader1).createFuturesContract(
        farmer1.address, CropType.WHEAT, 100, ethers.parseEther("0.5")
      );
      await contract.connect(farmer1).confirmContract(1);

      // Create another contract
      await contract.connect(trader1).createFuturesContract(
        farmer2.address, CropType.RICE, 80, ethers.parseEther("0.4")
      );

      // Settle first contract
      await time.increase(30 * 24 * 60 * 60);
      await contract.connect(trader1).settleContract(1);

      const traderInfo = await contract.getTraderInfo(trader1.address);
      expect(traderInfo.activeContracts).to.equal(1);
      expect(traderInfo.totalTrades).to.equal(1);
    });
  });

  describe("Market Data Integrity", function () {
    it("Should update market volume correctly on settlements", async function () {
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });

      // Create and settle multiple WHEAT contracts
      for (let i = 0; i < 3; i++) {
        await contract.connect(trader1).createFuturesContract(
          farmer1.address, CropType.WHEAT, 100, ethers.parseEther("0.5")
        );
        await contract.connect(farmer1).confirmContract(i + 1);
      }

      // Fast forward and settle all
      await time.increase(30 * 24 * 60 * 60);
      for (let i = 1; i <= 3; i++) {
        await contract.connect(trader1).settleContract(i);
      }

      const marketInfo = await contract.getMarketInfo(CropType.WHEAT);
      expect(marketInfo.totalVolume).to.equal(3);
    });

    it("Should track market updates with timestamps", async function () {
      const newPrice = ethers.parseEther("1.5");
      const beforeUpdate = await time.latest();

      await contract.updateMarketPrice(CropType.WHEAT, newPrice);

      const marketInfo = await contract.getMarketInfo(CropType.WHEAT);
      expect(marketInfo.lastUpdated).to.be.gte(beforeUpdate);
    });
  });

  describe("Permission and Authorization", function () {
    it("Should enforce strict owner-only functions", async function () {
      const unauthorizedAccounts = [trader1, farmer1, trader2, farmer2, unauthorized];

      for (const account of unauthorizedAccounts) {
        await expect(
          contract.connect(account).updateMarketPrice(CropType.WHEAT, ethers.parseEther("1"))
        ).to.be.revertedWith("Not authorized");

        await expect(
          contract.connect(account).emergencyWithdraw()
        ).to.be.revertedWith("Not authorized");
      }
    });

    it("Should allow only contract parties to interact with their contracts", async function () {
      await contract.connect(trader1).depositBalance({ value: ethers.parseEther("10") });
      await contract.connect(trader1).createFuturesContract(
        farmer1.address, CropType.WHEAT, 100, ethers.parseEther("0.5")
      );

      // Unauthorized account cannot confirm
      await expect(
        contract.connect(unauthorized).confirmContract(1)
      ).to.be.revertedWith("Not a contract party");

      // Unauthorized account cannot cancel
      await expect(
        contract.connect(unauthorized).cancelContract(1, "Not authorized")
      ).to.be.revertedWith("Not a contract party");
    });
  });
});
