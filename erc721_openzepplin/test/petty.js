const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Petty NFT", () => {
  let [accountA, accountB, accountC] = [];
  let petty;
  const address0 = "0x0000000000000000000000000000000000000000";
  const uri = "sampleuri.com/";

  beforeEach(async () => {
    [accountA, accountB, accountC] = await ethers.getSigners();
    const Petty = await ethers.getContractFactory("Petty");
    petty = await Petty.deploy();
    await petty.deployed();
  });

  describe("mint", () => {
    it("Should revert if mint to zero address", async () => {
      await expect(petty.mint(address0)).to.revertedWith(
        "ERC721: mint to the zero address"
      );
    });

    it("Should mint token correctly", async () => {
      const mintTx = await petty.mint(accountA.address);

      await expect(mintTx)
        .to.emit(petty, "Transfer")
        .withArgs(address0, accountA.address, 1);
      expect(await petty.balanceOf(accountA.address)).to.equal(1);
      expect(await petty.ownerOf(1)).to.equal(accountA.address);

      const mintTx2 = await petty.mint(accountA.address);
      await expect(mintTx2)
        .to.emit(petty, "Transfer")
        .withArgs(address0, accountA.address, 2);
      expect(await petty.balanceOf(accountA.address)).to.equal(2);
      expect(await petty.ownerOf(2)).to.equal(accountA.address);
    });
  });

  describe("updateBaseTokenURI", () => {
    it("Should update Base Token URI correctly", async () => {
      await petty.mint(accountA.address);
      await petty.updateBaseTokenURI(uri);

      expect(await petty.tokenURI(1)).to.be.equal(uri + "1");
    });
  });
});
