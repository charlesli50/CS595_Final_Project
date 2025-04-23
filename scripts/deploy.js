const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MockERC20
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockERC20 = await MockERC20.deploy();
  const deployedMock = await mockERC20.waitForDeployment();
  console.log("MockERC20 deployed to:", deployedMock.target);

  // Deploy Nirmaan
  const Nirmaan = await ethers.getContractFactory("Nirmaan");
  const nirmaan = await Nirmaan.deploy();
  const deployedNirmaan = await nirmaan.waitForDeployment();
  console.log("Nirmaan deployed to:", deployedNirmaan.target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
