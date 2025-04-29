# Setup for Debugging the project

The DApp still requires further debugging and testing, but the underlying contract should work by now. 

-- 

Initialize the Environment

1. Start up the Hardhat Node instances: ```npx hardhat node```
2. Recompile the project, in another terminal instance: ```npm run full```
3. Serve the DApp: ```npx serve nirmaan-dapp```

Take note of: 
- Accounts, and their private keys
- Contract Address of MockERC20(might be different per machine): ```0x5fbdb2315678afecb367f032d93f642f64180aa3```
- Contract Address of Nirmaan: ```0xe7f1725e7734ce288f8367e1bb143e90bb3f0512```

Open Metamask, and ensure you are on the localhost testnet(```Hardhat Localhost```)

-- 

Register the Employer

4. Through MetaMask: Log into Account #0 Using the provided private key from the Hardhat Node launch
5. Through the DApp, Connect your wallet and connect to the contact using the contracts address
6. Select: Register the current Address

-- 

Register the Employee

7. Through MetaMask: Log into Account #1(Or any another account) using the provided private keyf rom the Hardhat Node launch
8. Through the DApp, select ```Connect / Reconnect Wallet``` to connect through this second account
9. Select: Register the current Address

-- 


Initialize the contract

10. Through MetaMask: Switch back into Account #0(The Employers Account)
11. Through the DApp, select ```Connect / Reconnect Wallet``` to reconnect
12. Check if Employee is registered: Use Registration section, input Employee Address, select ```Check if Registered```
13. Use this Employee Address, Use MockERC20 Address, to Create Work Contract
14. List All Contracts



    
