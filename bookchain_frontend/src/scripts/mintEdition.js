import {
  createSignerFromKeypair,
  generateSigner,
  keypairIdentity,
} from "@metaplex-foundation/umi";
import {
  printV1,
  fetchMasterEditionFromSeeds,
  mplTokenMetadata,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { initWorkspace, useWorkspace } from "./workspace";

const keypair = new Uint8Array([
  136, 79, 219, 174, 137, 195, 77, 17, 229, 209, 5, 78, 97, 227, 8, 81, 100, 51,
  215, 15, 3, 38, 128, 24, 65, 224, 129, 232, 47, 105, 202, 34, 152, 40, 144,
  230, 211, 148, 230, 0, 65, 200, 233, 237, 66, 65, 55, 100, 47, 64, 70, 204,
  210, 228, 100, 101, 133, 154, 5, 6, 203, 128, 170, 111,
]);

export const mintEdition = async () => {
  console.log("--------------");
  await initWorkspace();
  const { wallet } = useWorkspace();
  console.log("connected wallet: ", wallet.value.publicKey);
  const umi = createUmi("https://api.devnet.solana.com");

  const keypair_umi = umi.eddsa.createKeypairFromSecretKey(keypair);
  console.log("Keypair", keypair_umi.publicKey.toString());
  const keypairSigner = createSignerFromKeypair("eddsa", keypair_umi);
  umi.use(keypairIdentity(keypairSigner));
  umi.use(mplTokenMetadata());

  const masterEditionMint = "2GpmH5T71LGxCGUoNZ6135WSY8Jvsmsz4YtkBNytUUjV";
  const masterEdition = await fetchMasterEditionFromSeeds(umi, {
    mint: masterEditionMint,
  });
  console.log("masterEdition address: ", masterEdition);
  const editionMint = generateSigner(umi);
  console.log("editionMint", editionMint);
  await printV1(umi, {
    masterTokenAccountOwner: "DycYs87NKZtrnML9raEVW5pk3Aac6D3eQYQUu52TvPRK",
    masterEditionMint,
    editionMint,
    editionTokenAccountOwner: wallet.value.publicKey,
    editionNumber: masterEdition.supply + 1n,
    tokenStandard: TokenStandard.NonFungibleEdition,
  }).sendAndConfirm(umi);
};
