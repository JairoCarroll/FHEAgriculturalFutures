import { ethers } from 'ethers';

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatBalance(balance: string): string {
  if (!balance) return '0.0000';
  return parseFloat(balance).toFixed(4);
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString();
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

export function weiToEth(wei: string | number): string {
  return ethers.utils.formatEther(wei);
}

export function ethToWei(eth: string | number): string {
  return ethers.utils.parseEther(eth.toString()).toString();
}
