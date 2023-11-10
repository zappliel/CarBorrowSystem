import {Button, Image} from 'antd';
import {Header} from "../Header"
import {useEffect, useState} from 'react';
import {BorrowYourCarContract, MyERC20Contract, web3} from "../utils/contracts";
import "./index.css"


const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:7545'

const DemoPage = () => {

    //账户
    const [account, setAccount] = useState('')
    //账户余额
    const [balance, setBalance] = useState(0)
    //车主
    const [owner, setOwner] = useState('')
    //借车者
    const [borrower, setBorrower] = useState('')
    //被借的/被查询的车
    const [targetCar, setTargetCar] = useState(0)
    //借车时长
    const [borrowHour, setBorrowHour] = useState(0)
    //拥有的车列表
    const [myCarList, setMyCarList] = useState([])
    //借入的车列表
    const [myBorrowList, setMyBorrowList] = useState([])
    //可借的车列表
    const [availableList, setAvailableList] = useState([])
    //行动
    const [action, setAction] = useState(0);

    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }
        initCheckAccounts()
    }, [])

    useEffect(() => {
        const getBorrowYourCarInfo = async () => {
            if (BorrowYourCarContract) {
                const carlist = await BorrowYourCarContract.methods.getCarList().call(
                    {from: account}
                    )
                setMyCarList(carlist)
                const availablelist = await BorrowYourCarContract.methods.getAvailableCarList().call()
                setAvailableList(availablelist)
                const borrowcarlist = await BorrowYourCarContract.methods.getBorrowedCarList().call(
                    {from: account}
                    )
                setMyBorrowList(borrowcarlist)
            } else {
                alert('Contract error!')
            }
        }
        if(account !== '') {
        getBorrowYourCarInfo()
        }
    }, [account])

    useEffect(() => {
        const getAccountInfo = async () => {
            if (MyERC20Contract) {
                const accountbalance = await MyERC20Contract.methods.balanceOf(account).call()
                setBalance(accountbalance)
            } else {
                alert('Contract error!')
            }
        }

        if(account !== '') {
            getAccountInfo()
        }
    }, [account])

    const ShowImageList = (props: {list: never[]}) => {   
        if(props.list.length === 0)
          return (<div>no cars</div>)
        else
          return (
              <div>
              {props.list.map((id) => {
                  return (
                  <div key={id} className="image-s">
                      <img src={require(`../cars/${id}.jpg`)}  alt=''/>
                      <div>Id: {id}</div>
                  </div>
                  );
              })}
              </div>
          );
      };

    const onTopUp = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (MyERC20Contract) {
            try {
                await MyERC20Contract.methods.airdrop().send(
                    {from: account}
                    )
                alert('Successfully top up the account!')
            } catch (error: any) {
                alert('Topping up fail!')
            }

        } else {
            alert('Contract error!')
        }
    }

    const onGetCar = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (BorrowYourCarContract) {
            try {
                await BorrowYourCarContract.methods.GetNewCar().send({from: account})
                alert('Successfully get a car!')
            } catch (error: any) {
                alert('Fail to get a new car!')
            }
        } else {
            alert('Contract error!')
        }
    }

    const onClickBorrow = async (carId: number, hours: number) => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (BorrowYourCarContract && MyERC20Contract) {
            try {
                const ownerofcar = await BorrowYourCarContract.methods.ownerOf(carId).call()
                setOwner(ownerofcar)
                const borrowerofcar = await BorrowYourCarContract.methods.borrowerOf(carId).call()
                setBorrower(borrowerofcar)
                await MyERC20Contract.methods.approve(BorrowYourCarContract.options.address, hours).send(
                    {from: account}
                    )
                await BorrowYourCarContract.methods.Borrow(carId, hours).send(
                    {from: account}
                    )
                alert('You have borrowed the cars.')
            } catch (error: any) {
                alert('Fail to borrow the car!')
            }
        } else {
            alert('Contract error!')
        }
    }

    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }

    const handleAction = (index: number) => {
        setAction(index);
        setOwner('');
    }

    const onClickSearch = async (carId: number) => {
        if (BorrowYourCarContract) {
            try {
                const ownerofcar2 = await BorrowYourCarContract.methods.ownerOf(carId).call()
                setOwner(ownerofcar2)
                const borrowerofcar2 = await BorrowYourCarContract.methods.borrowerOf(carId).call()
                setBorrower(borrowerofcar2)
                setTargetCar(carId)
            } catch (error: any) {
                alert("Search error!")
            }
        } else {
            alert('Contract error!')
        }
    }
      
    return (
        <div className='container'>
            
            <Image
                width='100%'
                height='700px'
                src={Header}
            />

            <h1>Car Borrow System for ZJUers</h1>
            <h3>Welcome to ZJU Car Borrow System.</h3>
            <h3>You can use ZJUCoins to borrow and loan out the cars here.</h3>

            <div className='main'>
                <div>
                    {account === '' && 
                    <Button style={{marginTop: "10px"}} onClick={onClickConnectWallet}>
                        Connect to wallet
                    </Button>}
                </div>

                <div className='account' style={{margin: "10px", textAlign:"left", marginLeft: "35%"}}>
                    <li>Current user is：{account === '' ? 'No account' : account}</li>
                    <li>Amount of ZJUCoin：{balance}</li>
                    <li>List of cars：{myCarList.toString()}</li>
                </div>

                <p>-------------------------------------------------------------------------</p>
                <Button style={{width: '200px'}} onClick={()=>onTopUp}>
                    Top up your account
                </Button>
                <p>(试用功能,仅为为账户创造初始钱包使用)</p>
                <p>-------------------------------------------------------------------------</p>
                <Button style={{width: '200px'}} onClick={()=>onGetCar()}>
                    Get a new car
                </Button>
                <p>(试用功能,仅为为账户导入初始车辆使用)</p>
                <p>-------------------------------------------------------------------------</p>

                search for the car by Id：
                <input type='number' value={targetCar} onChange={(e)=>setTargetCar(e.target.valueAsNumber)}></input>
                <Button style={{marginLeft: "10px"}} onClick={()=>onClickSearch(targetCar)}>
                    Search
                </Button>
                
                <div className='select' style={{margin: "10px", textAlign:"left", marginLeft: "35%"}}>
                {owner !== '' && <div style={{fontWeight: "bold"}}>Message of the car：</div>}
                {owner !== '' && <li> CarId: {targetCar}</li>}
                {owner !== '' && <li> Owner: {owner}</li>}
                {owner !== '' && <li> Borrower: {borrower}</li>}
                </div>

                <p>-------------------------------------------------------------------------</p>

                <div className='buttons' style={{display: 'inline-block'}}>
                <Button style={{width: '200px', marginRight: "10px"}} onClick={()=>onClickBorrow(targetCar, borrowHour)}>
                    Borrow a car:
                </Button>
                <p></p>
                Hours you want to borrow（Cost: 1 ZJUCoin/h）:
                <input type='number' style={{margin: "0 10px"}} value={borrowHour} onChange={(e)=>setBorrowHour(e.target.valueAsNumber)}></input>
                <p></p>
                Id of the car you want to borrow:
                <input type='number' style={{margin: "0 10px"}} value={targetCar} onChange={(e)=>setTargetCar(e.target.valueAsNumber)}></input>
                </div>

                <p>-------------------------------------------------------------------------</p>

                <div className="tab-buttons" style={{margin: "10px"}}>
                  <Button onClick={() => handleAction(0)}>
                    Check cars you own
                  </Button>

                  <Button onClick={() => handleAction(1)}>
                    Check cars you have borrowed
                  </Button>

                  <Button onClick={() => handleAction(2)}>
                    Check cars available
                  </Button>
                </div>
                
                {action === 0 && 
                <div>
                    <p>Cars you own:</p>
                    <ShowImageList list={myCarList}/>
                </div>}

                {action === 1 && 
                <div>
                    <p>Cars you have borrowed:</p>
                    <ShowImageList list={myBorrowList}/>
                </div>}

                {action === 2 && 
                <div>
                    <p>Cars available:</p>
                    <ShowImageList list={availableList}/>
                </div>}

            </div>
        </div>
    )
}

export default DemoPage