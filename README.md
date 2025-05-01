# Nirmaan: CS595 Final Project

Presentation date: May 1st, 2025

Members:

- Prathmesh Sonawane
- Tien Le
- Charles Li
- Declan Young

---

## Intro 
We aim to construct an immutable, blockchain-based "source of truth" for work agreements, enabled by a smart-contract that automates payments when work hours have been fulfilled.

A Smart Contract that has:
- Sign-Up System: Allow workers and contractors to sign-up while preventing identity duplication
- Contract Creation: Allow contracts to be made, specifying #days and $/day
- Automated Payment: Instantly pay workers when #days worked is verified

--- 

## Demo Setup

To run and test our solitiy contract implementation, we deploy on a local Hardhat blockchain test network, an Ethereum testnet development environment. We similarly utilize a Mock ERC20 Implemntation, but when deployed on a real-world chain, any ERC20 token could be used as payment. 

### To start, initialize the environment: 

1. Start up the Hardhat Node instances: `npx hardhat node`
2. Recompile the project, in another terminal instance: `npm run full`
3. Serve the DApp: `npx serve nirmaan-dapp`

Take note of:

- Accounts, and their private keys (You will need this for MetaMask)
- Contract Address of MockERC20(might be different per machine): `0x5fbdb2315678afecb367f032d93f642f64180aa3`
- Contract Address of Nirmaan: `0xe7f1725e7734ce288f8367e1bb143e90bb3f0512`
  - If, for whatever reason, either contract is not currently deployed or the address is not known, run "npx hardhat run scripts/deploy.js --network localhost". After completion, you should see the contract addresses in the log.

Open Metamask, and ensure you are on the localhost testnet(`Hardhat Localhost`). To do so:

- Open MetaMask and add a custom network. Then, add the following:
  - Network name: Hardhat
  - Default RPC URL: 127.0.0.1:8545
  - ChainID: 31337
  - Currency Symbol: HardhatETH
- Once done, you can now switch over to the Hardhat network and add accounts via the private keys given to you by npx hardhat node

#### Register the Employer

4. Through MetaMask: Log into Account #0 Using the provided private key from the Hardhat Node launch. This account owns the ERC20 deployed contract which we deployed earlier, and thus, can create contracts using it.
5. Through the DApp, connect to the contract via the Nirmaan contract address
6. Select: Register the current Address


#### Register the Employee

7. Through MetaMask: Log into Account #1 (Or any another account) using the provided private key from the Hardhat Node launch
8. Through the DApp, select `Connect / Reconnect Wallet` to connect through this second account and then click connect to contract via the Nirmaan contract address
9. Select: Register the current Address

#### Initialize the contract

10. Through MetaMask: Switch back into Account #0(The Employers Account with access to an ERC 20 token)
11. Through the DApp, select `Connect / Reconnect Wallet` to reconnect
12. Check if Employee is registered: Use Registration section, input Employee Address, select `Check if Registered`
13. Use this Employee Address and the MockERC20 Address to create a work Contract
14. As an Employer: Pay the employee by selecting : `Employer: Verify Work`
15. As an Employee: Contest the employer by selecting : `Employee: Raise Dispute`


## Environment Notes

Tested on:
- NPM 10.9.2

--- 

## Post Presentation Questions

### 1. Zero Knowledge Proofs (ZPKs) for Privacy in Labor Contracts:


#### a. Goal: 

Workers can prove they worked or that a contract was fulfilled without revealing their wallet address, employer, terms, or wage.


#### b. Use cases in Nirmaan:

**1. Protect Employee Identity**
   
- A worker wants to prove they completed a task, but does not want to reveal who they are (e.g., whistleblower, political risk).

- They submit a ZK proof that they are in a Merkle tree of valid workers and have completed work, no identity revealed.

**2. Conceal Contractor Terms**
- Contractors offering different wages to different workers can maintain confidentiality.

- The ZK proof validates a payout amount without disclosing wage, work duration, or contract ID.

**3. Anonymous Whistleblowing**
- A worker can prove they were part of a contract where wage theft or abuse occurred.

- Their proof confirms participation and eligibility, but keeps the worker and contractor anonymous.


#### c. Who Proves What To Whom?

| Role           | Proves                                     | To Whom         | Without Revealing              |
|----------------|---------------------------------------------|------------------|--------------------------------|
| **Worker**     | That they completed valid work              | Smart contract   | Wallet, contract, wage         |
| **Employer**   | That payment pool was pre-funded properly   | Smart contract or DAO | Wage breakdown, recipient mapping |
| **Whistleblower** | That they were part of a contract with dispute | Admin/DAO       | Their identity or work record  |


#### d. Private vs Public Information:

| Data | Public | Private (via ZK) |
|------|--------|------------------|
| Merkle root (tree)| ✅|
| Contract existence | ✅ |  
| Work was completed | ✅ |  
| Who completed it | ❌ | ✅  
| Terms (daily wage, bonus, etc.) | ❌ | ✅  
| Wallet used to verify | ❌ | ✅  
| Reputation score | ✅ |


#### e. Basic Implementation:

- Step 1: System adds workers' hashes `hash(secret || nullifier)` into a Merkle tree of eligible claimants

- Step 2: Worker generates a ZK-SNARK proving: They know a secret value in the tree and They haven’t claimed before (nullifier check)

- Step 3: Worker submits the ZK proof and a fresh address to receive payment

- Step 4: Smart contract verifies the proof + nullifier

- Step 5: If valid, payment is sent — identity never revealed


#### f. Example:

*A worker completes a task. Instead of calling ` verifyWork()` from their public wallet:*

- They create a ZK proof: “I am a registered worker (in Merkle tree root X), and I am eligible to claim.”

- They include a nullifier (prevents double-claiming) and a fresh address.

- The smart contract verifies and sends payment to the new address.

- Their real identity stays private, but the payment flow is verifiable.


#### g. Challenges:

- New One-Time Stealth Address: The worker can generate a fresh Ethereum keypair and uses that to receive payment. However, wallet management can get tricky.

- Full anonymity can cross into grey areas, especially if fund flows are untraceable

- Hiding employee identity + income: Could be used to avoid taxes, labor protections

  
#### h. Possible solutions:

- Make wallet usage transparent, but hide sensitive metadata (wage, bonus, history)
  
- Add rate limits, claim logs, or even optional KYC. This helps prevent spam or abuse from anonymous users, reusing proofs, etc. Claim logs (“A valid proof was submitted at timestamp X for contract Y”) can show transparency of claims, let DAOs or admins monitor usage patterns and prove system integrity without exposing identities.


### 2. On-chain Reputation System


#### a. **Goal:**

To create a **decentralized, tamper-proof, and transparent** reputation system for workers and employers based on **their contract activity**, **dispute outcomes**, and **performance metrics**.

Freelancers don't need a resume, LinkedIn profile, or testimonials. Their work history, success rate, dispute outcomes, and even timeliness are verifiable on-chain. Employers can trust new users immediately based on provable metrics, not vague bios

#### b. **Use Cases in Nirmaan:**


**1. Build Trust Between New Users**  
- Workers with high reputation are more likely to be hired  
- Employers with positive history attract better workers  

**2. Automate Decisions & Scoring**  
- Use reputation scores to:
  - Auto-approve microtasks  
  - Slash bad actors  
  - Filter high-risk disputes

**3. Prevent Repeat Offenders**  
- Employers who frequently lose disputes could be flagged  
- Workers who abandon contracts may face limits


#### c. **Who Evaluates What?**

| Role         | Reputation Earned For                     | Based On…                          |
|--------------|--------------------------------------------|-------------------------------------|
| **Worker**   | Completing contracts successfully          | # of verified workdays, task success |
|              | Winning disputes fairly                   | Resolution history                 |
| **Employer** | Paying fully, on time                     | Verified wage payments             |
|              | Treating employees fairly                 | Dispute ratios, worker feedback    |


#### d. **Basic Implementation Steps**

1. **Initialize Rep Scores:**
   - Everyone starts at 0 (neutral baseline)

2. **Update Reputation via Contract Events:**
   - On work completion → `reputation[worker] += 1`
   - On dispute win → `reputation[winner] += 2`, loser gets penalized

3. **Expose Read Functions:**
   - `getReputation(address user)` → public view
   - Optional: add `getReputationBreakdown(user)` for transparency

4. **Use in App Logic:**
   - UI shows “Trusted” badge
   - Employer dashboard shows candidate history
  
5. **Additional metrics:**

| Feature | Description |
|---------|-------------|
| Task-based scoring | Score increases per verified contract, weighted by size  
| Dispute penalty | Score drops if the user consistently disputes or loses  
| Peer review | Add endorsements or downvotes (like Reddit karma)  
| Decay over time | Old behavior has less weight  


### e. **Example:**

*A worker completes 5 tasks with 0 disputes:* **+5** to their reputation  

*They then win a dispute:* **+2** more. Their total score is now **7**

*An employer who lost 2 disputes* **-2** points. Marked as “At Risk” in listings

### f. **Reputation System Overview**

| Feature                   | Status  |
|---------------------------|---------|
| On-chain storage          | ✅      |
| Public read access        | ✅      |
| Reputation growth rules   | ✅      |
| DAO / human override      | Optional fallback for appeals |

