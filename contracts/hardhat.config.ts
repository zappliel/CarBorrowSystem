import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://127.0.0.1:7545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0x176dd3d685c4f81a2adef12481166aebe11e2f2781b28bcb171193dc2e06e5ab',
        '0x5fd7fb59483ca3755ae4e4b150bf11fca64d05c39b312efeb0e922b0b1cdc3e0',
        '0xfeddd7044f5bb03aa92434accf7ae18a26b56d0184cc737694896372138c24b6',
        '0xc9e11a85b2ac0113b24220f1452d6680cfef5e470014c577e7a3dffec98731c3',
        '0x2d94a7fa701be2fe037c388c2dbea6bbf07d0d7519d216ec1061eb16cc18beb9',
        '0xc388220ca3bf81e07c45baa042d762665105c3dcc09c350a98b44427f2786476'
      ]
    },
  },
};

export default config;
