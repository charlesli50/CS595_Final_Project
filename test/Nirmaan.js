const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Nirmaan", function () {
  let nirmaan, token, owner, employer, employee, outsider;

  beforeEach(async function () {
    [owner, employer, employee, outsider] = await ethers.getSigners();

    // Deploy MockERC20
    const TokenFactory = await ethers.getContractFactory("MockERC20");
    token = await TokenFactory.deploy();
    await token.waitForDeployment();

    // Deploy Nirmaan
    const NirmaanFactory = await ethers.getContractFactory("Nirmaan");
    nirmaan = await NirmaanFactory.deploy();
    await nirmaan.waitForDeployment();

    // Register employer and employee via admin (owner)
    await nirmaan.connect(owner)["registerUser(address)"](employer.address);
    await nirmaan.connect(owner)["registerUser(address)"](employee.address);

    // Fund employer and approve
    await token.transfer(employer.address, 110);
    await token.connect(employer).approve(nirmaan.target, 110);

    // Employer creates a contract with employee
    await nirmaan.connect(employer).createContract(
      employee.address,
      token.target,
      10, // totalDays
      10  // dailyWage
    );
  });

//   it("should create a contract", async function () {
//     await token.transfer(employer.address, 110);
//     await token.connect(employer).approve(nirmaan.target, 110);
  
//     await expect(
//       nirmaan.connect(employer).createContract(
//         employee.address,
//         token.target,
//         10,
//         10
//       )
//     ).to.emit(nirmaan, "ContractCreated");
  
//     const workContract = await nirmaan.workContracts(1); // second contract
//     expect(workContract.employer).to.equal(employer.address);
//     expect(workContract.employee).to.equal(employee.address);
//   });
  

//   it("should fail to create a contract if employer is not registered", async function () {
//     await expect(
//       nirmaan.connect(outsider).createContract(
//         employee.address,
//         token.target,
//         10,
//         10
//       )
//     ).to.be.revertedWith("User not registered");
//   });

//   it("should fail to create a contract if employee is not registered", async function () {
//     await expect(
//       nirmaan.connect(employer).createContract(
//         outsider.address,
//         token.target,
//         10,
//         10
//       )
//     ).to.be.revertedWith("Employee must be registered");
//   });

//   it("should allow employer to verify work and pay employee", async function () {
//     const employeeInitialBalance = await token.balanceOf(employee.address);
  
//     await expect(
//       nirmaan.connect(employer).verifyWork(0)
//     ).to.emit(nirmaan, "PaymentReleased");
  
//     const employeeNewBalance = await token.balanceOf(employee.address);
//     expect(employeeNewBalance - employeeInitialBalance).to.equal(10n);
//   });
  

//   it("should allow either party to raise a dispute", async function () {
//     await expect(
//       nirmaan.connect(employee).raiseDispute(0)
//     ).to.emit(nirmaan, "DisputeRaised");

//     const workContract = await nirmaan.workContracts(0);
//     expect(workContract.status).to.equal(2); // Disputed
//   });

//   it("should not allow unauthorized users to verify work", async function () {
//     await expect(
//       nirmaan.connect(employee).verifyWork(0)
//     ).to.be.revertedWith("Only employer can verify");
//   });

//   it("should not allow non-owner to resolve dispute", async function () {
//     await nirmaan.connect(employee).raiseDispute(0);

//     await expect(
//       nirmaan.connect(employer).resolveDispute(0, employee.address)
//     ).to.be.revertedWith("Only owner");
//   });
});
