// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Nirmaan {
    address public owner;

    enum ContractStatus { Active, Completed, Disputed }

    struct WorkContract {
        address employer;
        address employee;
        IERC20 token;
        uint256 totalDays;
        uint256 dailyWage;
        uint256 verifiedDays;
        uint256 totalAmountDeposited;
        ContractStatus status;
    }

    uint256 public contractIdCounter;
    mapping(uint256 => WorkContract) public contracts;
    mapping(address => bool) public registeredUsers;
    mapping(address => int) public reputation;

    event ContractCreated(uint256 indexed id, address indexed employer, address indexed employee, address token);
    event WorkVerified(uint256 indexed id, uint256 verifiedDays);
    event PaymentReleased(uint256 indexed id, address employee, uint256 amount);
    event DisputeRaised(uint256 indexed id);
    event RefundIssued(uint256 indexed id, address employer, uint256 amount);
    event CollateralBalance(address token, uint256 amount);
    event UserRegistered(address indexed user);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyRegistered() {
        require(registeredUsers[msg.sender], "User not registered");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    function registerUser() external {
        require(!registeredUsers[msg.sender], "Already registered");
        registeredUsers[msg.sender] = true;
        emit UserRegistered(msg.sender);
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

        uint256 totalAmount = (totalDays * dailyWage * 110) / 100;
        IERC20 token = IERC20(tokenAddress);

        require(token.transferFrom(msg.sender, address(this), totalAmount), "Initial payment failed");

        contracts[contractIdCounter] = WorkContract({
            employer: msg.sender,
            employee: employee,
            token: token,
            totalDays: totalDays,
            dailyWage: dailyWage,
            verifiedDays: 0,
            totalAmountDeposited: totalAmount,
            status: ContractStatus.Active
        });

        emit ContractCreated(contractIdCounter, msg.sender, employee, tokenAddress);
        return contractIdCounter++;
    }

    function verifyWork(uint256 id) external onlyRegistered {
        WorkContract storage wc = contracts[id];
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

            // Refund the remaining 10% collateral to employer
            uint256 usedAmount = wc.totalDays * wc.dailyWage;
            uint256 refundAmount = wc.totalAmountDeposited - usedAmount;
            if (refundAmount > 0) {
                require(wc.token.transfer(wc.employer, refundAmount), "Refund failed");
                emit RefundIssued(id, wc.employer, refundAmount);
            }
        }
    }

    function raiseDispute(uint256 id) external onlyRegistered {
        WorkContract storage wc = contracts[id];
        require(msg.sender == wc.employer || msg.sender == wc.employee, "Not a contract participant");
        require(wc.status == ContractStatus.Active, "Contract not active");
        wc.status = ContractStatus.Disputed;

        emit DisputeRaised(id);
    }

    function getContractBalance(address tokenAddress) external {
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        emit CollateralBalance(tokenAddress, balance);
    }
} 
