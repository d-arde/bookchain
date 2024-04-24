import { computed } from "vue";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { useAnchorWallet } from "solana-wallets-vue";
import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
const idl = require("../idl/idl.json");

// define the program ID and commitment parameters
const programId = new PublicKey(idl.metadata.address);
const preflightCommitment = "processed";
const commitment = "processed";

let workspace = null;

// retrieve the workspace
export const useWorkspace = () => workspace;

// initialize the workspace
export const initWorkspace = () => {
  // get the wallet using useAnchorWallet()
  const wallet = useAnchorWallet();
  // create connection to Solana devnet network
  const connection = new Connection(clusterApiUrl("devnet"), commitment);
  const provider = computed(
    () =>
      new AnchorProvider(connection, wallet.value, {
        preflightCommitment,
        commitment,
      })
  );
  // define the program using the Program class
  const program = computed(() => new Program(idl, programId, provider.value));

  workspace = {
    wallet,
    connection,
    provider,
    program,
  };
};
