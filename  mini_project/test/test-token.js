const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BEP20 sample token", () => {
  let [accountA, accountB, accountC] = [];
  let token;
  const amount = 100;
  const totalSupply = 1000000;

  beforeEach(async () => {
    [accountA, accountB, accountC] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("SampleToken");

    token = await Token.deploy();
    await token.deployed();
  });

  describe("common", () => {
    it("Total supply should return right value", async () => {
      expect(await token.totalSupply()).to.be.equal(totalSupply);
    });

    it("Balance of accountA should return right value", async () => {
      expect(await token.balanceOf(accountA.address)).to.be.equal(totalSupply);
    });

    it("Balance of accountB should return right value", async () => {
      expect(await token.balanceOf(accountB.address)).to.be.equal(0);
    });

    it("Allowance of accountA to accountB should return right value", async () => {
      expect(
        await token.allowance(accountA.address, accountB.address)
      ).to.be.equal(0);
    });
  });

  describe("transfer", () => {
    it("Transfer should revert if amount exceeds balance", async () => {
      await expect(token.transfer(accountB.address, totalSupply + 1)).to.be
        .reverted;
    });

    it("Transfer should work correctly", async () => {
      const transferTx = await token.transfer(accountB.address, amount);

      expect(await token.balanceOf(accountA.address)).to.be.equal(
        totalSupply - amount
      );
      expect(await token.balanceOf(accountB.address)).to.be.equal(amount);

      await expect(transferTx)
        .to.emit(token, "Transfer")
        .withArgs(accountA.address, accountB.address, amount);
    });
  });

  describe("transferFrom", () => {
    it("Transfer from should revert if amount exceeds balance", async () => {
      await expect(
        token
          .connect(accountB)
          .transferFrom(accountA.address, accountC.address, totalSupply + 1)
      ).to.be.reverted;
    });

    it("Transfer from should revert if amount exceeds allowance", async () => {
      await expect(
        token
          .connect(accountB)
          .transferFrom(accountA.address, accountC.address, amount)
      ).to.be.reverted;
    });

    it("Transfer from should working correctly", async () => {
      await token.approve(accountB.address, amount);
      const transferFromTx = await token
        .connect(accountB)
        .transferFrom(accountA.address, accountC.address, amount);

      expect(await token.balanceOf(accountA.address)).to.be.equal(
        totalSupply - amount
      );
      expect(await token.balanceOf(accountC.address)).to.be.equal(amount);
      await expect(transferFromTx)
        .to.emit(token, "Transfer")
        .withArgs(accountA.address, accountC.address, amount);
    });
  });

  describe("approve", () => {
    it("Approve should work correctly", async () => {
      const approveTx = await token.approve(accountB.address, amount);

      expect(
        await token.allowance(accountA.address, accountB.address)
      ).to.be.equal(amount);
      await expect(approveTx)
        .to.emit(token, "Approval")
        .withArgs(accountA.address, accountB.address, amount);
    });
  });
});
