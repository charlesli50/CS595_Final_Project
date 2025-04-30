# Project Setup

Initialize the Environment

1. Start up the Hardhat Node instances: ```npx hardhat node```
2. Recompile the project, in another terminal instance: ```npm run full```
3. Serve the DApp: ```npx serve nirmaan-dapp```

Take note of: 
- Accounts, and their private keys (You will need this for MetaMask)
- Contract Address of MockERC20(might be different per machine): ```0x5fbdb2315678afecb367f032d93f642f64180aa3```
- Contract Address of Nirmaan: ```0xe7f1725e7734ce288f8367e1bb143e90bb3f0512```
    - If, for whatever reason, either contract is not currently deployed or the address is not known, run "npx hardhat run scripts/deploy.js --network localhost". After completion, you should see the contract addresses in the log. 

Open Metamask, and ensure you are on the localhost testnet(```Hardhat Localhost```). To do so: 
- Open MetaMask and add a custom network. Then, add the following:
    -  Network name: Hardhat
    - Default RPC URL: 127.0.0.1:8545
    - ChainID: 31337
    - Currency Symbol: HardhatETH
- Once done, you can now switch over to the Hardhat network and add accounts via the private keys given to you by npx hardhat node

-- 

Register the Employer

4. Through MetaMask: Log into Account #0 Using the provided private key from the Hardhat Node launch. This account owns the ERC20 deployed contract which we deployed earlier, and thus, can create contracts using it. 
5. Through the DApp, connect to the contract via the Nirmaan contract address
6. Select: Register the current Address

-- 

Register the Employee

7. Through MetaMask: Log into Account #1 (Or any another account) using the provided private key from the Hardhat Node launch
8. Through the DApp, select ```Connect / Reconnect Wallet``` to connect through this second account and then click connect to contract via the Nirmaan contract address
9. Select: Register the current Address

-- 


Initialize the contract

10. Through MetaMask: Switch back into Account #0(The Employers Account with access to an ERC 20 token)
11. Through the DApp, select ```Connect / Reconnect Wallet``` to reconnect
12. Check if Employee is registered: Use Registration section, input Employee Address, select ```Check if Registered```
13. Use this Employee Address and the MockERC20 Address to create a work Contract
14. List All Contracts



    
