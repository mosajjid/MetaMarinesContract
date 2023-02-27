# TOKEN DEPLOYED
<br/>**CreatorV1 proxy**<br/>
https://mumbai.polygonscan.com/address/0xD36ec75Ec1FA2CD318A6861edca3c5565F06d982#code
<br/>**CreatorV1 implementation**<br/>
https://mumbai.polygonscan.com/address/0x4844C1Ad3D46c2b388A5336174778528900e2c2F#code
<br/>**DecryptMarketplace proxy**<br/>
https://mumbai.polygonscan.com/address/0x5496b0A8EedC64F8CdBb665a539F73582dce5268#code
<br/>**DecryptMarketplace implementation**<br/>
https://mumbai.polygonscan.com/address/0x7315D4d93db463c47De1cB92A50Cf80c4E182272#code
<br/>**SimplerERC721Deployer**<br/>
https://mumbai.polygonscan.com/address/0x0cec0b6c69Ba659C02C54f32784CE727BFdc8a12#code
<br/>**ExtendedERC721Deployer**<br/>
https://mumbai.polygonscan.com/address/0x5568749C8936450C20015C3D07DdE0B99351d69A#code
<br/>**SimplerERC1155Deployer**<br/>
https://mumbai.polygonscan.com/address/0x3D5aE2dDfA780C71138829d93A52e64022f0cF9D#code
<br/>**ExtendedERC1155Deployer**<br/>
https://mumbai.polygonscan.com/address/0xEcD9F5DFB5829557221d49d6916d81abca8B5411#code


# INSTALL DEPENDENCIES

```shell
git clone https://github.com/grape404/Decrypt_MarketPlace.git
```

Enter into the the main folder.

```shell
npm install
```

# RUN TEST LOCALLY

```shell
npx hardhat test
```

# CONFIGURE THE DEPLOYMENT

In this project, copy the .env.template file to a file named .env, and then edit it to fill in the details. Enter your Polygonscan API key, your Matic and Matic Testnet node URL (eg from Alchemy or Infura), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

Adjust the contract deployment settings!
<b>scripts/deploy.js</b>

To get the Etherscan and Polygonscan API key, go to
<a href="https://polygonscan.com/myapikey">https://polygonscan.com/myapikey </a>

# DEPLOY ON TESTNET

```shell
npx hardhat run scripts/deploy.js --network maticTestnet
```

# DEPLOY ON MATIC

```shell
npx hardhat run scripts/deploy.js --network matic
```

# VERIFICATION

Verification is automated

Make sure to use correct key in hardhat.config.js

`POLYGONSCAN_API_KEY_MATIC` - for Polygon network

# PROXY IMPLEMENTATION UPGRADE

If you will need to update implementation of Marketplace or NFT Creator proxy contract, you should deploy it as usual, verify it on Polygonscan and then call `upgradeTo(address newImplementation)` function with new implementation address on your proxy contract.
<br/>This will upgrade implementation to new one.
<br/>Make sure New implementation is compatible with old one and no data will be lost after upgrade.
 