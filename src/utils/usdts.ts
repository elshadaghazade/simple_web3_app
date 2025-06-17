export const usdts: Record<number | string, {
    chain: string;
    usdtContractAddress: `0x${string}`,
    blockScannerUrl: string;
}> = {
    1: {
        chain: 'Ethereum',
        usdtContractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        blockScannerUrl: 'https://etherscan.io/'
    },
    137: {
        chain: 'Polygon',
        usdtContractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        blockScannerUrl: 'https://polygonscan.com/',
    },
    42161: {
        chain: 'Arbitrum One',
        usdtContractAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        blockScannerUrl: 'http://arbiscan.io/'
    },
    8453: {
        chain: 'Base',
        usdtContractAddress: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
        blockScannerUrl: 'https://basescan.org/',
    },
    11155111: {
        chain: 'Sepolia',
        usdtContractAddress: '0x863aE464D7E8e6F95b845FD3AF0f9A2B2034D6dD',
        blockScannerUrl: 'https://sepolia.etherscan.io/'
    }
}