import { Metaplex } from "@metaplex-foundation/js";
import { PublicKey, Connection } from "@solana/web3.js";
export default async function MPproxy(request, response){
  const { env, walletAdress } = request.query;
  const cluster = env == 'devnet' ? 'https://api.devnet.solana.com' : 'https://mb-avaulto-cc28.mainnet.rpcpool.com/f72a3ed2-f282-4523-95a0-d4acfcd40f4d'
  const connection = new Connection(cluster)
  const _metaplex = new Metaplex(connection);
  async function getMetaData(uri){
    let metaData = {}
    try {
      metaData = await (await fetch(uri)).json();
    } catch (error) {
      return metaData
    }
    return metaData
  }
  const myNfts = await _metaplex
    .nfts()
    .findAllByOwner({ owner: new PublicKey(walletAdress) })
    

  const myNftsExtended = await Promise.all(myNfts.map(async (metaplexItem) => {
    try {
      const metaData = await getMetaData(metaplexItem.uri);
      const nft= {
        test:'hey',
        image: metaData.image,
        description: metaData.description,
        attributes: metaData.attributes,
        websiteURL: metaData.external_url,
        name: metaplexItem.name,
        mintAddress: metaplexItem?.mintAddress || metaplexItem.mint.address,
        collectionName: metaplexItem.collection?.name,
        explorerURL: metaplexItem.address,
        symbol: metaplexItem.symbol
      }
      return nft
    } catch (error) {
      return {};
      console.warn(error)
    }
  }))
  return response.status(200).json(myNftsExtended);
}
