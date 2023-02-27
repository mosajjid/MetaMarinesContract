const { ethers, upgrades  } = require("hardhat");
const { getImplementationAddress } = require('@openzeppelin/upgrades-core');


const delay = (ms) => new Promise((res) => setTimeout(res, ms));

//We will initialize implementation contract with our wallet
const privateKey = "0x"+process.env.PRIVATE_KEY;
const signer = new ethers.Wallet(privateKey).connect(ethers.provider);

async function main() {

    _maxSupply=5000;
    _paymentToken ="0x078f616FC3BfEf6b4760e46c459F3ad04f2700F4";
    _name="MetaMarines";
    _symbol="MM";
    

    

    /***************         Creator           ***************/
    console.log('Deploying ');

   

    const MetaMarines = await ethers.getContractFactory("MetaMarines");
    const metaMarines = await MetaMarines.deploy(_paymentToken,_name,_symbol,_maxSupply);
    await metaMarines.deployed();
    console.log(`metaMarines  deployed at: ${metaMarines.address}`);


    /***************         Marketplace           ***************/



    /******************************************** VERIFICATION ********************************************/
    /******************************************** VERIFICATION ********************************************/

    console.log("We verify now, Please wait!");
    await delay(5000);

    console.log("Verifying Metamarines")
    try{
        await hre.run("verify:verify", {
            address: metaMarines.address,
            constructorArguments: [_paymentToken,_name,_symbol,_maxSupply],
        });
    }catch(e){
        console.log(e);
    }



}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
