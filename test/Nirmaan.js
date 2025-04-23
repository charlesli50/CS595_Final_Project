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

});
