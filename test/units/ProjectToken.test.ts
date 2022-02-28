import {expect} from "chai";
import {ethers} from "hardhat";
import {Contract} from "ethers";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";

export function likeProjectToken(): void {

  describe("- Project Token SC", function () {
    let projectToken: Contract;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
    let addr3: SignerWithAddress;
    
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

    beforeEach(async () => {
      this.ctx.signers = await ethers.getSigners();
      [owner, addr1, addr2, addr3] = this.ctx.signers;

      /// Test Project Coin Deploy
      const ProjectCoinFactory = await ethers.getContractFactory("ProjectCoin", owner);
      const projectCoin = await ProjectCoinFactory.deploy("Test Project Coin", "TPC", 1000000 * 10 ^ 18);
      await projectCoin.deployed();
      //console.log('Project Coin Deployed At: ', projectCoin.address);

      /// Test Project Token Deploy
      const ProjectTokenFactory = await ethers.getContractFactory("ProjectToken", owner);
      projectToken = await ProjectTokenFactory.deploy("Test Project Token", "TETHERP");
      await projectToken.deployed();

    });

    describe("1. Ownership", async function () {

      it("1.1 Verify that the crowdfunding contract is the admin", async function () {
        expect(await projectToken.owner()).to.eq(owner.address);
      });
    });

    describe("2. Mint", async function () {
      it("2.1 Succeeds when the crowdfunding contract mints token", async function () {
        await expect(projectToken.mint(addr1.address, 1000)).to.emit(projectToken, 'Transfer').withArgs(ZERO_ADDRESS, addr1.address, 1000);
        expect(await projectToken.balanceOf(addr1.address)).to.eq(1000);
      });

      it("2.4 Fails when other address mints token", async function () {
        await expect(projectToken.connect(addr1).mint(addr2.address, 1000)).to.be.revertedWith('Ownable: caller is not the owner');
      });

      it("2.5 Fails when zero tokens minted", async function () {
        await expect(projectToken.mint(addr1.address, 0)).to.be.revertedWith('ERC20: mint amount zero');
      });
    });

    describe("3. Burn", async function () {
      beforeEach(async () => {
        await projectToken.mint(owner.address, 1000);
        await projectToken.mint(addr1.address, 1000);

      });

      it("3.1 Succeeds when the crowdfunding contract burns token", async function () {
        await expect(projectToken.burn(100)).to.be.emit(projectToken, 'Transfer').withArgs(owner.address, ZERO_ADDRESS, 100);
        expect(await projectToken.balanceOf(owner.address)).to.eq(900);
      });

      it("3.4 Fails when other address burns token", async function () {
        await expect(projectToken.connect(addr1).burn(100)).to.be.revertedWith('Ownable: caller is not the owner');
      });

      it("3.5 Fails when zero tokens burnt", async function () {
        await expect(projectToken.burn(0)).to.be.revertedWith('ERC20: burn amount zero');
      });
    });

    describe("4. Transfer", async function () {
      beforeEach(async () => {
        await projectToken.mint(owner.address, 1000);
        await projectToken.mint(addr1.address, 1000);
      });

      it("4.1 Check it is deactivated", async function () {
        await expect(projectToken.connect(addr1).transfer(addr2.address, 100)).to.be.revertedWith('Ownable: caller is not the owner');

        await expect(projectToken.transfer(addr1.address, 100)).to.be.emit(projectToken, 'Transfer').withArgs(owner.address, addr1.address, 100);
        expect(await projectToken.balanceOf(owner.address)).to.eq(900);
        expect(await projectToken.balanceOf(addr1.address)).to.eq(1100);
      });
    });

    describe("5. TransferFrom", async function () {
      beforeEach(async () => {
        await projectToken.mint(owner.address, 1000);
        await projectToken.mint(addr1.address, 1000);
      });

      it("5.1 Check it is deactivated", async function () {
        await projectToken.approve(addr1.address, 100);
        await expect(projectToken.connect(addr1).transferFrom(owner.address, addr2.address, 100)).to.be.revertedWith('Ownable: caller is not the owner');

        await projectToken.connect(addr1).approve(owner.address, 100);
        await expect(projectToken.transferFrom(addr1.address, addr2.address, 100)).to.be.emit(projectToken, 'Transfer').withArgs(addr1.address, addr2.address, 100);
        expect(await projectToken.balanceOf(addr1.address)).to.eq(900);
        expect(await projectToken.balanceOf(addr2.address)).to.eq(100);
      });
    });

    describe("6. Approve", async function () {
      beforeEach(async () => {
        await projectToken.mint(owner.address, 1000);
      });

      it("6.1 Check it is deactivated", async function () {
        await expect(projectToken.connect(addr1).transferFrom(owner.address, addr2.address, 100)).to.be.revertedWith('Ownable: caller is not the owner');
      });
    });
  });
}