const { ethers, upgrades } = require("hardhat");
const { expect } = require('chai');
const { formatEther, parseEther } = require("@ethersproject/units");
const { BigNumber } = require('@ethersproject/bignumber');
const { getImplementationAddress } = require('@openzeppelin/upgrades-core');
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const provider = ethers.provider;


//ABI
let  metaMarines;
const privateKey = "0x" + process.env.PRIVATE_KEY;
let _maxSupply = 5000;
let _paymentToken;
let _name = "MetaMarines";
let _symbol = "MM";
let _creatorRoyaltyFeeInBips=1000;
let _startTime = 1677475927;//27 feb
let _endTime = 1709011927;//2024 
let _futureStartTime=1709011927;
let _price = parseEther("100");
let _zeroPrice=0;
let signers, owner, addr1, addr2, addr3, addr4, admin;
let signature;
let dummySig = "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
describe('Initiation', () => {
    it("Snapshot EVM", async function () {
        snapshotId = await provider.send("evm_snapshot");
    });

    it("Defining Generals", async function () {
        [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
        signers = [owner, addr1, addr2, addr3, addr4];
        console.log("Owner is are---->", owner.address);
        signer = new ethers.Wallet(privateKey);
        // console.log("signer is----->",signer.address);
        MetaMarinesABI = (await ethers.getContractFactory("MetaMarines")).interface;


    });


});

describe('Deploying contracts', () => {

    it("Deploy ERC20 for payment", async function () {
        TestERC20 = await ethers.getContractFactory("TestERC20");
        _paymentToken = await TestERC20.deploy(parseEther('10000.0'));
        await _paymentToken.deployed();


        for (let i = 1; i <= 4; i++) {
            await _paymentToken.transfer(signers[i].address, parseEther('1000.0'));
            expect(formatEther(await _paymentToken.balanceOf(signers[i].address))).to.equal('1000.0');
        }
    });

    it("deploy metamarines contract", async function () {
        snapshotId = await provider.send("evm_snapshot");
        MetaMarinesMarketplace = await ethers.getContractFactory("MetaMarines");
        metaMarines = await MetaMarinesMarketplace.deploy(_paymentToken.address, _name, _symbol, _maxSupply,_creatorRoyaltyFeeInBips);
        await metaMarines.deployed();

        expect(await metaMarines.name()).to.equal('MetaMarines');
        expect(await metaMarines.symbol()).to.equal('MM');

        expect(await metaMarines._paymentToken()).to.equal(_paymentToken.address);
        expect(await metaMarines.admin()).to.equal(owner.address);
        admin = owner
    })

});

describe('Add Category', () => {
    it("Adding private Metamarins Categories", async function () {
        await metaMarines.connect(admin).addCategory(_startTime, _endTime, true, true, _price);
        let category = await metaMarines.categories(0);
        let startTime = parseInt(category.startTime);
        let endTime = parseInt(category.endTime);
        let isPrivate = category.isPrivate
        let isActive = category.isActive;
        let price = category.price;

        expect(startTime).to.equal(_startTime);
        expect(endTime).to.equal(_endTime);
        expect(isPrivate).to.equal(true);
        expect(isActive).to.equal(true);
        expect(price.toString()).to.equal(_price.toString());
    });

    it("Adding public Metamarins Categories", async function () {

        await metaMarines.connect(admin).addCategory(_startTime, _endTime, false, true, _price);
        let category = await metaMarines.categories(1);
        let startTime = parseInt(category.startTime);
        let endTime = parseInt(category.endTime);
        let isPrivate = category.isPrivate
        let isActive = category.isActive;
        let price = category.price;

        expect(startTime).to.equal(_startTime);
        expect(endTime).to.equal(_endTime);
        expect(isPrivate).to.equal(false);
        expect(isActive).to.equal(true);
        expect(price.toString()).to.equal(_price.toString());
    });

    it("Adding inactive Metamarins Categories", async function () {

        await metaMarines.connect(admin).addCategory(_futureStartTime, 1741215449, false, true, _price);
        let category = await metaMarines.categories(2);
        let startTime = parseInt(category.startTime);
        let endTime = parseInt(category.endTime);
        let isPrivate = category.isPrivate
        let isActive = category.isActive;
        let price = category.price;

        expect(startTime).to.equal(_futureStartTime);
        expect(endTime).to.equal(1741215449);
        expect(isPrivate).to.equal(false);
        expect(isActive).to.equal(true);
        expect(price.toString()).to.equal(_price.toString());
    });
    it("Adding Metamarins Categories for minting is done", async function () {
     let date=(new Date()).valueOf()+35000;
     date=date/1000;
    
        await metaMarines.connect(admin).addCategory(_startTime, Math.floor(date), false, true, _price);
        let category = await metaMarines.categories(3);
        let startTime = parseInt(category.startTime);
        let endTime = parseInt(category.endTime);
        let isPrivate = category.isPrivate
        let isActive = category.isActive;
        let price = category.price;

        expect(startTime).to.equal(_startTime);
        expect(endTime).to.equal(Math.floor(date));
        expect(isPrivate).to.equal(false);
        expect(isActive).to.equal(true);
        expect(price.toString()).to.equal(_price.toString());
    });

    it("Adding Metamarins Categories for ZeroPrice", async function () {
       
       
           await metaMarines.connect(admin).addCategory(_startTime, _endTime, false, true, _zeroPrice);
           let category = await metaMarines.categories(4);
           let startTime = parseInt(category.startTime);
           let endTime = parseInt(category.endTime);
           let isPrivate = category.isPrivate
           let isActive = category.isActive;
           let price = category.price;
   
           expect(startTime).to.equal(_startTime);
           expect(endTime).to.equal(_endTime);
           expect(isPrivate).to.equal(false);
           expect(isActive).to.equal(true);
           expect(price.toString()).to.equal(_zeroPrice.toString());
       });
    // End Time Should Not Be Less Than Start Time"
   

    it("Adding public Metamarins Categories for wrong endtime time", async function () {

        await expect(metaMarines.connect(admin).addCategory(_endTime, _endTime, true, true, _price)).to.be.revertedWith("End Time Should Not Be Less Than Start Time");
    });




    it("should not allow any other user to add category", async function () {
        await expect(metaMarines.connect(addr2).addCategory(_startTime, _endTime, true, true, _price)).to.be.revertedWith("Not an Admin")
    });

    it("Updating Metamarines Categories", async function () {
        await metaMarines.connect(admin).updateCategory(0, _startTime, _endTime, false, true, _price);
        let category = await metaMarines.categories(0);
        let startTime = parseInt(category.startTime);
        let endTime = parseInt(category.endTime);
        let isPrivate = category.isPrivate
        let isActive = category.isActive;
        let price = category.price;

        expect(startTime).to.equal(_startTime);
        expect(endTime).to.equal(_endTime);
        expect(isPrivate).to.equal(false);
        expect(isActive).to.equal(true);
        expect(price).to.equal(_price);
    });

    it("should not allow any other user to update category", async function () {
        await expect(metaMarines.connect(addr2).updateCategory(0, _startTime, _endTime, false, true, _price)).to.be.revertedWith("Not an Admin")
    });
});



describe('Mint Tokens', () => {
    const wallet = new ethers.Wallet(privateKey);

 
 
    it("Set whitelist signer ", async function () {
        await metaMarines.connect(admin).setWhitelistSigner(wallet.address);
        expect(await metaMarines.whitelistSigner()).to.equal(wallet.address);
    });


    it("User Whitelist for categories ", async function () {
        try {
            cNonce = await metaMarines.nonces(addr1.address);
            const packedData = ethers.utils.solidityPack(
                ["address", "uint256", "uint256", "uint256"],
                [addr1.address, 1, cNonce.toString(), 0]
            );

            signature = await wallet.signMessage(
                ethers.utils.arrayify(packedData)
            );

            let UserSignature = {
                uAddress: addr1.address,
                uSignature: signature,
            };

            return UserSignature;

        } catch (e) {
            console.log("error is---->", e);
        }

    });

    it("should not mint token if minting not started", async function () {
        await _paymentToken.connect(addr1).approve(metaMarines.address, parseEther('3000'));
        await expect(metaMarines.connect(addr1).MintTokens(1, 2, dummySig)).to.be.revertedWith("Sale Not Started");
    });
   

    it("Mint Tokens for private Categories", async function () {
        const sellerBalanceBeforeSale = Number(formatEther(await _paymentToken.balanceOf(owner.address)));
        const buyerBalanceBeforeSale = Number(formatEther(await _paymentToken.balanceOf(addr1.address)));
       

        await _paymentToken.connect(addr1).approve(metaMarines.address, parseEther('3000'));
        await metaMarines.connect(addr1).MintTokens(1, 0, signature);

        let IndicateId = await metaMarines.indicatesID()
        const sellerBalanceAfterSale = Number(formatEther(await _paymentToken.balanceOf(owner.address)));
        const buyerBalanceAfterSale = Number(formatEther(await _paymentToken.balanceOf(addr1.address)));
       

        expect(await metaMarines.ownerOf(IndicateId - 1)).to.equal(addr1.address);
        expect(buyerBalanceBeforeSale-buyerBalanceAfterSale).to.equal(parseInt(formatEther(_price)));

    });


    it("Admin Minting ", async function () {
        
       
        await _paymentToken.connect(addr4).approve(metaMarines.address, parseEther('3000'));
        await metaMarines.connect(admin).adminMint(addr4.address,1,0);
        let IndicateId = await metaMarines.indicatesID()
        expect(await metaMarines.ownerOf(IndicateId-1)).to.equal(addr4.address);
    });
    

    it("Mint Tokens for public Categories", async function () {
        const sellerBalanceBeforeSale = Number(formatEther(await _paymentToken.balanceOf(owner.address)));
        const buyerBalanceBeforeSale = Number(formatEther(await _paymentToken.balanceOf(addr1.address)));
        

        await _paymentToken.connect(addr1).approve(metaMarines.address, parseEther('3000'));
        await metaMarines.connect(addr1).MintTokens(1, 1, dummySig);

        let IndicateId = await metaMarines.indicatesID()
        const sellerBalanceAfterSale = Number(formatEther(await _paymentToken.balanceOf(owner.address)));
        const buyerBalanceAfterSale = Number(formatEther(await _paymentToken.balanceOf(addr1.address)));
    

        expect(await metaMarines.ownerOf(IndicateId - 1)).to.equal(addr1.address);
        expect(buyerBalanceBeforeSale-buyerBalanceAfterSale).to.equal(parseInt(formatEther(_price)));

    });

    it("Make sale inactive for category 1", async function (){
        await metaMarines.connect(admin).updateCategory(1, _startTime, _endTime, false, false, _price);
    })
    
    it("should not mint token if sale is not active", async function () {
        await _paymentToken.connect(addr1).approve(metaMarines.address, parseEther('3000'));
        await expect(metaMarines.connect(addr1).MintTokens(1, 1, dummySig)).to.be.revertedWith("Category is not active");
    });
  

});





describe('Withdraw ERC20 token', () => {
    it("should allow admin to be able to withdraw erc20 token", async function () {
        let contractBalBeforeWithdraw = formatEther(await _paymentToken.balanceOf(metaMarines.address))
        let userBalBeforeWithdraw = formatEther(await _paymentToken.balanceOf(addr3.address))
        await metaMarines.connect(admin).withdrawERC20Token(addr3.address, _paymentToken.address);
        let contractBalAfterWithdraw = formatEther(await _paymentToken.balanceOf(metaMarines.address))
        let userBalAfterWithdraw = formatEther(await _paymentToken.balanceOf(addr3.address))
        console.log("Balances", contractBalBeforeWithdraw, userBalBeforeWithdraw, contractBalAfterWithdraw, userBalAfterWithdraw)
        expect(contractBalBeforeWithdraw - contractBalAfterWithdraw).to.equal(userBalAfterWithdraw - userBalBeforeWithdraw);
    });

    it("should not allow any user other than admin to be able to withdraw erc20 token", async function () {
        await expect(metaMarines.connect(addr3).withdrawERC20Token(addr3.address, _paymentToken.address)).to.be.revertedWith("Not an Admin")
    });

});

describe('Update Admin', () => {
    it("should allow owner to set new admin", async function () {
        await metaMarines.connect(owner).setAdmin(addr3.address);
        expect(await metaMarines.admin()).to.equal(addr3.address);
    });
});
describe('Set new Admin and Add Category', () => {
    const wallet = new ethers.Wallet(privateKey);

 
 
    it("Set New owner ", async function () {
        await metaMarines.connect(owner).transferOwnership(addr4.address);
        expect(await metaMarines.owner()).to.equal(addr4.address);
    });

    it("Adding public Metamarins Categories from wrong admin", async function () {

        await expect(metaMarines.connect(admin).addCategory(_startTime, _endTime, false, true, _price)).to.be.revertedWith("Not an Admin");
    });


   



});

