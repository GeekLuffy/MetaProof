// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./ProofCertificate.sol";

/**
 * @title ProofOfArt
 * @dev Main contract for registering AI-generated artworks with blockchain verification
 * @notice Establishes immutable proof of authorship for AI-generated content
 */
contract ProofOfArt is Ownable, ReentrancyGuard, Pausable {
    
    // ProofCertificate NFT contract
    ProofCertificate public certificateContract;
    
    // Artwork data structure
    struct Artwork {
        address creator;
        bytes32 contentHash;        // SHA-256 hash of the artwork
        bytes32 promptHash;         // SHA-256 hash of the prompt
        string ipfsCID;             // IPFS content identifier
        string modelUsed;           // AI model used (e.g., "dall-e-3")
        uint256 timestamp;          // Creation timestamp
        uint256 certificateTokenId; // NFT certificate token ID
        bool verified;              // Verification status
        uint256 iterationNumber;    // For creative lineage tracking
        bytes32 parentArtworkHash;  // For derivative works
    }
    
    // Mappings
    mapping(bytes32 => Artwork) public artworks;           // contentHash => Artwork
    mapping(address => bytes32[]) public creatorArtworks;  // creator => contentHashes
    mapping(bytes32 => bool) public contentExists;         // Prevent duplicates
    mapping(bytes32 => uint256) public verificationCount;  // Track verification requests
    
    // Counters
    uint256 public totalArtworks;
    uint256 public totalVerifications;
    
    // Events
    event ArtworkRegistered(
        bytes32 indexed contentHash,
        address indexed creator,
        string ipfsCID,
        uint256 certificateTokenId,
        uint256 timestamp
    );
    
    event ArtworkVerified(
        bytes32 indexed contentHash,
        address indexed verifier,
        uint256 timestamp
    );
    
    event CertificateMinted(
        address indexed creator,
        uint256 indexed tokenId,
        bytes32 contentHash
    );
    
    event LineageTracked(
        bytes32 indexed childHash,
        bytes32 indexed parentHash,
        uint256 iterationNumber
    );
    
    /**
     * @dev Constructor - deploys ProofCertificate contract
     */
    constructor() {
        certificateContract = new ProofCertificate(address(this));
    }
    
    /**
     * @notice Register a new AI-generated artwork
     * @param _contentHash SHA-256 hash of the artwork content
     * @param _promptHash SHA-256 hash of the prompt
     * @param _ipfsCID IPFS content identifier
     * @param _modelUsed AI model identifier
     * @param _metadataURI URI for certificate metadata
     * @return certificateTokenId The minted NFT certificate token ID
     */
    function registerArtwork(
        bytes32 _contentHash,
        bytes32 _promptHash,
        string memory _ipfsCID,
        string memory _modelUsed,
        string memory _metadataURI
    ) external nonReentrant whenNotPaused returns (uint256) {
        return _registerArtwork(
            _contentHash,
            _promptHash,
            _ipfsCID,
            _modelUsed,
            _metadataURI,
            0,
            bytes32(0)
        );
    }
    
    /**
     * @notice Register artwork with lineage tracking (for iterations)
     * @param _contentHash SHA-256 hash of the artwork content
     * @param _promptHash SHA-256 hash of the prompt
     * @param _ipfsCID IPFS content identifier
     * @param _modelUsed AI model identifier
     * @param _metadataURI URI for certificate metadata
     * @param _iterationNumber Iteration number in creative process
     * @param _parentHash Content hash of parent artwork (if derivative)
     * @return certificateTokenId The minted NFT certificate token ID
     */
    function registerArtworkWithLineage(
        bytes32 _contentHash,
        bytes32 _promptHash,
        string memory _ipfsCID,
        string memory _modelUsed,
        string memory _metadataURI,
        uint256 _iterationNumber,
        bytes32 _parentHash
    ) external nonReentrant whenNotPaused returns (uint256) {
        // Verify parent exists if specified
        if (_parentHash != bytes32(0)) {
            require(contentExists[_parentHash], "Parent artwork does not exist");
        }
        
        return _registerArtwork(
            _contentHash,
            _promptHash,
            _ipfsCID,
            _modelUsed,
            _metadataURI,
            _iterationNumber,
            _parentHash
        );
    }
    
    /**
     * @dev Internal function to register artwork
     */
    function _registerArtwork(
        bytes32 _contentHash,
        bytes32 _promptHash,
        string memory _ipfsCID,
        string memory _modelUsed,
        string memory _metadataURI,
        uint256 _iterationNumber,
        bytes32 _parentHash
    ) internal returns (uint256) {
        require(_contentHash != bytes32(0), "Invalid content hash");
        require(_promptHash != bytes32(0), "Invalid prompt hash");
        require(!contentExists[_contentHash], "Artwork already registered");
        require(bytes(_ipfsCID).length > 0, "Invalid IPFS CID");
        
        // Mint NFT certificate
        uint256 tokenId = certificateContract.mintCertificate(
            msg.sender,
            _metadataURI
        );
        
        // Create artwork record
        artworks[_contentHash] = Artwork({
            creator: msg.sender,
            contentHash: _contentHash,
            promptHash: _promptHash,
            ipfsCID: _ipfsCID,
            modelUsed: _modelUsed,
            timestamp: block.timestamp,
            certificateTokenId: tokenId,
            verified: true,
            iterationNumber: _iterationNumber,
            parentArtworkHash: _parentHash
        });
        
        // Update mappings
        contentExists[_contentHash] = true;
        creatorArtworks[msg.sender].push(_contentHash);
        totalArtworks++;
        
        // Emit events
        emit ArtworkRegistered(
            _contentHash,
            msg.sender,
            _ipfsCID,
            tokenId,
            block.timestamp
        );
        
        emit CertificateMinted(msg.sender, tokenId, _contentHash);
        
        if (_parentHash != bytes32(0)) {
            emit LineageTracked(_contentHash, _parentHash, _iterationNumber);
        }
        
        return tokenId;
    }
    
    /**
     * @notice Verify artwork ownership and authenticity
     * @param _contentHash Content hash to verify
     * @return verified Whether the artwork is verified
     * @return creator Address of the creator
     * @return certificateTokenId NFT certificate token ID
     */
    function verifyArtwork(bytes32 _contentHash)
        external
        returns (bool verified, address creator, uint256 certificateTokenId)
    {
        require(contentExists[_contentHash], "Artwork not found");
        
        Artwork memory artwork = artworks[_contentHash];
        
        // Increment verification count
        verificationCount[_contentHash]++;
        totalVerifications++;
        
        emit ArtworkVerified(_contentHash, msg.sender, block.timestamp);
        
        return (artwork.verified, artwork.creator, artwork.certificateTokenId);
    }
    
    /**
     * @notice Check if content hash is owned by specific address
     * @param _contentHash Content hash to check
     * @param _address Address to verify ownership
     * @return isOwner Whether the address owns the artwork
     */
    function verifyOwnership(bytes32 _contentHash, address _address)
        external
        view
        returns (bool)
    {
        if (!contentExists[_contentHash]) {
            return false;
        }
        return artworks[_contentHash].creator == _address;
    }
    
    /**
     * @notice Get artwork details
     * @param _contentHash Content hash of the artwork
     * @return Artwork struct with all details
     */
    function getArtwork(bytes32 _contentHash)
        external
        view
        returns (Artwork memory)
    {
        require(contentExists[_contentHash], "Artwork not found");
        return artworks[_contentHash];
    }
    
    /**
     * @notice Get all artworks by a creator
     * @param _creator Creator's address
     * @return Array of content hashes
     */
    function getCreatorArtworks(address _creator)
        external
        view
        returns (bytes32[] memory)
    {
        return creatorArtworks[_creator];
    }
    
    /**
     * @notice Get artwork lineage (parent-child relationship)
     * @param _contentHash Content hash of the artwork
     * @return iterationNumber Iteration in creative process
     * @return parentHash Parent artwork hash
     */
    function getArtworkLineage(bytes32 _contentHash)
        external
        view
        returns (uint256 iterationNumber, bytes32 parentHash)
    {
        require(contentExists[_contentHash], "Artwork not found");
        Artwork memory artwork = artworks[_contentHash];
        return (artwork.iterationNumber, artwork.parentArtworkHash);
    }
    
    /**
     * @notice Get verification statistics
     * @param _contentHash Content hash of the artwork
     * @return count Number of times verified
     */
    function getVerificationCount(bytes32 _contentHash)
        external
        view
        returns (uint256)
    {
        return verificationCount[_contentHash];
    }
    
    /**
     * @notice Get total platform statistics
     * @return _totalArtworks Total artworks registered
     * @return _totalVerifications Total verification requests
     * @return uniqueCreators Approximate unique creators
     */
    function getPlatformStats()
        external
        view
        returns (uint256 _totalArtworks, uint256 _totalVerifications, uint256 uniqueCreators)
    {
        // Note: uniqueCreators is an approximation and would need a separate tracking mechanism
        // for exact count. For now, we return 0 as placeholder
        return (totalArtworks, totalVerifications, 0);
    }
    
    /**
     * @notice Emergency pause function
     * @dev Only owner can pause
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause the contract
     * @dev Only owner can unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Get certificate contract address
     * @return Address of ProofCertificate contract
     */
    function getCertificateContract() external view returns (address) {
        return address(certificateContract);
    }
}

