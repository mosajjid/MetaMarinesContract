const { ethers, upgrades } = require("hardhat");
const { expect } = require('chai');
const { formatEther, parseEther } = require("@ethersproject/units");
const { BigNumber } = require('@ethersproject/bignumber');
const { getImplementationAddress } = require('@openzeppelin/upgrades-core');

const provider = ethers.provider;
let snapshotId, snapshotId_1;


const ORDERS = [];
//ABI
let MetaMarinesABI, metaMarines;
const privateKey = "0x" + process.env.PRIVATE_KEY;
let signer;
let _maxSupply = 5000;
let _paymentToken;
let _name = "MetaMarines";
let _symbol = "MM";
let _startTime = 1677475927;
let _endTime = 1709011927;
let _maxPerAddress = 5000;
let _price = 1;
let signers, owner, addr1, addr2, addr3, addr4;
let signature;

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
        metaMarines = await MetaMarinesMarketplace.deploy(_paymentToken.address, _name, _symbol, _maxSupply);
        await metaMarines.deployed();

        expect(await metaMarines.name()).to.equal('MetaMarines');
        expect(await metaMarines.symbol()).to.equal('MM');
     
        expect(await metaMarines._paymentToken()).to.equal(_paymentToken.address);
        expect(await metaMarines._admin()).to.equal(owner.address);

    })

});

describe('Add Category', () => {
    it("Adding Metamarins Categories", async function () {

        await metaMarines.connect(owner).addCategory(_startTime, _endTime, true, true, _price);
        let category = await metaMarines.categories(0);
        let startTime = parseInt(category.startTime);
        let endTime = parseInt(category.endTime);
        let isPrivate = category.isPrivate
        let isActive = category.isActive;
        let price = parseInt(category.price);

        expect(startTime).to.equal(_startTime);
        expect(endTime).to.equal(_endTime);
        expect(isPrivate).to.equal(true);
        expect(isActive).to.equal(true);
        expect(price).to.equal(_price);




    });

});



describe('Mint Tokens', () => {
    const wallet = new ethers.Wallet(privateKey);
    console.log("wallet is------->",wallet)
    it("Set whitelist signer ", async function () {
        await metaMarines.connect(owner).setWhitelistSigner(wallet.address);

        expect(await metaMarines.whitelistSigner()).to.equal(wallet.address);

    });


    it("User Whitelist for categories ", async function () {

        try {

            cNonce = await metaMarines.nonces(addr1.address);
          
            // const wallet = new ethers.Wallet(privateKey);
            const packedData = ethers.utils.solidityPack(
                ["address", "uint256", "uint256","uint256"],
                [addr1.address, 1, cNonce.toString(),0]
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

   
    it("Mint Tokens for public and private Categories", async function () {

        await _paymentToken.connect(addr1).approve(metaMarines.address, parseEther('3'));

        await metaMarines.connect(addr1).MintTokens(1, 0,signature);

        let IndicateId = await metaMarines.indicatesID()
    

        expect(await metaMarines.ownerOf(IndicateId - 1)).to.equal(addr1.address);

    });

});

describe('update Category', () => {
    it("Updating Metamarines Categories", async function () {

        await metaMarines.connect(owner).updateCategory(0,_startTime, _endTime, false, true, _price);
        let category = await metaMarines.categories(0);
        let startTime = parseInt(category.startTime);
        let endTime = parseInt(category.endTime);
        
        let isPrivate = category.isPrivate
        let isActive = category.isActive;
        let price = parseInt(category.price);

        expect(startTime).to.equal(_startTime);
        expect(endTime).to.equal(_endTime);
        expect(isPrivate).to.equal(false);
        expect(isActive).to.equal(true);
        expect(price).to.equal(_price);




    });

});

