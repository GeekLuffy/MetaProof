// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ProofCertificate
 * @dev ERC-721 NFT certificates for verified AI-generated artworks
 * @notice Each certificate represents proof of authentic AI art creation
 */
contract ProofCertificate is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // ProofOfArt contract address (authorized minter)
    address public proofOfArtContract;
    
    // Certificate metadata
    struct CertificateMetadata {
        uint256 tokenId;
        address creator;
        uint256 mintedAt;
        string metadataURI;
        bool isValid;
    }
    
    mapping(uint256 => CertificateMetadata) public certificates;
    mapping(address => uint256[]) public ownerCertificates;
    
    // Events
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string metadataURI,
        uint256 timestamp
    );
    
    event CertificateRevoked(
        uint256 indexed tokenId,
        uint256 timestamp
    );
    
    /**
     * @dev Constructor
     * @param _proofOfArtContract Address of the ProofOfArt contract
     */
    constructor(address _proofOfArtContract)
        ERC721("Proof-of-Art Certificate", "POAC")
    {
        proofOfArtContract = _proofOfArtContract;
    }
    
    /**
     * @notice Mint a new certificate (only ProofOfArt contract can call)
     * @param to Address to mint certificate to
     * @param metadataURI URI pointing to certificate metadata
     * @return tokenId The newly minted token ID
     */
    function mintCertificate(address to, string memory metadataURI)
        external
        returns (uint256)
    {
        require(
            msg.sender == proofOfArtContract,
            "Only ProofOfArt contract can mint"
        );
        require(to != address(0), "Cannot mint to zero address");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        certificates[tokenId] = CertificateMetadata({
            tokenId: tokenId,
            creator: to,
            mintedAt: block.timestamp,
            metadataURI: metadataURI,
            isValid: true
        });
        
        ownerCertificates[to].push(tokenId);
        
        emit CertificateMinted(tokenId, to, metadataURI, block.timestamp);
        
        return tokenId;
    }
    
    /**
     * @notice Get certificate metadata
     * @param tokenId Token ID of the certificate
     * @return CertificateMetadata struct
     */
    function getCertificate(uint256 tokenId)
        external
        view
        returns (CertificateMetadata memory)
    {
        require(_exists(tokenId), "Certificate does not exist");
        return certificates[tokenId];
    }
    
    /**
     * @notice Get all certificates owned by an address
     * @param owner Owner's address
     * @return Array of token IDs
     */
    function getCertificatesByOwner(address owner)
        external
        view
        returns (uint256[] memory)
    {
        return ownerCertificates[owner];
    }
    
    /**
     * @notice Check if certificate is valid
     * @param tokenId Token ID to check
     * @return bool indicating validity
     */
    function isCertificateValid(uint256 tokenId)
        external
        view
        returns (bool)
    {
        if (!_exists(tokenId)) {
            return false;
        }
        return certificates[tokenId].isValid;
    }
    
    /**
     * @notice Revoke a certificate (emergency use only)
     * @param tokenId Token ID to revoke
     * @dev Only owner can revoke
     */
    function revokeCertificate(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Certificate does not exist");
        require(certificates[tokenId].isValid, "Certificate already revoked");
        
        certificates[tokenId].isValid = false;
        
        emit CertificateRevoked(tokenId, block.timestamp);
    }
    
    /**
     * @notice Get total number of certificates minted
     * @return uint256 Total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Override required by Solidity
     */
    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
        certificates[tokenId].isValid = false;
    }
    
    /**
     * @dev Override required by Solidity
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Override to track ownership changes
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // Update owner certificates on transfer
        if (from != address(0) && to != address(0)) {
            // Remove from old owner
            uint256[] storage fromCerts = ownerCertificates[from];
            for (uint256 i = 0; i < fromCerts.length; i++) {
                if (fromCerts[i] == tokenId) {
                    fromCerts[i] = fromCerts[fromCerts.length - 1];
                    fromCerts.pop();
                    break;
                }
            }
            
            // Add to new owner
            ownerCertificates[to].push(tokenId);
        }
    }
    
    /**
     * @dev See {IERC165-supportsInterface}
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

