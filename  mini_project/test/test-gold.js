const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GOLD", () => {
  let [accountA, accountB, accountC] = [];
  let token;
  const amount = ethers.utils.parseUnits("100", "ether");
  const totalSupply = ethers.utils.parseUnits("1000000", "ether");

  beforeEach(async () => {
    const Token = await ethers.getContractFactory("Gold");

    [accountA, accountB, accountC] = await ethers.getSigners();
    token = await Token.deploy();
    await token.deployed();
  });

  describe("common", () => {
    it("Total supply should return right value", async () => {
      expect(await token.totalSupply()).to.be.equal(totalSupply);
    });

    it("Balance of account A should return right value", async () => {
      expect(await token.balanceOf(accountA.address)).to.be.equal(totalSupply);
    });

    it("Balance of account B should return right value", async () => {
      expect(await token.balanceOf(accountB.address)).to.be.equal(0);
    });

    it("Balance of account C should return right value", async () => {
      expect(await token.balanceOf(accountC.address)).to.be.equal(0);
    });
  });

  describe("pause()", () => {
    it("Should revert if account do not have role pause", async () => {
      await expect(token.connect(accountB).pause()).to.be.reverted;
    });

    it("Should revert if contract has been paused", async () => {
      await token.pause();
      await expect(token.pause()).to.be.reverted;
    });

    it("Should working correctly", async () => {
      const pauseTx = await token.pause();

      await expect(pauseTx)
        .to.be.emit(token, "Paused")
        .withArgs(accountA.address);
      await expect(token.transfer(accountB.address, amount)).to.be.revertedWith(
        "Pausable: paused"
      );
    });
  });

  describe("unpaused()", () => {
    beforeEach(async () => {
      await token.pause();
    });

    it("Should revert if account do not have role pause", async () => {
      await expect(token.connect(accountB).pause()).to.be.reverted;
    });

    it("Should revert if contract has been unpaused", async () => {
      await token.unpause();
      await expect(token.unpause()).to.be.revertedWith("Pausable: not paused");
    });

    it("Should working correctly", async () => {
      const unpauseTx = await token.unpause();

      await expect(unpauseTx)
        .to.be.emit(token, "Unpaused")
        .withArgs(accountA.address);

      const transferTx = await token.transfer(accountB.address, amount);

      await expect(transferTx)
        .to.be.emit(token, "Transfer")
        .withArgs(accountA.address, accountB.address, amount);
    });
  });

  describe("addToBlackList()", () => {
    it("Should revert if account do not have role admin", async () => {
      await expect(token.connect(accountB).addToBlackList(accountA.address)).to
        .be.reverted;
    });

    it("Should revert if account is msg.sender", async () => {
      await expect(token.addToBlackList(accountA.address)).to.be.reverted;
    });

    it("Should revert if account on blacklist", async () => {
      await token.addToBlackList(accountB.address);
      await expect(token.addToBlackList(accountB.address)).to.be.reverted;
    });

    it("Should working correctly", async () => {
      const addToBlackListTx = await token.addToBlackList(accountB.address);

      await token.addToBlackList(accountC.address);

      await expect(addToBlackListTx)
        .to.be.emit(token, "BlacklistAdded")
        .withArgs(accountB.address);

      await expect(
        token.connect(accountB).transfer(accountC.address, amount)
      ).to.be.revertedWith("Gold: Account sender was on blacklist");

      await expect(token.transfer(accountC.address, amount)).to.be.revertedWith(
        "Gold: Account recipent was on blacklist"
      );
    });
  });

  describe("removeFromBlackList()", () => {
    beforeEach(async () => {
      await token.transfer(accountB.address, amount);
      await token.transfer(accountC.address, amount);
      await token.addToBlackList(accountB.address);
    });

    it("Should revert if account do not have role admin", async () => {
      await expect(
        token.connect(accountC).removeFromBlackList(accountB.address)
      ).to.be.reverted;
    });

    it("Should revert if account not on blacklist", async () => {
      await token.removeFromBlackList(accountB.address);
      await expect(
        token.removeFromBlackList(accountB.address)
      ).to.be.revertedWith("Gold: Account was not on blacklist");
    });

    it("Should working correctly", async () => {
      const removeFromBlackListTx = await token.removeFromBlackList(
        accountB.address
      );
      const transferTx = await token.transfer(accountB.address, amount);

      await expect(removeFromBlackListTx)
        .to.emit(token, "BlacklistRemove")
        .withArgs(accountB.address);
      await expect(transferTx)
        .to.emit(token, "Transfer")
        .withArgs(accountA.address, accountB.address, amount);
    });
  });
});
