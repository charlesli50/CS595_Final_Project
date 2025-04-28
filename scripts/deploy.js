const { ethers } = require("hardhat");
const { formatEther } = require("ethers"); // 🛠️ Import formatEther properly
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", formatEther(balance), "ETH"); // ✅ Use formatEther directly

  // Deploy MockERC20
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockERC20 = await MockERC20.deploy();
  await mockERC20.waitForDeployment();
  console.log("MockERC20 deployed to:", mockERC20.target);

  // Deploy Nirmaan
  const Nirmaan = await ethers.getContractFactory("Nirmaan");
  const nirmaan = await Nirmaan.deploy();
  await nirmaan.waitForDeployment();
  console.log("Nirmaan deployed to:", nirmaan.target);

  // Save addresses to deployed.json
  const deployments = {
    MockERC20: mockERC20.target,
    Nirmaan: nirmaan.target,
    network: await deployer.provider.getNetwork()
  };

  fs.writeFileSync("deployed.json", JSON.stringify(deployments, null, 2));
  console.log("Deployment details saved to deployed.json ✅");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
