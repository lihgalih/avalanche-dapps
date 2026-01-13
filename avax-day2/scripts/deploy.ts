import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function (hre: HardhatRuntimeEnvironment) {
    const [deployer] = await hre.viem.getWalletClients();

    console.log("Deploying with:", deployer.account.address);

    const simpleStorage = await hre.viem.deployContract("SimpleStorage", []);

    console.log("SimpleStorage deployed to:", simpleStorage.address);
}
