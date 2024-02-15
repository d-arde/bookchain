import "solana-wallets-vue/styles.css";
import * as anchor from "@coral-xyz/anchor";
import { web3 } from "@project-serum/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  findMasterEditionPda,
  findMetadataPda,
  mplTokenMetadata,
  MPL_TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import { initWorkspace, useWorkspace } from "./workspace";

export const mintToken = async (name, symbol, uri) => {
  await initWorkspace();
  const { wallet, program } = useWorkspace();
  console.log("testing wallet connection", wallet.value.publicKey);

  if (!wallet || !wallet.value.publicKey) {
    console.error("wallet is not initalised");
    return;
  }

  const mint = web3.Keypair.generate();
  console.log("mint address", mint.publicKey);

  const umi = createUmi("https://api.devnet.solana.com")
    .use(walletAdapterIdentity(mint))
    .use(mplTokenMetadata());

  // Derive the associated token address account for the mint
  const associatedTokenAccount = await getAssociatedTokenAddress(
    mint.publicKey,
    wallet.value.publicKey
  );

  // derive the metadata account
  let metadataAccount = findMetadataPda(umi, {
    mint: publicKey(mint.publicKey),
  })[0];

  //derive the master edition pda
  let masterEditionAccount = findMasterEditionPda(umi, {
    mint: publicKey(mint.publicKey),
  })[0];

  console.log("master editon, ", masterEditionAccount);

  await program.value.rpc.initMint(name, symbol, uri, {
    accounts: {
      signer: wallet.value.publicKey,
      mint: mint.publicKey,
      associatedTokenAccount,
      metadataAccount,
      masterEditionAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    },
    signers: [mint],
  });

  console.log(
    `minted nft: https://solscan.io/address/${mint.publicKey}?cluster=devnet`
  );
};
// anchorWallet.wallet.PublicKey
// ^ how to get signer pub key

// web3.SystemProgram.programId
// ^ how to get system program id
