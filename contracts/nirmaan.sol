// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
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

    constructor() {
        owner = msg.sender;
    }

    modifier onlyRegistered() {
        require(registeredUsers[msg.sender], "User not registered");
        _;
    }

    function registerUser() external {
        require(!registeredUsers[msg.sender], "Already registered");
        registeredUsers[msg.sender] = true;
    }

    function createContract(
        address employee,
        address tokenAddress,
        uint256 totalDays,
        uint256 dailyWage
    ) external onlyRegistered returns (uint256) {
        require(registeredUsers[employee], "Employee must be registered");

        contracts[contractIdCounter] = WorkContract({
            employer: msg.sender,
            employee: employee,
            token: IERC20(tokenAddress),
            totalDays: totalDays,
            dailyWage: dailyWage,
            verifiedDays: 0,
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

        // Automatic payment
        require(wc.token.transferFrom(wc.employer, wc.employee, wc.dailyWage), "Payment failed");

        if (wc.verifiedDays == wc.totalDays) {
            wc.status = ContractStatus.Completed;
        }
    }

    function raiseDispute(uint256 id) external onlyRegistered {
        WorkContract storage wc = contracts[id];
        require(msg.sender == wc.employer || msg.sender == wc.employee, "Not a contract participant");
        require(wc.status == ContractStatus.Active, "Contract not active");
        wc.status = ContractStatus.Disputed;

        emit DisputeRaised(id);
    }
}
