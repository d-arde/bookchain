import { computed } from "vue";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { useAnchorWallet } from "solana-wallets-vue";
import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
const idl = require("../idl/idl.json");

const programId = new PublicKey(idl.metadata.address);
console.log("metadata.addres", programId);
const preflightCommitment = "processed";
const commitment = "processed";
let workspace = null;

export const useWorkspace = () => workspace;

export const initWorkspace = () => {
  const wallet = useAnchorWallet();
  const connection = new Connection(clusterApiUrl("devnet"), commitment);
  const provider = computed(
    () =>
      new AnchorProvider(connection, wallet.value, {
        preflightCommitment,
        commitment,
      })
  );
  const program = computed(() => new Program(idl, programId, provider.value));

  workspace = {
    wallet,
    connection,
    provider,
    program,
  };
};
