import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { initWorkspace, useWorkspace } from "./workspace";

export const edition = async () => {
  await initWorkspace();
  const { wallet, connection } = useWorkspace();
  const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

  const { nft: editionNFT } = await metaplex.nfts().printNewEdition({
    originalMint: "GKfo8dCh25JhbbVvwGY9p1KFsoKa5FsY4enK2TpQEGca",
  });
  console.log(editionNFT);
};
