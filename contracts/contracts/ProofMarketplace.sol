// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./ProofCertificate.sol";

/**
 * @title ProofMarketplace
 * @dev Marketplace for trading verified AI artworks
 * @notice Enables buying/selling of Proof-of-Art certificates with royalty support
 */
contract ProofMarketplace is ReentrancyGuard, Ownable {
    
    ProofCertificate public certificateContract;
    
    // Platform fee (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFee = 250;
    
    // Royalty percentage for original creators (in basis points)
    uint256 public creatorRoyalty = 500; // 5%
    
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isActive;
        uint256 listedAt;
    }
    
    struct Offer {
        uint256 tokenId;
        address buyer;
        uint256 offerPrice;
        uint256 expiresAt;
        bool isActive;
    }
    
    // Mappings
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer[]) public offers;
    mapping(address => uint256) public pendingWithdrawals;
    
    // Counters
    uint256 public totalListings;
    uint256 public totalSales;
    uint256 public totalVolume;
    
    // Events
    event ItemListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );
    
    event ItemSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 timestamp
    );
    
    event ListingCancelled(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 timestamp
    );
    
    event OfferMade(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 offerPrice,
        uint256 expiresAt
    );
    
    event OfferAccepted(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    
    /**
     * @dev Constructor
     * @param _certificateContract Address of ProofCertificate contract
     */
    constructor(address _certificateContract) {
        certificateContract = ProofCertificate(_certificateContract);
    }
    
    /**
     * @notice List a certificate for sale
     * @param tokenId Certificate token ID
     * @param price Listing price in wei
     */
    function listItem(uint256 tokenId, uint256 price)
        external
        nonReentrant
    {
        require(price > 0, "Price must be greater than 0");
        require(
            certificateContract.ownerOf(tokenId) == msg.sender,
            "Not the owner"
        );
        require(
            certificateContract.getApproved(tokenId) == address(this) ||
            certificateContract.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );
        require(!listings[tokenId].isActive, "Already listed");
        
        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            isActive: true,
            listedAt: block.timestamp
        });
        
        totalListings++;
        
        emit ItemListed(tokenId, msg.sender, price, block.timestamp);
    }
    
    /**
     * @notice Buy a listed certificate
     * @param tokenId Certificate token ID
     */
    function buyItem(uint256 tokenId)
        external
        payable
        nonReentrant
    {
        Listing storage listing = listings[tokenId];
        
        require(listing.isActive, "Item not listed");
        require(msg.value >= listing.price, "Insufficient payment");
        
        address seller = listing.seller;
        uint256 price = listing.price;
        
        // Mark as sold
        listing.isActive = false;
        
        // Calculate fees
        uint256 platformCut = (price * platformFee) / 10000;
        uint256 creatorCut = (price * creatorRoyalty) / 10000;
        
        // Get original creator
        ProofCertificate.CertificateMetadata memory cert = 
            certificateContract.getCertificate(tokenId);
        address creator = cert.creator;
        
        // Calculate seller proceeds
        uint256 sellerProceeds = price - platformCut - 
            (creator != seller ? creatorCut : 0);
        
        // Transfer NFT to buyer
        certificateContract.safeTransferFrom(seller, msg.sender, tokenId);
        
        // Distribute payments
        pendingWithdrawals[seller] += sellerProceeds;
        pendingWithdrawals[owner()] += platformCut;
        
        if (creator != seller) {
            pendingWithdrawals[creator] += creatorCut;
        }
        
        // Refund excess payment
        if (msg.value > price) {
            pendingWithdrawals[msg.sender] += (msg.value - price);
        }
        
        totalSales++;
        totalVolume += price;
        
        emit ItemSold(tokenId, seller, msg.sender, price, block.timestamp);
    }
    
    /**
     * @notice Cancel a listing
     * @param tokenId Certificate token ID
     */
    function cancelListing(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        
        require(listing.isActive, "Item not listed");
        require(listing.seller == msg.sender, "Not the seller");
        
        listing.isActive = false;
        
        emit ListingCancelled(tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Make an offer on a certificate
     * @param tokenId Certificate token ID
     * @param duration Offer duration in seconds
     */
    function makeOffer(uint256 tokenId, uint256 duration)
        external
        payable
    {
        require(msg.value > 0, "Offer must be greater than 0");
        require(duration > 0, "Invalid duration");
        
        offers[tokenId].push(Offer({
            tokenId: tokenId,
            buyer: msg.sender,
            offerPrice: msg.value,
            expiresAt: block.timestamp + duration,
            isActive: true
        }));
        
        emit OfferMade(
            tokenId,
            msg.sender,
            msg.value,
            block.timestamp + duration
        );
    }
    
    /**
     * @notice Accept an offer
     * @param tokenId Certificate token ID
     * @param offerIndex Index of the offer to accept
     */
    function acceptOffer(uint256 tokenId, uint256 offerIndex)
        external
        nonReentrant
    {
        require(
            certificateContract.ownerOf(tokenId) == msg.sender,
            "Not the owner"
        );
        require(offerIndex < offers[tokenId].length, "Invalid offer index");
        
        Offer storage offer = offers[tokenId][offerIndex];
        
        require(offer.isActive, "Offer not active");
        require(block.timestamp <= offer.expiresAt, "Offer expired");
        
        uint256 price = offer.offerPrice;
        address buyer = offer.buyer;
        
        // Mark offer as inactive
        offer.isActive = false;
        
        // Cancel any active listing
        if (listings[tokenId].isActive) {
            listings[tokenId].isActive = false;
        }
        
        // Calculate fees (same as buyItem)
        uint256 platformCut = (price * platformFee) / 10000;
        uint256 creatorCut = (price * creatorRoyalty) / 10000;
        
        ProofCertificate.CertificateMetadata memory cert = 
            certificateContract.getCertificate(tokenId);
        address creator = cert.creator;
        
        uint256 sellerProceeds = price - platformCut - 
            (creator != msg.sender ? creatorCut : 0);
        
        // Transfer NFT
        certificateContract.safeTransferFrom(msg.sender, buyer, tokenId);
        
        // Distribute payments
        pendingWithdrawals[msg.sender] += sellerProceeds;
        pendingWithdrawals[owner()] += platformCut;
        
        if (creator != msg.sender) {
            pendingWithdrawals[creator] += creatorCut;
        }
        
        totalSales++;
        totalVolume += price;
        
        emit OfferAccepted(tokenId, msg.sender, buyer, price);
    }
    
    /**
     * @notice Withdraw accumulated funds
     */
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        pendingWithdrawals[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @notice Update platform fee (owner only)
     * @param newFee New fee in basis points
     */
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
    }
    
    /**
     * @notice Update creator royalty (owner only)
     * @param newRoyalty New royalty in basis points
     */
    function setCreatorRoyalty(uint256 newRoyalty) external onlyOwner {
        require(newRoyalty <= 2000, "Royalty too high"); // Max 20%
        creatorRoyalty = newRoyalty;
    }
    
    /**
     * @notice Get marketplace statistics
     */
    function getMarketplaceStats()
        external
        view
        returns (uint256 _totalListings, uint256 _totalSales, uint256 _totalVolume)
    {
        return (totalListings, totalSales, totalVolume);
    }
    
    /**
     * @notice Get all offers for a token
     * @param tokenId Certificate token ID
     */
    function getOffers(uint256 tokenId)
        external
        view
        returns (Offer[] memory)
    {
        return offers[tokenId];
    }
}

