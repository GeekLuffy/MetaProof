// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title POAToken
 * @dev POA ERC-20 Token Contract
 * Token Name: POA
 * Token Symbol: POA
 * Decimals: 18
 * Total Supply: 1,000,000 POA (configurable via constructor)
 */
contract POAToken is ERC20, Ownable {
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    /**
     * @dev Constructor that mints initial supply to the deployer
     * @param initialSupply Initial token supply (in whole tokens, will be multiplied by 10^18)
     */
    constructor(uint256 initialSupply) ERC20("POA", "POA") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
    
    /**
     * @dev Mint new tokens (only owner can call)
     * @param to Address to receive minted tokens
     * @param amount Amount of tokens to mint (in whole tokens)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "POAToken: mint to zero address");
        require(amount > 0, "POAToken: mint amount must be greater than 0");
        
        _mint(to, amount * 10 ** decimals());
        emit TokensMinted(to, amount * 10 ** decimals());
    }
    
    /**
     * @dev Burn tokens from caller's account
     * @param amount Amount of tokens to burn (in whole tokens)
     */
    function burn(uint256 amount) public {
        require(amount > 0, "POAToken: burn amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount * 10 ** decimals(), "POAToken: insufficient balance to burn");
        
        _burn(msg.sender, amount * 10 ** decimals());
        emit TokensBurned(msg.sender, amount * 10 ** decimals());
    }
    
    /**
     * @dev Burn tokens from a specific account (requires allowance)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn (in whole tokens)
     */
    function burnFrom(address from, uint256 amount) public {
        require(amount > 0, "POAToken: burn amount must be greater than 0");
        require(from != address(0), "POAToken: burn from zero address");
        
        uint256 amountWithDecimals = amount * 10 ** decimals();
        require(balanceOf(from) >= amountWithDecimals, "POAToken: insufficient balance to burn");
        
        _spendAllowance(from, msg.sender, amountWithDecimals);
        _burn(from, amountWithDecimals);
        emit TokensBurned(from, amountWithDecimals);
    }
    
    /**
     * @dev Returns the total supply in whole tokens (without decimals)
     */
    function totalSupplyInTokens() public view returns (uint256) {
        return totalSupply() / 10 ** decimals();
    }
    
    /**
     * @dev Returns the balance of an account in whole tokens (without decimals)
     * @param account Address to check balance
     */
    function balanceOfInTokens(address account) public view returns (uint256) {
        return balanceOf(account) / 10 ** decimals();
    }
}

