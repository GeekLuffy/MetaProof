import crypto from 'crypto';

/**
 * Merkle Tree implementation for batch verification
 */
export class MerkleTree {
  private leaves: string[];
  private tree: string[][];

  constructor(leaves: string[]) {
    if (leaves.length === 0) {
      throw new Error('Cannot create Merkle tree with empty leaves');
    }

    this.leaves = leaves.map((leaf) => this.hashLeaf(leaf));
    this.tree = this.buildTree();
  }

  /**
   * Hash a leaf node
   */
  private hashLeaf(data: string): string {
    return this.hash(data);
  }

  /**
   * Hash two nodes together
   */
  private hashPair(left: string, right: string): string {
    const combined = left < right ? left + right : right + left;
    return this.hash(combined);
  }

  /**
   * SHA-256 hash function
   */
  private hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Build the Merkle tree
   */
  private buildTree(): string[][] {
    const tree: string[][] = [this.leaves];

    while (tree[tree.length - 1].length > 1) {
      const currentLayer = tree[tree.length - 1];
      const nextLayer: string[] = [];

      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          nextLayer.push(this.hashPair(currentLayer[i], currentLayer[i + 1]));
        } else {
          // Odd number of nodes, promote the last one
          nextLayer.push(currentLayer[i]);
        }
      }

      tree.push(nextLayer);
    }

    return tree;
  }

  /**
   * Get the Merkle root
   */
  getRoot(): string {
    return `0x${this.tree[this.tree.length - 1][0]}`;
  }

  /**
   * Get the entire tree
   */
  getTree(): string[][] {
    return this.tree;
  }

  /**
   * Get proof for a specific leaf
   */
  getProof(index: number): string[] {
    if (index < 0 || index >= this.leaves.length) {
      throw new Error('Invalid leaf index');
    }

    const proof: string[] = [];
    let currentIndex = index;

    for (let i = 0; i < this.tree.length - 1; i++) {
      const layer = this.tree[i];
      const isRightNode = currentIndex % 2 === 1;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

      if (siblingIndex < layer.length) {
        proof.push(`0x${layer[siblingIndex]}`);
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  /**
   * Verify a proof
   */
  static verify(leaf: string, proof: string[], root: string): boolean {
    let computedHash = leaf.replace(/^0x/, '');

    for (const proofElement of proof) {
      const proofHash = proofElement.replace(/^0x/, '');

      const combined =
        computedHash < proofHash
          ? computedHash + proofHash
          : proofHash + computedHash;

      computedHash = crypto.createHash('sha256').update(combined).digest('hex');
    }

    return `0x${computedHash}` === root;
  }

  /**
   * Get all leaves
   */
  getLeaves(): string[] {
    return this.leaves.map((leaf) => `0x${leaf}`);
  }

  /**
   * Get leaf count
   */
  getLeafCount(): number {
    return this.leaves.length;
  }
}

