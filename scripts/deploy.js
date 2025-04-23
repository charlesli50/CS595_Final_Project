const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy MockERC20 contract
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockERC20 = await MockERC20.deploy();
    await mockERC20.waitForDeployment();
    console.log("MockERC20 deployed to:", mockERC20.address);

    // Deploy Nirmaan contract
    const Nirmaan = await ethers.getContractFactory("Nirmaan");
    const nirmaan = await Nirmaan.deploy();
    await nirmaan.waitForDeployment();
    console.log("Nirmaan deployed to:", nirmaan.address);

    return { mockERC20Address: mockERC20.address, nirmaanAddress: nirmaan.address };
}

// Call the deploy function and handle any errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });