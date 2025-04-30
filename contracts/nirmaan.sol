// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Nirmaan {
    address public owner;

    enum ContractStatus { Active, Completed, Disputed, Resolved }

    struct WorkContract {
        address employer;
        address employee;
        IERC20 token;
        uint256 totalDays;
        uint256 dailyWage;
        uint256 verifiedDays;
        ContractStatus status;
    }

    uint256 public contractIdCounter;
    mapping(uint256 => WorkContract) public workContracts;
    mapping(address => bool) public registeredUsers;
    mapping(address => int) public reputation;

    event ContractCreated(uint256 indexed id, address indexed employer, address indexed employee, address token);
    event WorkVerified(uint256 indexed id, uint256 verifiedDays);
    event PaymentReleased(uint256 indexed id, address employee, uint256 amount);
    event DisputeRaised(uint256 indexed id);
    event DisputeResolved(uint256 indexed id, address winner);
    event RefundIssued(uint256 indexed id, address employer, uint256 amount);
    event CollateralBalance(address token, uint256 amount);
    event UserRegistered(address indexed user);

    modifier onlyRegistered() {
        require(registeredUsers[msg.sender], "User not registered");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function isRegistered(address user) external view returns (bool) {
        return registeredUsers[user];
    }


    function registerUser() external {
        require(!registeredUsers[msg.sender], "Already registered");
        registeredUsers[msg.sender] = true;
        emit UserRegistered(msg.sender);
    }

    function totalContracts() external view returns (uint256) {
        return contractIdCounter;
    }


    function registerUser(address user) external onlyOwner {
        require(!registeredUsers[user], "Already registered");
        registeredUsers[user] = true;
        emit UserRegistered(user);
    }

    

    function createContract(
        address employee,
        address tokenAddress,
        uint256 totalDays,
        uint256 dailyWage
    ) external onlyRegistered returns (uint256) {
        require(registeredUsers[employee], "Employee must be registered");
        require(totalDays > 0 && dailyWage > 0, "Invalid input");

        uint256 totalAmount = totalDays * dailyWage; 
        IERC20 token = IERC20(tokenAddress);

        require(token.transferFrom(msg.sender, address(this), totalAmount), "Initial payment failed");

        workContracts[contractIdCounter] = WorkContract({
            employer: msg.sender,
            employee: employee,
            token: token,
            totalDays: totalDays,
            dailyWage: dailyWage,
            verifiedDays: 0,
            status: ContractStatus.Active
        });

        emit ContractCreated(contractIdCounter, msg.sender, employee, tokenAddress);
        return contractIdCounter++;
    }

    function verifyWork(uint256 id) external onlyRegistered {
        WorkContract storage wc = workContracts[id];
        require(msg.sender == wc.employer, "Only employer can verify");
        require(wc.status == ContractStatus.Active, "Contract not active");
        require(wc.verifiedDays < wc.totalDays, "All days already verified");

        wc.verifiedDays++;

        emit WorkVerified(id, wc.verifiedDays);

        // Direct payment from contract to employee
        require(wc.token.transfer(wc.employee, wc.dailyWage), "Payment failed");
        emit PaymentReleased(id, wc.employee, wc.dailyWage);

        if (wc.verifiedDays == wc.totalDays) {
            wc.status = ContractStatus.Completed;

            // Reputation boost for successful contract
            reputation[wc.employee] += 1;
            reputation[wc.employer] += 1;
        }
    }

    function raiseDispute(uint256 id) external onlyRegistered {
        WorkContract storage wc = workContracts[id];
        require(msg.sender == wc.employer || msg.sender == wc.employee, "Not a contract participant");
        require(wc.status == ContractStatus.Active, "Contract not active");

        wc.status = ContractStatus.Disputed;
        emit DisputeRaised(id);
    }

    function resolveDispute(uint256 id, address winner) external onlyOwner {
        WorkContract storage wc = workContracts[id];
        require(wc.status == ContractStatus.Disputed, "Contract not disputed");
        require(winner == wc.employer || winner == wc.employee, "Invalid winner");

        uint256 balance = wc.token.balanceOf(address(this));
        require(wc.token.transfer(winner, balance), "Transfer failed");

        wc.status = ContractStatus.Resolved;
        emit DisputeResolved(id, winner);

        // Reputation adjustment based on dispute
        if (winner == wc.employee) {
            reputation[wc.employee] += 2;
            reputation[wc.employer] -= 1;
        } else {
            reputation[wc.employee] -= 1;
            reputation[wc.employer] += 2;
        }
    }

    function getContractBalance(address tokenAddress) external view returns (uint256) {
        IERC20 token = IERC20(tokenAddress);
        return token.balanceOf(address(this));
    }

	function getContract(uint256 id) external view returns (
    address employer,
    address employee,
    address token,
    uint256 totalDays,
    uint256 dailyWage,
    uint256 verifiedDays,
    ContractStatus status
) {
    WorkContract storage wc = workContracts[id];
    return (
        wc.employer,
        wc.employee,
        address(wc.token),
        wc.totalDays,
        wc.dailyWage,
        wc.verifiedDays,
        wc.status
    );
}

}
