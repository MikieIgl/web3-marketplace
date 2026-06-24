// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    struct Item {
        uint256 id;
        address payable seller;
        address buyer;
        string name;
        string description;
        string imageUrl;
        uint256 price;
        bool sold;
    }

    uint256 public itemCount;
    mapping(uint256 => Item) public items;

    event ItemListed(uint256 indexed id, address indexed seller, string name, uint256 price);
    event ItemSold(uint256 indexed id, address indexed buyer, address indexed seller, uint256 price);

    function listItem(
        string memory _name,
        string memory _description,
        string memory _imageUrl,
        uint256 _price
    ) public {
        require(_price > 0, "Price must be > 0");
        require(bytes(_name).length > 0, "Name required");

        itemCount++;
        items[itemCount] = Item(
            itemCount,
            payable(msg.sender),
            address(0),
            _name,
            _description,
            _imageUrl,
            _price,
            false
        );

        emit ItemListed(itemCount, msg.sender, _name, _price);
    }

    function buyItem(uint256 _id) public payable nonReentrant {
        Item storage item = items[_id];

        require(_id > 0 && _id <= itemCount, "Invalid id");
        require(!item.sold, "Already sold");
        require(msg.value >= item.price, "Insufficient ETH");
        require(msg.sender != item.seller, "Cannot buy your own item");

        item.sold = true;
        item.buyer = msg.sender;

        item.seller.transfer(item.price);

        if (msg.value > item.price) {
            payable(msg.sender).transfer(msg.value - item.price);
        }

        emit ItemSold(_id, msg.sender, item.seller, item.price);
    }

    function getAllItems() public view returns (Item[] memory) {
        Item[] memory result = new Item[](itemCount);
        for (uint256 i = 1; i <= itemCount; i++) {
            result[i - 1] = items[i];
        }
        return result;
    }

    function getItemsByBuyer(address _buyer) public view returns (Item[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= itemCount; i++) {
            if (items[i].buyer == _buyer) count++;
        }

        Item[] memory result = new Item[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= itemCount; i++) {
            if (items[i].buyer == _buyer) {
                result[idx] = items[i];
                idx++;
            }
        }
        return result;
    }
}
