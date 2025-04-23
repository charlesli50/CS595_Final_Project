let provider, signer, contract;

const abi = [
  "function registerUser() public",
  "function createContract(address employee, address token, uint256 totalDays, uint256 dailyWage) public returns (uint256)",
  "function verifyWork(uint256 id) public",
  "function raiseDispute(uint256 id) public",
  "function isRegistered(address user) view returns (bool)",
  "function getContract(uint256 id) view returns (address,address,address,uint256,uint256,uint256,uint8)",
  "function totalContracts() view returns (uint256)",
];

async function connectContract() {
  try {
    if (!window.ethereum) return alert("Please install MetaMask.");

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    const address = document.getElementById("contractAddress").value.trim();
    if (!ethers.isAddress(address)) return alert("Invalid contract address.");

    contract = new ethers.Contract(address, abi, signer);
    console.log("✅ Connected to contract at:", contract.target);
    alert("Contract connected!");
  } catch (err) {
    console.error("❌ Error connecting to contract:", err);
    alert("Connection failed.");
  }
}

async function register() {
  try {
    console.log("🔁 Sending registerUser transaction...");
    const tx = await contract.registerUser();
    console.log("🧾 Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Registered user. Gas used:", receipt.gasUsed.toString());
    alert("User registered!");
  } catch (err) {
    console.error("❌ Error in registerUser:", err);
    alert("Registration failed.");
  }
}

async function createWorkContract() {
  try {
    const emp = document.getElementById("employeeAddress").value.trim();
    const token = document.getElementById("tokenAddress").value.trim();
    if (!ethers.isAddress(emp)) return alert("Invalid employee address.");
    if (!ethers.isAddress(token)) return alert("Invalid token address.");

    console.log("🔁 Sending createContract...");
    const tx = await contract.createContract(emp, token, 5, 20);
    console.log("🧾 Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Contract created. Gas used:", receipt.gasUsed.toString());

    // Try getting the contract ID (if emitted, log it)
    const createdEvent = receipt.logs?.find(
      (log) => log.address.toLowerCase() === contract.target.toLowerCase()
    );
    if (createdEvent) {
      console.log("📦 Event log for contract creation:", createdEvent);
    }

    alert("Work contract created.");
  } catch (err) {
    console.error("❌ Error creating contract:", err);
    alert("Contract creation failed.");
  }
}

async function verifyWork() {
  try {
    const id = Number(document.getElementById("contractId").value);
    if (isNaN(id)) return alert("Invalid contract ID.");

    console.log("🔁 Sending verifyWork for ID:", id);
    const tx = await contract.verifyWork(id);
    if (!tx.wait) {
      throw new Error("Work Failed");
    }
    console.log("🧾 Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Work verified. Gas used:", receipt.gasUsed.toString());
    alert("Work verified.");
  } catch (err) {
    console.error("❌ Error verifying work:", err);
    alert("Work verification failed.");
  }
}

async function raiseDispute() {
  try {
    const id = Number(document.getElementById("contractId").value);
    if (isNaN(id)) return alert("Invalid contract ID.");

    console.log("🔁 Sending raiseDispute for ID:", id);
    const tx = await contract.raiseDispute(id);
    console.log("🧾 Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Dispute raised. Gas used:", receipt.gasUsed.toString());
    alert("Dispute raised.");
  } catch (err) {
    console.error("❌ Error raising dispute:", err);
    alert("Dispute raise failed.");
  }
}

async function checkRegistered() {
  const addr = document.getElementById("checkAddress").value.trim();
  if (!ethers.isAddress(addr)) return alert("Invalid address.");
  const isReg = await contract.isRegistered(addr);
  console.log(`✅ Address ${addr} is registered:`, isReg);
  document.getElementById("regStatus").innerText = isReg
    ? "✅ Registered"
    : "❌ Not registered";
}

async function listContracts() {
  try {
    const container = document.getElementById("contractList");
    container.innerHTML = "Loading...";
    const total = await contract.totalContracts();
    console.log("📦 Total contracts on-chain:", total.toString());

    const entries = [];

    for (let i = 0; i < total; i++) {
      const c = await contract.getContract(i);
      const status = ["Active", "Completed", "Disputed"][Number(c[6])];
      entries.push(
        `<p><b>ID ${i}</b>: Employer ${c[0]} ➡️ Employee ${c[1]} | Token: ${c[2]} | Days: ${c[5]}/${c[3]} | Status: ${status}</p>`
      );
    }

    container.innerHTML = entries.join("");
  } catch (err) {
    console.error("❌ Error fetching contracts:", err);
    document.getElementById("contractList").innerText =
      "Failed to load contracts.";
  }
}
