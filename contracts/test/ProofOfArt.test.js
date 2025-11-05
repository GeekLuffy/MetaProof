const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProofOfArt", function () {
  let proofOfArt;
  let certificateContract;
  let owner;
  let addr1;
  let addr2;

  const contentHash = ethers.keccak256(ethers.toUtf8Bytes("Sample artwork content"));
  const promptHash = ethers.keccak256(ethers.toUtf8Bytes("Sample prompt"));
  const ipfsCID = "QmTestCID123";
  const modelUsed = "dall-e-3";
  const metadataURI = "ipfs://QmMetadata123";

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const ProofOfArt = await ethers.getContractFactory("ProofOfArt");
    proofOfArt = await ProofOfArt.deploy();
    await proofOfArt.waitForDeployment();

    const certAddress = await proofOfArt.getCertificateContract();
    certificateContract = await ethers.getContractAt("ProofCertificate", certAddress);
  });

  describe("Deployment", function () {
    it("Should deploy ProofOfArt and ProofCertificate", async function () {
      expect(await proofOfArt.getAddress()).to.be.properAddress;
      expect(await proofOfArt.getCertificateContract()).to.be.properAddress;
    });

    it("Should initialize with zero artworks", async function () {
      expect(await proofOfArt.totalArtworks()).to.equal(0);
    });
  });

  describe("Artwork Registration", function () {
    it("Should register a new artwork", async function () {
      const tx = await proofOfArt.registerArtwork(
        contentHash,
        promptHash,
        ipfsCID,
        modelUsed,
        metadataURI
      );

      await expect(tx)
        .to.emit(proofOfArt, "ArtworkRegistered")
        .withArgs(
          contentHash,
          owner.address,
          ipfsCID,
          1, // First token ID
          (await ethers.provider.getBlock("latest")).timestamp
        );

      expect(await proofOfArt.totalArtworks()).to.equal(1);
    });

    it("Should mint certificate NFT on registration", async function () {
      await proofOfArt.registerArtwork(
        contentHash,
        promptHash,
        ipfsCID,
        modelUsed,
        metadataURI
      );

      expect(await certificateContract.ownerOf(1)).to.equal(owner.address);
    });

    it("Should prevent duplicate registration", async function () {
      await proofOfArt.registerArtwork(
        contentHash,
        promptHash,
        ipfsCID,
        modelUsed,
        metadataURI
      );

      await expect(
        proofOfArt.registerArtwork(
          contentHash,
          promptHash,
          ipfsCID,
          modelUsed,
          metadataURI
        )
      ).to.be.revertedWith("Artwork already registered");
    });

    it("Should reject invalid content hash", async function () {
      await expect(
        proofOfArt.registerArtwork(
          ethers.ZeroHash,
          promptHash,
          ipfsCID,
          modelUsed,
          metadataURI
        )
      ).to.be.revertedWith("Invalid content hash");
    });
  });

  describe("Artwork Verification", function () {
    beforeEach(async function () {
      await proofOfArt.registerArtwork(
        contentHash,
        promptHash,
        ipfsCID,
        modelUsed,
        metadataURI
      );
    });

    it("Should verify existing artwork", async function () {
      const [verified, creator, tokenId] = await proofOfArt.verifyArtwork(contentHash);

      expect(verified).to.be.true;
      expect(creator).to.equal(owner.address);
      expect(tokenId).to.equal(1);
    });

    it("Should increment verification count", async function () {
      await proofOfArt.verifyArtwork(contentHash);
      await proofOfArt.connect(addr1).verifyArtwork(contentHash);

      expect(await proofOfArt.getVerificationCount(contentHash)).to.equal(2);
    });

    it("Should verify ownership", async function () {
      expect(await proofOfArt.verifyOwnership(contentHash, owner.address)).to.be.true;
      expect(await proofOfArt.verifyOwnership(contentHash, addr1.address)).to.be.false;
    });

    it("Should reject verification of non-existent artwork", async function () {
      const fakeHash = ethers.keccak256(ethers.toUtf8Bytes("Fake content"));
      await expect(proofOfArt.verifyArtwork(fakeHash)).to.be.revertedWith(
        "Artwork not found"
      );
    });
  });

  describe("Lineage Tracking", function () {
    let parentHash, childHash;

    beforeEach(async function () {
      parentHash = contentHash;
      childHash = ethers.keccak256(ethers.toUtf8Bytes("Child artwork"));

      await proofOfArt.registerArtwork(
        parentHash,
        promptHash,
        ipfsCID,
        modelUsed,
        metadataURI
      );
    });

    it("Should register artwork with lineage", async function () {
      const tx = await proofOfArt.registerArtworkWithLineage(
        childHash,
        promptHash,
        "QmChildCID",
        modelUsed,
        metadataURI,
        2, // iteration 2
        parentHash
      );

      await expect(tx)
        .to.emit(proofOfArt, "LineageTracked")
        .withArgs(childHash, parentHash, 2);
    });

    it("Should retrieve lineage information", async function () {
      await proofOfArt.registerArtworkWithLineage(
        childHash,
        promptHash,
        "QmChildCID",
        modelUsed,
        metadataURI,
        2,
        parentHash
      );

      const [iteration, parent] = await proofOfArt.getArtworkLineage(childHash);
      expect(iteration).to.equal(2);
      expect(parent).to.equal(parentHash);
    });

    it("Should reject invalid parent", async function () {
      const fakeParent = ethers.keccak256(ethers.toUtf8Bytes("Fake parent"));

      await expect(
        proofOfArt.registerArtworkWithLineage(
          childHash,
          promptHash,
          "QmChildCID",
          modelUsed,
          metadataURI,
          2,
          fakeParent
        )
      ).to.be.revertedWith("Parent artwork does not exist");
    });
  });

  describe("Creator Artworks", function () {
    it("Should track creator's artworks", async function () {
      const hash1 = ethers.keccak256(ethers.toUtf8Bytes("Artwork 1"));
      const hash2 = ethers.keccak256(ethers.toUtf8Bytes("Artwork 2"));

      await proofOfArt.registerArtwork(hash1, promptHash, ipfsCID, modelUsed, metadataURI);
      await proofOfArt.registerArtwork(hash2, promptHash, ipfsCID, modelUsed, metadataURI);

      const artworks = await proofOfArt.getCreatorArtworks(owner.address);
      expect(artworks.length).to.equal(2);
      expect(artworks[0]).to.equal(hash1);
      expect(artworks[1]).to.equal(hash2);
    });
  });

  describe("Platform Statistics", function () {
    it("Should track platform stats", async function () {
      await proofOfArt.registerArtwork(
        contentHash,
        promptHash,
        ipfsCID,
        modelUsed,
        metadataURI
      );

      await proofOfArt.verifyArtwork(contentHash);
      await proofOfArt.connect(addr1).verifyArtwork(contentHash);

      const [totalArtworks, totalVerifications] = await proofOfArt.getPlatformStats();
      expect(totalArtworks).to.equal(1);
      expect(totalVerifications).to.equal(2);
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause", async function () {
      await proofOfArt.pause();

      await expect(
        proofOfArt.registerArtwork(
          contentHash,
          promptHash,
          ipfsCID,
          modelUsed,
          metadataURI
        )
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow owner to unpause", async function () {
      await proofOfArt.pause();
      await proofOfArt.unpause();

      await expect(
        proofOfArt.registerArtwork(
          contentHash,
          promptHash,
          ipfsCID,
          modelUsed,
          metadataURI
        )
      ).to.not.be.reverted;
    });

    it("Should prevent non-owner from pausing", async function () {
      await expect(proofOfArt.connect(addr1).pause()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });
});

