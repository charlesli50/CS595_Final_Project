let provider, signer, contract;

const abi = [
  "function registerUser() external",
  "function createContract(address employee, address token, uint256 totalDays, uint256 dailyWage) external returns (uint256)",
  "function verifyWork(uint256 id) external",
  "function raiseDispute(uint256 id) external",
  "function isRegistered(address user) view returns (bool)",
  "function getContract(uint256 id) view returns (address,address,address,uint256,uint256,uint256,uint8)",
  "function totalContracts() view returns (uint256)",
];

async function loadDeployedAddress() {
  try {
    const response = await fetch("/deployed.json");
    const data = await response.json();
    document.getElementById("contractAddress").value = data.Nirmaan;
    console.log("✅ Loaded deployed address:", data.Nirmaan);
  } catch (error) {
    console.error("❌ Failed to load deployed.json", error);
  }
}

async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }

    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();

    const address = await signer.getAddress();
    document.getElementById(
      "walletAddress"
    ).innerText = `Connected: ${address}`;

    console.log("✅ Wallet connected:", address);
    // alert("Wallet connected!");

    window.ethereum.on("accountsChanged", async () => {
      console.log("🔁 Account changed. Reconnecting...");
      await connectWallet();
    });
  } catch (error) {
    console.error("❌ Wallet connection error:", error);
    alert("Wallet connection failed. Please check MetaMask.");
  }
}

async function connectContract() {
  try {
    if (!provider) await connectWallet();

    const address = document.getElementById("contractAddress").value.trim();
    if (!ethers.isAddress(address)) return alert("Invalid contract address.");

    const code = await provider.getCode(address);
    if (code === "0x") return alert("No contract deployed at this address!");

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

    if (!contract) return alert("Connect to contract first.");

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
    const tokenAddress = document.getElementById("tokenAddress").value.trim();
    const days = document.getElementById("numDays").value.trim();
    const dailyWage = document.getElementById("dailyWage").value.trim();
    if (!ethers.isAddress(emp)) return alert("Invalid employee address.");
    if (!ethers.isAddress(tokenAddress)) return alert("Invalid token address.");
    if ((parseInt(days) <= 0)) return alert("Invalid number of days.");
    if ((parseInt(dailyWage) <= 0)) return alert("Invalid wage.");

    const totalTokens = days * dailyWage;
    const totalAmount = ethers.parseUnits(totalTokens.toString(), 18);

    const token = new ethers.Contract(
      tokenAddress,
      [
        "function approve(address spender, uint256 amount) public returns (bool)",
        "function allowance(address owner, address spender) public view returns (uint256)",
        "function balanceOf(address account) public view returns (uint256)",
      ],
      signer
    );

    const employer = await signer.getAddress();
    const allowance = await token.allowance(employer, contract.target);
    const balance = await token.balanceOf(employer);

    console.log("👤 Employer:", employer);
    console.log("💰 Token Balance:", ethers.formatUnits(balance, 18));
    console.log("🔐 Token Allowance:", ethers.formatUnits(allowance, 18));
    console.log(
      "📦 Required Total Amount:",
      ethers.formatUnits(totalAmount, 18)
    );

    if (balance < totalAmount) {
      return alert("Insufficient balance. Please mint or transfer tokens.");
    }

    if (allowance < totalAmount) {
      console.log("🔁 Approving tokens...");
      const approveTx = await token.approve(contract.target, totalAmount);
      await approveTx.wait();
      console.log("✅ Approval successful!");
    } else {
      console.log("✅ Sufficient allowance. Skipping approve.");
    }

    console.log("🛠 Calling createContract...");
    const tx = await contract.createContract(emp, tokenAddress, days, dailyWage);
    const receipt = await tx.wait();
    console.log(
      "✅ Work contract created. Gas used:",
      receipt.gasUsed.toString()
    );
    
    document.getElementById("currentContractStatus").innerText = "✅ Contract Created!";

  } catch (err) {
    console.error("❌ Error creating contract:", err);
    document.getElementById("currentContractStatus").innerText = "❌ Contract Creation Failed!";
    alert("Contract creation failed. See console for details.");
  }
}

async function verifyWork() {
  try {
    const id = Number(document.getElementById("contractId").value);
    if (isNaN(id)) return alert("Invalid contract ID.");

    console.log("🔁 Sending verifyWork for ID:", id);
    const tx = await contract.verifyWork(id);
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
  try {
    const addr = document.getElementById("checkAddress").value.trim();
    if (!ethers.isAddress(addr)) return alert("Invalid address.");

    const isReg = await contract.isRegistered(addr);
    console.log(`✅ Address ${addr} is registered:`, isReg);
    document.getElementById("regStatus").innerText = isReg
      ? "✅ Registered"
      : "❌ Not registered";
  } catch (err) {
    console.error("❌ Error checking registration:", err);
    alert("Check registration failed.");
  }
}

async function listContracts() {
  try {
    const container = document.getElementById("contractList");
    container.innerHTML = "Loading...";
    const total = await contract.totalContracts();
    console.log("📦 Total contracts:", total.toString());

    const entries = [];
    for (let i = 0; i < total; i++) {
      const c = await contract.getContract(i);
      const status = ["Active", "Completed", "Disputed", "Resolved"][
        Number(c[6])
      ];
      entries.push(
        `<p><b>ID ${i}</b>: Employer ${c[0]} ➡️ Employee ${c[1]} | Token: ${c[2]} | Days: ${c[5]}/${c[3]} | Status: ${status}</p>`
      );
    }

    container.innerHTML = entries.join("");
  } catch (err) {
    console.error("❌ Error listing contracts:", err);
    document.getElementById("contractList").innerText =
      "Failed to load contracts.";
  }
}
