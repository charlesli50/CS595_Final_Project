const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Nirmaan", function () {
  let Nirmaan, nirmaan, token, owner, employer, employee;

  beforeEach(async function () {
    [owner, employer, employee] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockERC20");
    token = await Token.deploy();
    await token.waitForDeployment();

    Nirmaan = await ethers.getContractFactory("Nirmaan");
    nirmaan = await Nirmaan.deploy();
    await nirmaan.waitForDeployment();
  });

  it("should allow users to register", async function () {
    await nirmaan.connect(employer).registerUser();
    expect(await nirmaan.registeredUsers(employer.address)).to.be.true;
  });

  it("should create a contract", async function () {
    await nirmaan.connect(employer).registerUser();
    await nirmaan.connect(employee).registerUser();

    await token.transfer(employer.address, 10);
    await token.connect(employer).approve(nirmaan.target, 10);

    await nirmaan.connect(employer).createContract(
      employee.address,
      token.target,
      10, // totalDays
      1 // dailyWage
    );

    const workContract = await nirmaan.contracts(0);
    expect(workContract.employer).to.equal(employer.address);
    expect(workContract.employee).to.equal(employee.address);
  });

  it("should fail to create a contract if employer is not registered", async function () {
    await nirmaan.connect(employee).registerUser(); // Only employee registers
  
    await token.transfer(employer.address, 10);
    await token.connect(employer).approve(nirmaan.target, 10);
  
    await expect(
      nirmaan.connect(employer).createContract(
        employee.address,
        token.target,
        10,
        1
      )
    ).to.be.revertedWith("User not registered");
  });

  it("should fail to create a contract if employee is not registered", async function () {
    await nirmaan.connect(employer).registerUser(); // Only employer registers

    await token.transfer(employer.address, 10);
    await token.connect(employer).approve(nirmaan.target, 10);
  
    await expect(
      nirmaan.connect(employer).createContract(
        employee.address,
        token.target,
        10,
        1
      )
    ).to.be.revertedWith("Employee must be registered");
  });

  it("should allow employer to verify work and pay employee", async function () {
    await nirmaan.connect(employer).registerUser();
    await nirmaan.connect(employee).registerUser();
  
    await token.transfer(employer.address, 110); // 100 + 10% collateral
    await token.connect(employer).approve(nirmaan.target, 110);
  
    await nirmaan.connect(employer).createContract(
      employee.address,
      token.target,
      10, // totalDays
      10 // dailyWage
    );
  
    const employeeInitialBalance = await token.balanceOf(employee.address);
  
    await expect(
      nirmaan.connect(employer).verifyWork(0)
    ).to.emit(nirmaan, "PaymentReleased");
  
    const employeeNewBalance = await token.balanceOf(employee.address);
  
    expect(employeeNewBalance.sub(employeeInitialBalance)).to.equal(10);
  });
  
  it("should allow either party to raise a dispute", async function () {
    await nirmaan.connect(employer).registerUser();
    await nirmaan.connect(employee).registerUser();
  
    await token.transfer(employer.address, 110);
    await token.connect(employer).approve(nirmaan.target, 110);
  
    await nirmaan.connect(employer).createContract(
      employee.address,
      token.target,
      10,
      10
    );
  
    await expect(
      nirmaan.connect(employee).raiseDispute(0)
    ).to.emit(nirmaan, "DisputeRaised");
  
    const workContract = await nirmaan.contracts(0);
    expect(workContract.status).to.equal(2); // Disputed
  });

  it("should not allow unauthorized users to verify work", async function () {
    await nirmaan.connect(employer).registerUser();
    await nirmaan.connect(employee).registerUser();
  
    await token.transfer(employer.address, 110);
    await token.connect(employer).approve(nirmaan.target, 110);
  
    await nirmaan.connect(employer).createContract(
      employee.address,
      token.target,
      10,
      10
    );
  
    await expect(
      nirmaan.connect(employee).verifyWork(0)
    ).to.be.revertedWith("Only employer can verify");
  });
  
  it("should not allow non-owner to resolve dispute", async function () {
    await nirmaan.connect(employer).registerUser();
    await nirmaan.connect(employee).registerUser();
  
    await token.transfer(employer.address, 110);
    await token.connect(employer).approve(nirmaan.target, 110);
  
    await nirmaan.connect(employer).createContract(
      employee.address,
      token.target,
      10,
      10
    );
  
    await nirmaan.connect(employee).raiseDispute(0);
  
    await expect(
      nirmaan.connect(employer).resolveDispute(0, employee.address)
    ).to.be.revertedWith("Only owner");
  });
  

});
