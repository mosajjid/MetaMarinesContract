/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("dotenv").config();
require('@nomiclabs/hardhat-waffle');
require("@nomiclabs/hardhat-etherscan");
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');

module.exports = {
    solidity: {
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
        compilers: [
            {
                version: "0.8.3",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            }
        ]
    },
    networks: {
        hardhat: {
            chainId: 4, //replaces chainID
            accounts: {
                count: 20
            },
        },
        bscTestnet: {
            url:"https://data-seed-prebsc-1-s3.binance.org:8545/",
            accounts:
                process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
            gas: 2100000,
            // gasPrice: 8000000000
        },
        // matic: {
        //     url: process.env.MATIC_URL || "",
        //     accounts:
        //         process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
        //     gas: 2100000,
        //     gasPrice: 8000000000
        // },
        maticTestnet: {
            url: process.env.MATIC_TESTNET_URL || "",
            accounts:
                process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
            gas: 2100000,
            gasPrice: 8000000000
        },
    },
    etherscan: {
        apiKey: process.env.POLYGONSCAN_API_KEY_MATIC,
    },
};
