let provider, signer, contract;

const abi = [
  "function registerUser() public",
  "function createContract(address employee, address token, uint256 totalDays, uint256 dailyWage) public returns (uint256)",
  "function verifyWork(uint256 id) public",
  "function raiseDispute(uint256 id) public",
];

async function connectContract() {
  if (!window.ethereum) return alert("Please install MetaMask.");

  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();

  const address = document.getElementById("contractAddress").value;
  contract = new ethers.Contract(address, abi, signer);

  alert("Contract connected!");
}

async function register() {
  const tx = await contract.registerUser();
  await tx.wait();
  alert("User registered!");
}

async function createWorkContract() {
  const emp = document.getElementById("employeeAddress").value;
  const token = document.getElementById("tokenAddress").value;
  const tx = await contract.createContract(emp, token, 5, 20); // 5 days, 20 tokens/day
  await tx.wait();
  alert("Work contract created.");
}

async function verifyWork() {
  const id = document.getElementById("contractId").value;
  const tx = await contract.verifyWork(Number(id));
  await tx.wait();
  alert("Work verified.");
}

async function raiseDispute() {
  const id = document.getElementById("contractId").value;
  const tx = await contract.raiseDispute(Number(id));
  await tx.wait();
  alert("Dispute raised.");
}
