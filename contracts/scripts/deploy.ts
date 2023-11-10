import { ethers } from "hardhat";

async function main() {
  const BorrowYourCar = await ethers.getContractFactory("BorrowYourCar");
  const borrowYourCar = await BorrowYourCar.deploy();
  await borrowYourCar.deployed();
  const ZJUCoinAddress = await borrowYourCar.myERC20();

  console.log(`BorrowYourCar deployed to ${borrowYourCar.address}`);
  console.log(`ZJUCoin deployed to ${ZJUCoinAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});