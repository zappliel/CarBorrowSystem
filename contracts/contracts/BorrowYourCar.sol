// SPDX-License-Identifier: UNLICENSED
pragma solidity  ^0.8.20;

// Uncomment the line to use openzeppelin/ERC721
// You can use this dependency directly because it has been installed by TA already
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./MyERC20.sol";
// Uncomment this line to use console.log
import "hardhat/console.sol";

contract BorrowYourCar is ERC721{

    // use a event if you want
    // to represent time you can choose block.timestamp
    event CarBorrowed(uint256 carTokenId, address borrower, uint256 startTime, uint256 expireTime);
    event ReturnCar(uint256 carTokenId, address borrower, uint256 returnTime);
    
    // maybe you need a struct to store car information
    struct Car {
        //address owner;
        address borrower;
        uint256 borrowUntil;
    }

    mapping(uint256 => Car) public cars; // A map from car index to its information

    // 用于分配唯一的车辆ID
    uint256 private CarNextToken;
    //代币
    MyERC20 public myERC20;
    // 合约部署者是合约的管理员
    address public admin;

    constructor() ERC721("BorrowYourCar", "cars") {
        CarNextToken = 0;
        myERC20 = new MyERC20();
    }

    function helloworld() pure external returns(string memory) {
        return "hello world";
    }

    function Borrow(uint256 carId, uint256 hour) public virtual{
        address owner = _ownerOf(carId);
        require(owner != address(0), "Car does not exist");
        require(borrowerOf(carId) == address(0), "Car is already rented");
        uint256 borrowUntils = block.timestamp + hour * 3600; 
        myERC20.transferFrom(msg.sender, owner, hour);
        Car storage car =  cars[carId];
        car.borrower = msg.sender;
        car.borrowUntil = borrowUntils;
        emit CarBorrowed(carId, msg.sender, block.timestamp, borrowUntils);
    }

    function borrowerOf(uint256 carId) public view virtual returns(address){
        if( uint256(cars[carId].borrowUntil) >=  block.timestamp){
            return  cars[carId].borrower;
        }
        else{
            return address(0);
        }
    }

    function ReturnCar(uint256 carId) public virtual{
        address owner = _ownerOf(carId);
        require(msg.sender == borrowerOf(carId), "You did not rent this car");
        require(block.timestamp >= cars[carId].borrowUntil, "Car must be returned");
        Car storage car =  cars[carId];
        car.borrower = address(0);
        car.borrowUntil = block.timestamp;
        emit ReturnCar(carId, msg.sender, block.timestamp);
    }

    function GetNewCar() external {
        _safeMint(msg.sender, CarNextToken);
        CarNextToken += 1;
    }

    function getCarList() public view returns(uint256[] memory) {
        uint256 balance = balanceOf(msg.sender);
        uint256[] memory carList = new uint256[](balance);
        if(balance == 0) return carList;

        uint256 index = 0;
        for(uint256 carId = 0; carId < CarNextToken; carId++) {
            if(_ownerOf(carId) == msg.sender) {
                carList[index] = carId;
                index += 1;
                if(index == balance) break;
            }
        }
        return carList;
    }

    function getAvailableCarList() external view returns(uint256[] memory) {
        uint256[] memory availableCarIds = new uint256[](CarNextToken);
        uint256 availableCount = 0;

        for (uint256 i = 0; i < CarNextToken; i++) {
            if (borrowerOf(i) == address(0)) {
                availableCarIds[availableCount] = i;
                availableCount++;
            }
        }

        // 创建一个新数组，只包含未被租赁的车辆
        uint256[] memory unrentedCars = new uint256[](availableCount);
        for (uint256 i = 0; i < availableCount; i++) {
            unrentedCars[i] = availableCarIds[i];
        }
        return unrentedCars;
    }

    function getBorrowedCarList() external view returns(uint256[] memory) {
        uint256[] memory rentedCarIds = new uint256[](CarNextToken);
        uint256 rentedCount = 0;

        for (uint256 i = 0; i < CarNextToken; i++) {
            if (borrowerOf(i) == msg.sender) {
                rentedCarIds[rentedCount] = i;
                rentedCount++;
            }
        }
        
        // 创建一个新数组，只包含用户租赁的车辆
        uint256[] memory userRentedCars = new uint256[](rentedCount);
        for (uint256 i = 0; i < rentedCount; i++) {
            userRentedCars[i] = rentedCarIds[i];
        }

        return userRentedCars;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can perform this operation");
    }

}