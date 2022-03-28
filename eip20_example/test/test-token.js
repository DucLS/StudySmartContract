const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("EIP20 sample token", function() {
    let [accountA, accountB, accountC] = [];
    let token;
    let amount = 100;
    let totalSupply = 1000000;

    beforeEach(async() => {
        [accountA, accountB, accountC] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("SampleToken");

        token = await Token.deploy();
        await token.deployed();
    })

    describe("common function", function() {
        it("Return total supply", async function() {
            expect(await token.totalSupply()).to.equal(totalSupply);
        })

        it("Return balance account A", async function() {
            expect(await token.balanceOf(accountA.address)).to.equal(totalSupply);
        })

        it("Return balance account B", async function() {
            expect(await token.balanceOf(accountB.address)).to.equal(0);
        })

        it("Return balance account C", async function() {
            expect(await token.balanceOf(accountC.address)).to.equal(0);
        })

        it("Return allowance of account A to account B", async function() {
            await token.approve(accountB.address, amount);

            expect(await token.allowance(accountA.address, accountB.address)).to.equal(100);
        })
    })

    describe("transfer function", function() {
        it("If balance account A not enough", async () => {
            await expect(token.transfer(accountB.address, totalSupply + 1)).to.be.revertedWith('Your insufficient not enough');
        })

        it("If balance account A enough", async () => {
            let transferTx = await token.transfer(accountB.address, amount);

            expect(await token.balanceOf(accountA.address)).to.equal(totalSupply - amount);
            expect(await token.balanceOf(accountB.address)).to.equal(amount);
            await expect(transferTx).to.emit(token, 'Transfer').withArgs(accountA.address, accountB.address, amount);
        })
    })

    describe("transferFrom function", function() {
        it("transferFrom should revert if amount exceeds balance", async () => {
            await expect(token.connect(accountB).transferFrom(accountA.address, accountC.address, totalSupply + 1)).to.be.reverted;
        });

        it("transferFrom should revert if amount exceeds allowance amount", async () => {
            await expect(token.connect(accountB).transferFrom(accountA.address, accountC.address, totalSupply)).to.be.reverted;
        })

        it("transferFrom works correctly", async () => {
            await token.approve(accountB.address, amount);
            let transferFromTx = await token.connect(accountB).transferFrom(accountA.address, accountC.address, amount);

            expect(await token.balanceOf(accountA.address)).to.equal(totalSupply - amount);
            expect(await token.allowance(accountA.address, accountB.address)).to.equal(amount);
            expect(await token.balanceOf(accountC.address)).to.equal(amount);
            await expect(transferFromTx).to.emit(token, 'Transfer').withArgs(accountA.address, accountC.address, amount);
        })
    })

    describe("approve function", function() {
        it("approve should work correctly", async () => {
            let approveTx = await token.approve(accountB.address, amount);

            await expect(approveTx).to.emit(token, 'Approval').withArgs(accountA.address, accountB.address, amount);
            expect(await token.allowance(accountA.address, accountB.address)).to.equal(amount);
        })
    })
})
