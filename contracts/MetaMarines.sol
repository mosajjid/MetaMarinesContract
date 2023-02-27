// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract MetaMarines is
    ERC721Enumerable,
    Ownable,
    ERC2981,
    ReentrancyGuard
{
    using Strings for uint256;

    // NFT Details
    string public _name;
    string public _symbol;
    uint256 public _totalSupply = 0;
    uint256 public _maxSupply;
    string public _baseTokenURI;
    uint256 public indicatesID = 1;
    address public whitelistSigner;
    // needed to accept or decline signatures in whitelisted minting
    mapping(address => uint256) public nonces;
   

    // Payment Token
    IERC20 public _paymentToken;

    // Whitelisting
    mapping(address => bool) private _whitelist;

    // Admin Minting
    address public _admin;

    struct category {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        bool isPrivate;
        bool isActive;
        uint256 price;
        uint256 totalMinted;
    }

    category[] public categories;

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721Enumerable, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    constructor(
        address paymentToken,
        string memory name,
        string memory symbol,
        uint256 maxsupply
    ) ERC721(name, symbol) {
        _admin = msg.sender;
        _maxSupply = maxsupply;
        _paymentToken = IERC20(paymentToken);
        _name = name;
        _symbol = symbol;
    }

    event AddCategory(
        uint256 categoryId,
        uint256 startTime,
        uint256 endTime,

        bool isPrivate,
        bool isActive,
        uint256 price
    );
    event Mint(address indexed _address, uint256 _quantity);
    event NewWhitelistSigner(address signer);



    //function allows to receive Ethereum
    receive() external payable {}

    function addCategory(
        uint256 _startTime,
        uint256 _endTime,
        bool _isPrivate,
        bool _isActive,
        uint256 _price
        
    ) external onlyOwner {
        categories.push(
            category({
                id: categories.length,
                startTime: _startTime,
                endTime: _endTime,
               
                isPrivate: _isPrivate,
                isActive: _isActive,
                price: _price,
                totalMinted:0
            })
        );

        emit AddCategory(
            categories.length - 1,
            _startTime,
            _endTime,
            _isPrivate,
            _isActive,
            _price
        );
    }

    function updateCategory(
        uint256 _categoryId,
        uint256 _startTime,
        uint256 _endTime,
        bool _isPrivate,
        bool _isActive,
        uint256 _price
    ) external onlyOwner {
        categories[_categoryId].isActive = _isActive;
        categories[_categoryId].isPrivate = _isPrivate;
        categories[_categoryId].startTime = _startTime;
        categories[_categoryId].endTime = _endTime;
        categories[_categoryId].price = _price;
    }

    function isPrivateSale(uint256 categoryId) public view returns (bool) {
        return categories[categoryId].isPrivate;
    }

    function MintTokens(
        uint256 _quantity,
        uint256 categoryId,
        bytes calldata signature
    ) external {
        uint256 _indicatesID = indicatesID;
        require(
            _quantity + _indicatesID <= _maxSupply,
            "over max supply tokens"
        );

        //check if sale is private, if sale is private check if user is whitelisted
        if (isPrivateSale(categoryId)) {
            bytes32 hash = keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n116", // 84 bytes = 20 address + 32 uint + 32 uint
                    address(msg.sender),
                    _quantity,
                    _useNonce(msg.sender),
                    categoryId
                    
                )
            );
            address recoveredAddress = ECDSA.recover(hash, signature);
            require(whitelistSigner == recoveredAddress, "bad signature");
            for (uint256 i = 0; i < _quantity; i++) {
                _mint(msg.sender, _indicatesID);
                unchecked {
                    _indicatesID++;
                }
            }
            IERC20(_paymentToken).transferFrom(
                msg.sender,
                address(this),
                (categories[categoryId].price * _quantity)
            );
            categories[categoryId].totalMinted+=1;
            indicatesID = _indicatesID;
        } else {
            for (uint256 i = 0; i < _quantity; i++) {
                _mint(msg.sender, _indicatesID);
                unchecked {
                    _indicatesID++;
                }
            }
            IERC20(_paymentToken).transferFrom(
                msg.sender,
                address(this),
                (categories[categoryId].price * _quantity)
            );
            categories[categoryId].totalMinted+=1;
            indicatesID = _indicatesID;
        }

        emit Mint(msg.sender, _quantity);
    }

    function _useNonce(
        address _owner
    ) internal virtual returns (uint256 current) {
        current = nonces[_owner];
        nonces[_owner]++;
    }

        /*
     * Function returns new base URI link
     */
    function baseURI() external view returns (string memory) {
        return _baseURI();
    }

    /*
     * Function returns new base URI link
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /*
     * Params
     * string _baseURILink - New URI link to set
     *
     * Function sets new base URI link
     */
    function setBaseURILink(string memory _baseURILink) external onlyOwner {
        _baseTokenURI = _baseURILink;
    }

    function setWhitelistSigner(
        address _whitelistSigner
    ) external onlyOwner {
        require(_whitelistSigner != address(0));
        whitelistSigner = _whitelistSigner;
        emit NewWhitelistSigner(_whitelistSigner);
    }

    /*
     * function sets the royalty
     */
    function setRoyalty(
        uint96 _creatorRoyaltyFeesInBips
    ) external onlyOwner{
        _setDefaultRoyalty(msg.sender, _creatorRoyaltyFeesInBips);
    }
}