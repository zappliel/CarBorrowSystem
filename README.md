# ZJU-blockchain-carborrowsystem

> 简易汽车借用系统，参与方包括：汽车拥有者，有借用汽车需求的用户

>

> 背景：ERC-4907 基于 ERC-721 做了简单的优化和补充，允许用户对NFT进行租借。

> - 创建一个合约，在合约中发行NFT集合，每个NFT代表一辆汽车。给部分用户测试领取部分汽车NFT，用于后面的测试。

> - 在网站中，默认每个用户的汽车都可以被借用。每个用户可以：

>    1. 查看自己拥有的汽车列表。查看当前还没有被借用的汽车列表。

>    2. 查询一辆汽车的主人，以及该汽车当前的借用者（如果有）。

>    3. 选择并借用某辆还没有被借用的汽车一定时间。

>    4. 使用自己发行的积分（ERC20）完成付费租赁汽车的流程

## 如何运行

1. 在本地启动ganache应用，设置端口为7545，或者修改 `hardhat.config.ts`的项目端口，使得私链和项目的端口一致。

2. 在 `contracts` 中安装需要的依赖：
    ```bash
    npm install
    ```

3. 在 `contracts` 中编译合约至ganache：
    ```bash
    npx hardhat compile
    ```

4. 配置`hardhat.config.ts`文件，将accounts中的私钥修改为本地ganache对应私链中的账号，然后在对应目录下部署合约：

    ```bash
    npx hardhat run deploy.ts --network ganache
    ```

5. 记录终端中显示的合约部署地址，并将其拷贝到前端的`contract-addresses.json`文件中：

6. 在 `frontend` 中安装需要的依赖：
    ```bash
    npm install
    ```

7. 在 `frontend` 终端启动react：
    ```bash
    npm run start
    ```

## 功能实现分析

### 1. 查看自己拥有的汽车列表。查看当前还没有被借用的汽车列表。

​		在智能合约上我编写了获得自己的车、获得自己借用的车和获得可借用的车的函数： getCarList 、 getBorrowedCarList 和 getAvailableCarList ，并在前端根据点击的按钮不同，确定用户采取不同的行动，展示不同的列表。在前端，我编写了函数 ShowImageList 来展示对应列表汽车的图片，这些图片被存放在cars文件夹中，目前存放了9辆车。
### 2. 查询一辆汽车的主人，以及该汽车当前的借用者（如果有）。

​		在前端，我实现了通过汽车的id查询其信息的功能，根据其 id 返回汽车的 owner 的地址和 borrower 的地址，不存在返回0。
### 3. 选择并借用某辆还没有被借用的汽车一定时间。

​		在智能合约上我编写了借用汽车的函数 Borrow 来实现借用汽车，在前端，可以根据 AvailableCarList 来得知哪些车是可借的，随后提供借用汽车的功能，填写借用汽车的 id 和想借用的时间即可。注意此时用户的账户需要有足够的代币，否则交易会发生错误。
### 4. 使用自己发行的积分（ERC20）完成付费租赁汽车的流程

​		仿照彩票系统，我定义了自己发行的积分代币ZJUCoin，并实现了在借用汽车时能够完成在账户间进行代币转移的功能。

## 参考内容
 

- ERC-4907 [参考实现](https://eips.ethereum.org/EIPS/eip-4907)
