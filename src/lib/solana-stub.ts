// Stub file for Solana dependencies that Privy doesn't need for Ethereum-only usage
// This prevents build errors when Privy tries to import optional Solana dependencies

export const getTransferSolInstruction = () => {
  throw new Error('Solana functionality not available in this build');
};

export const createTransferSolInstruction = () => {
  throw new Error('Solana functionality not available in this build');
};

export default {
  getTransferSolInstruction,
  createTransferSolInstruction,
};
