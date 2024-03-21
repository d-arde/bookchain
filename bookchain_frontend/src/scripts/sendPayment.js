import { web3 } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
// import { useToast } from "vue-toastification";

// const toast = useToast();

export const sendSolana = async (amount) => {
  const connection = new Connection("https://api.devnet.solana.com"); // Use appropriate network
  const solPrice = await getSolanaPrice();
  let amountSOL = amount / solPrice;
  let lamportSOL = Math.round(amountSOL * 1000000000);

  var provider = await getProvider();

  var recieverWallet = new web3.PublicKey(
    "CkiKLEa9eSEoG6CoTSuaahsF2WqNgArnvoCSbNZjJ7BQ"
  );

  var transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: provider.publicKey,
      toPubkey: recieverWallet,
      lamports: lamportSOL,
    })
  );

  transaction.feePayer = await provider.publicKey;
  let blockhashObj = await connection.getLatestBlockhash();
  transaction.recentBlockhash = await blockhashObj.blockhash;

  if (transaction) {
    console.log("Txn created successfully");
  }

  // Request creator to sign the transaction (allow the transaction)
  let signed = await provider.signTransaction(transaction);
  // The signature is generated
  let signature = await connection.sendRawTransaction(signed.serialize());

  console.log("Signature: ", signature);
};

const getSolanaPrice = async () => {
  try {
    const apiKey = "CG-Ua5Z7n3RhqNGhxCfUshnwNVq"; // Replace 'YOUR_API_KEY' with your actual API key

    // Make GET request to CoinMarketCap API
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`,
      {
        method: "GET",
        headers: {
          x_cg_demo_api_key: apiKey,
        },
      }
    );

    if (!response.ok) {
      console.log("ERROR RESPONSE", response);
      //   throw new Error("Failed to fetch Solana price");
    }

    const responseData = await response.json();
    // Extract SOL price from response
    const solanaPrice = responseData.solana.usd;
    console.log("TYPEOF PRICE", typeof solanaPrice);
    console.log(`Current price of Solana (SOL) in USD: $${solanaPrice}`);
    return solanaPrice;
  } catch (error) {
    console.error("Error fetching Solana price:", error);
    return null;
  }
};

const getProvider = async () => {
  if ("solana" in window) {
    const provider = window.solana;
    if (provider.isPhantom) {
      return provider;
    }
  } else {
    window.open("https://www.phantom.app/", "_blank");
  }
};
