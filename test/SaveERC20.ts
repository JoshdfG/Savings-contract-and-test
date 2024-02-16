import { ethers } from "hardhat";
import { expect } from "chai";
import { ZB } from "../typechain-types";
import { SaveERC20 } from "../typechain-types";

describe("SaveEther Contract", function () {
  let saveEther: SaveERC20;
  let zb: ZB;

  beforeEach(async () => {
    const initialOwner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const ZB = await ethers.getContractFactory("ZB");
    zb = await ZB.deploy(initialOwner);
    const SaveERC20 = await ethers.getContractFactory("SaveERC20");
    saveEther = await SaveERC20.deploy(zb.target);
    const owner = initialOwner;
  });

  describe("Deposit", function () {
    it("Should not be called by address zero", async () => {
      const ZeroAddress = "0x0000000000000000000000000000000000000000";

      const [signer] = await ethers.getSigners();
      expect(signer.address).to.not.equal(ZeroAddress);
    });
    it("Should be reverted if the amount is 0", async () => {
      const amount = 0;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEther.connect(signer);
      await expect(connectedSaveErc20.deposit(amount)).to.be.rejectedWith(
        "can't save zero value"
      );
    });
    it("should revert if user does not have enough token", async () => {
      const amount = 100;
      const [signer, addr1] = await ethers.getSigners();
      const connectedSaveErc20 = saveEther.connect(addr1);
      const connectedTokenSigner1 = zb.connect(signer);
      await connectedTokenSigner1.transfer(addr1.address, 50);
      const connectedTokenSigner = zb.connect(addr1);
      await connectedTokenSigner.approve(saveEther.target, amount);

      await expect(connectedSaveErc20.deposit(amount)).to.be.rejectedWith(
        "not enough token"
      );
    });
    it(" it should Deposit properly", async function () {
      const amount = 200;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEther.connect(signer);
      const connectedTokenSigner = zb.connect(signer);
      await connectedTokenSigner.approve(saveEther.target, amount);
      await connectedSaveErc20.deposit(amount);
      const contractBal = await connectedSaveErc20.checkContractBalance();
      expect(contractBal).to.equal(amount);
    });
    it("Should add to the users Savings", async () => {
      const depositamount = 200;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEther.connect(signer);
      const connectedTokenSigner = zb.connect(signer);
      await connectedTokenSigner.approve(saveEther.target, depositamount);
      await connectedSaveErc20.deposit(depositamount);
      const userBal = await connectedSaveErc20.checkUserBalance(signer.address);
      expect(userBal).to.equal(depositamount);
    });
  });

  describe("Withdraw", function () {
    it("Should not be called by address zero", async () => {
      const ZeroAddress = "0x0000000000000000000000000000000000000000";

      const [signer] = await ethers.getSigners();
      expect(signer.address).to.not.equal(ZeroAddress);
    });
    it("Should be reverted if the amount is 0", async () => {
      const amount = 0;
      const [signer] = await ethers.getSigners();

      describe("Check Balance", function () {
        it("should return contract balance", async function () {
          const contractBal = await saveEther.checkContractBalance();
          expect(contractBal).to.not.be.undefined;
          console.log("Contract Balance:", contractBal.toString());
        });
      });
    });
  });
});
