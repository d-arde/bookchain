import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Bookchain } from "../target/types/bookchain";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import {
  findMasterEditionPda,
  findMetadataPda,
  mplTokenMetadata,
  MPL_TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairPayer, publicKey } from "@metaplex-foundation/umi";

import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";
import { Keypair, Signer } from "@solana/web3.js";

describe("bookchain", async () => {
  // Configured the client to use the devnet cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Bookchain as Program<Bookchain>;
  const programId = new anchor.web3.PublicKey(
    "BExr7pdwNn86aAJzH87ejTWeqhuNsRCoMHHhDmfJ8yWN"
  );

  const signer = provider.wallet;

  const umi = createUmi("https://api.devnet.solana.com")
    .use(walletAdapterIdentity(signer))
    .use(mplTokenMetadata());

  const mint = anchor.web3.Keypair.generate();
  console.log("MINT", mint);
  const owner_mint = new anchor.web3.PublicKey(
    "DycYs87NKZtrnML9raEVW5pk3Aac6D3eQYQUu52TvPRK"
  );

  // Derive the associated token address account for the mint
  const associatedTokenAccount = await getAssociatedTokenAddress(
    mint.publicKey,
    signer.publicKey
  );

  // derive the metadata account
  let metadataAccount = findMetadataPda(umi, {
    mint: publicKey(mint.publicKey),
  })[0];

  //derive the master edition pda
  let masterEditionAccount = findMasterEditionPda(umi, {
    mint: publicKey(mint.publicKey),
  })[0];

  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  const id = new anchor.BN(1249);
  const editionNum = 1249;
  const editionNumParam = new anchor.BN(editionNum);
  const id_owner = new anchor.BN(501);
  const EDITION_MARKER_BIT_SIZE = 248;
  let editionNumber = new anchor.BN(
    Math.floor(editionNum / EDITION_MARKER_BIT_SIZE)
  );
  let editionNumberString = editionNumber.toString();

  const [newMint] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("mint"),
      id_owner.toArrayLike(Buffer, "le", 8),
      id.toArrayLike(Buffer, "le", 8),
    ],
    programId
  );

  const [ownerMint] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), id_owner.toArrayLike(Buffer, "le", 8)],
    programId
  );

  const [newMasterEditionAccount] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        newMint.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

  const [ownerMasterEditionAccount] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        owner_mint.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

  const [newNftMetadata] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      newMint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  const [ownerNftMetadata] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      owner_mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  const [editionMarkPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      ownerMasterEditionAccount.toBuffer(),
      Buffer.from("edition"),
      Buffer.from(editionNumberString),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  const metadata = {
    name: "Kobeni",
    symbol: "kBN",
    uri: "https://raw.githubusercontent.com/687c/solana-nft-native-client/main/metadata.json",
  };

  it("mints nft!", async () => {
    const tx = await program.methods
      .initMint(metadata.name, metadata.symbol, metadata.uri)
      .accounts({
        signer: provider.publicKey,
        mint: mint.publicKey,
        associatedTokenAccount,
        metadataAccount,
        masterEditionAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([mint])
      .rpc();

    console.log(`mint nft tx: https://solscan.io/tx/${tx}?cluster=devnet`);
    console.log(
      `minted nft: https://solscan.io/address/${mint.publicKey}?cluster=devnet`
    );
  });
  it("Mint new edition", async () => {
    const new_tokenAccount = await getAssociatedTokenAddress(
      newMint,
      provider.wallet.publicKey
    );
    const owner_token_account = await getAssociatedTokenAddress(
      ownerMint,
      provider.wallet.publicKey
    );

    const owner_token_account_x: Signer = {
      publicKey: owner_token_account,
      secretKey: owner_token_account.toBytes(),
    };
    console.log(owner_token_account_x);

    console.log("owner_mint: ", owner_mint);
    console.log("newMint: ", newMint);
    console.log("tokenAccount: ", new_tokenAccount);
    console.log("owner_token_account: ", owner_token_account);
    console.log("newMasterEditionAccount: ", newMasterEditionAccount);
    console.log("ownerMasterEditionAccount: ", ownerMasterEditionAccount);
    console.log("editionMarkPda: ", editionMarkPda);
    console.log("ownerNftMetadata: ", ownerNftMetadata);
    console.log("provider.publicKey: ", provider.publicKey);

    const tx = await program.methods
      .initEdition(id_owner, id, editionNumParam, editionNumberString)
      .accounts({
        ownerMint: owner_mint,
        newMint: newMint,
        tokenAccount: new_tokenAccount,
        tokenAccountOwner: owner_token_account,
        newEdition: newMasterEditionAccount,
        masterEdition: ownerMasterEditionAccount,
        editionMarkPda: editionMarkPda,
        metadata: newNftMetadata,
        ownerNftMetadata: ownerNftMetadata,
        payer: provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        metadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      // .signers([ownerMint])
      .rpc()
      .catch((err) => console.log(err));

    console.log("tx", tx);
  });
});
