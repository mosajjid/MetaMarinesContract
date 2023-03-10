const { ethers, upgrades  } = require("hardhat");
const { getImplementationAddress } = require('@openzeppelin/upgrades-core');


const delay = (ms) => new Promise((res) => setTimeout(res, ms));

//We will initialize implementation contract with our wallet
const privateKey = "0x"+process.env.PRIVATE_KEY;
const signer = new ethers.Wallet(privateKey).connect(ethers.provider);

async function main() {

    _maxSupply=5000;
 
    _name="MetaMarines";
    _symbol="MM";
    _creatorRoyaltyFeeInBips=1000;
    _ERC20MintAmount=10000;
    

    

    /***************         Creator           ***************/
    console.log('Deploying ');
    let TestERC20 = await ethers.getContractFactory("TestERC20");
   let _paymentToken = await TestERC20.deploy(_creatorRoyaltyFeeInBips);
    await _paymentToken.deployed();
    console.log(`payment token deployed at: ${_paymentToken.address}`);
   

    const MetaMarines = await ethers.getContractFactory("MetaMarines");
    const metaMarines = await MetaMarines.deploy(_paymentToken.address,_name,_symbol,_maxSupply,_creatorRoyaltyFeeInBips);
    await metaMarines.deployed();
    console.log(`metaMarines  deployed at: ${metaMarines.address}`);


    /***************         Marketplace           ***************/



    /******************************************** VERIFICATION ********************************************/
    /******************************************** VERIFICATION ********************************************/

    console.log("We verify now, Please wait!");
    await delay(5000);

    try{
        await hre.run("verify:verify", {
            address: _paymentToken.address,
            constructorArguments: [_creatorRoyaltyFeeInBips],
        });
    }catch(e){
        console.log("error is--->",e);
    }


    console.log("Verifying Metamarines")
    try{
        await hre.run("verify:verify", {
            address: metaMarines.address,
            constructorArguments: [_paymentToken.address,_name,_symbol,_maxSupply,_creatorRoyaltyFeeInBips],
        });
    }catch(e){
        console.log(e);
    }



}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
