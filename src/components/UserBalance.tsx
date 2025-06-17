import { FC, memo, useEffect, useState } from "react";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { usdts } from "../utils/usdts";
import { erc20Abi } from "viem";
import Transfer from "./Transfer";

const UserBalance: FC = () => {

    const [usdtAddress, setUsdtAddress] = useState<`0x${string}` | null>();
    const [usdtBalance, setUsdtBalance] = useState<bigint | number | string>(0);
    const [ethBalance, setEthBalance] = useState<bigint | number | string>(0);

    const account = useAccount();

    useEffect(() => {
        if (!account.chainId) {
            setUsdtAddress(null);
            return;
        }

        const usdtAddress = usdts[account.chainId].usdtContractAddress;

        if (!usdtAddress) {
            setUsdtAddress(null);
            return;
        }

        setUsdtAddress(usdtAddress);
    }, [account]);

    

    const balanceEth = useBalance({
        address: account.address!,
        chainId: account.chainId!
    });

    const { data: balanceUsdt, isSuccess: isSuccessUsdt, refetch: usdtBalanceRefetch } = useReadContract({
        address: usdtAddress!,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [account.address!],
    })

    useEffect(() => {
        if (!isSuccessUsdt) {
            return;
        }

        const value = balanceUsdt;


        if (!value) {
            setUsdtBalance(0);
        }

        setUsdtBalance(value);
    }, [balanceUsdt]);

    useEffect(() => {
        if (!balanceEth.isSuccess) {
            return;
        }

        const value = Number(balanceEth.data.value);
        const decimals = balanceEth.data.decimals;


        if (!isNaN(value) || !value) {
            setEthBalance(0);
        }

        const ethBalance = !value ? 0 : (value / (10 ** decimals)).toFixed(6);

        setEthBalance(ethBalance);
    }, [balanceEth]);

    const onTransactionSuccess = (hash?: `0x${string}`) => {
        usdtBalanceRefetch();
        balanceEth.refetch();
    }

    return (
        <div className="flex flex-col gap-[30px] w-[50vw] justify-center items-stretch">
            <div className="flex flex-row gap-[10px] items-center justify-center">
                <div>| {usdtBalance} USDT |</div>
                <div>{ethBalance} ETH |</div>
            </div>

            <div>
                <Transfer 
                    walletAddres={account.address!}
                    usdt={usdtBalance}
                    eth={ethBalance}
                    usdtContractAddress={usdtAddress}
                    chainId={account.chainId!}
                    onTransactionSuccess={onTransactionSuccess}
                />
            </div>
        </div>
    );
}

export default memo(UserBalance);