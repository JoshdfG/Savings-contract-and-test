import { ethers } from "hardhat";
import { expect } from "chai";
import { ZB, SaveERC20 } from "../typechain-types";

describe("SaveEther Contract", function () {
  let saveEther: SaveERC20;
  let zb: ZB;

  beforeEach(async () => {
    const AddressZero = "0x0000000000000000000000000000000000000000";
    const initialOwner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    zb = await ethers
      .getContractFactory("ZB")
      .then((ZBFactory) => ZBFactory.deploy(initialOwner));

    saveEther = await ethers
      .getContractFactory("SaveERC20")
      .then((SaveERC20Factory) => SaveERC20Factory.deploy(zb.target));
  });

  describe("Deposit", function () {
    it("Should not be called by address zero", async () => {
      const [signer] = await ethers.getSigners();
      expect(signer.address).to.not.equal("AddressZero");
    });

    it("Should be reverted if the amount is 0", async () => {
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEther.connect(signer);

      await expect(connectedSaveErc20.deposit(0)).to.be.rejectedWith(
        "can't save zero value"
      );
    });

    it("Should revert if the user does not have enough tokens", async () => {
      const [signer, addr1] = await ethers.getSigners();
      const connectedSaveErc20 = saveEther.connect(addr1);
      const connectedTokenSigner1 = zb.connect(signer);

      await connectedTokenSigner1.transfer(addr1.address, 50);
      const connectedTokenSigner = zb.connect(addr1);
      await connectedTokenSigner.approve(saveEther.target, 100);

      await expect(connectedSaveErc20.deposit(100)).to.be.rejectedWith(
        "not enough token"
      );
    });

    it("Should Deposit properly", async function () {
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEther.connect(signer);
      const connectedTokenSigner = zb.connect(signer);

      await connectedTokenSigner.approve(saveEther.target, 200);
      await connectedSaveErc20.deposit(200);

      const contractBal = await connectedSaveErc20.checkContractBalance();
      expect(contractBal).to.equal(200);
    });

    it("Should add to the user's Savings", async () => {
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEther.connect(signer);
      const connectedTokenSigner = zb.connect(signer);

      await connectedTokenSigner.approve(saveEther.target, 200);
      await connectedSaveErc20.deposit(200);

      const userBal = await connectedSaveErc20.checkUserBalance(signer.address);
      expect(userBal).to.equal(200);
    });
  });

  describe("Withdraw", function () {
    it("Should not be called by address zero", async () => {
      const [signer] = await ethers.getSigners();
      expect(signer.address).to.not.equal("AddressZero");
    });

    it("Should be reverted if the amount is 0", async () => {
      const contractBal = await saveEther.checkContractBalance();
      expect(contractBal).to.not.be.undefined;
      console.log("Contract Balance:", contractBal.toString());
    });
  });

  describe("Check Balance", function () {
    it("should return contract balance", async function () {
      const contractBal = await saveEther.checkContractBalance();
      expect(contractBal).to.not.be.undefined;
      console.log("Contract Balance:", contractBal.toString());
    });
  });
});
