import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";

export const fetchTokens = async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const keypair = Keypair.generate();

  const metaplex = new Metaplex(connection);
  metaplex.use(keypairIdentity(keypair));

  const owner = new PublicKey("DycYs87NKZtrnML9raEVW5pk3Aac6D3eQYQUu52TvPRK");
  const allNFTs = await metaplex.nfts().findAllByOwner({ owner });

  console.log(allNFTs);
};
