import { Button, Input } from "@heroui/react";
import { FC, useEffect, useState } from "react";
import { erc20Abi, parseEther, parseUnits } from "viem";
import { useSendTransaction, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { usdts } from "../utils/usdts";

interface ITransferPropsType {
    walletAddres: string;
    eth: bigint | number | string;
    usdt: bigint | number | string;
    chainId: number;
    usdtContractAddress?: string | null;
    onTransactionSuccess: (hash?: `0x${string}`) => void;
}

const Transfer: FC<ITransferPropsType> = ({
    eth,
    usdt,
    chainId,
    usdtContractAddress,
    walletAddres,
    onTransactionSuccess
}) => {
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [tokenType, setTokenType] = useState<"eth" | "usdt">("eth");
    const [error, setError] = useState("");
    const [chain, setChain] = useState<typeof usdts[keyof typeof usdts]>();

    useEffect(() => {
        const chain = usdts[chainId];
        if (!chain) {
            return;
        }

        setChain(chain);
    }, [chainId]);

    const { data: usdthash, writeContract, reset: usdtTransactionReset } = useWriteContract();
    const handleUsdtTransfer = () => {
        if (!usdtContractAddress) {
            return;
        }

        writeContract({
            address: usdtContractAddress as any,
            abi: erc20Abi,
            functionName: 'transfer',
            args: ['0xRecipientAddress...', parseUnits(amount, 18)],
        });
    };

    const { sendTransaction, data: ethhash, reset: ethTransactionReset } = useSendTransaction();
    const {
        isLoading: isEthTxLoading,
        isSuccess: isEthTxSuccess,
        isError: isEthTxError,
        error: txEthError,

    } = useWaitForTransactionReceipt({ hash: ethhash });

    const {
        isLoading: isUsdtTxLoading,
        isSuccess: isUsdtTxSuccess,
        isError: isUsdtTxError,
        error: txUsdtError,
    } = useWaitForTransactionReceipt({ hash: usdthash });

    const balance = tokenType === "eth" ? Number(eth) : Number(usdt);

    const validateAddress = (address: string) => {
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            const error = "invalid address";
            setError(error);
            return error;
        }

        setError('');

        return true;
    };

    const validateAmount = (amount: string | number) => {
        amount = Number(amount);
        if (isNaN(amount) || amount < 0 || amount > balance) {
            const error = "invalid amount";
            setError(error);
            return error;
        }

        setError('');

        return true;
    }

    const handleSubmit = () => {
        if (error) return;

        const amnt = Number(amount);
        if (isNaN(amnt) || amnt <= 0 || amnt > balance) {
            return;
        }

        console.log(`Sending ${amount} ${tokenType} to ${recipient} on chain ${chainId}`);

        if (tokenType === 'eth') {
            sendTransaction({
                to: recipient as any,
                value: parseEther(amount)
            });
        } else if (tokenType === 'usdt') {
            handleUsdtTransfer();
        }
    };

    const handleMax = () => {
        const _balance = balance.toString();
        setAmount(_balance);
    };

    useEffect(() => {
        setAmount('0');
    }, [tokenType, walletAddres, isEthTxSuccess, isEthTxError, isUsdtTxSuccess, isUsdtTxError]);

    const shortenHash = (hash?: `0x${string}`) => {
        if (!hash) {
            return '';
        }

        const h = hash.slice(0, 4) + '...' + hash.slice(-3);
        const explorer = `${chain?.blockScannerUrl}tx/${hash}`;

        return <a className="!underline" title="see the transaction in the block explorer" href={explorer} target="_blank">{h}</a>
    }

    useEffect(() => {
        if (!isEthTxSuccess || !ethhash || tokenType !== 'eth') {
            return;
        }

        ethTransactionReset();
        onTransactionSuccess(ethhash);
    }, [isEthTxSuccess, onTransactionSuccess, ethhash, tokenType]);

    useEffect(() => {
        if (!isUsdtTxSuccess || !usdthash || tokenType !== 'usdt') {
            return;
        }

        usdtTransactionReset();
        onTransactionSuccess(usdthash);
    }, [isUsdtTxSuccess, onTransactionSuccess, usdthash, tokenType]);


    return (
        <div className="flex flex-col gap-4 p-6 w-full bg-[#111] rounded-xl shadow-md border border-gray-700">
            <h2 className="text-white text-lg font-semibold text-center">Token Transfer</h2>

            <div className="flex items-center gap-2">
                <Button
                    variant={tokenType === "eth" ? "solid" : "ghost"}
                    color="primary"
                    onPress={() => setTokenType("eth")}
                    disabled={isEthTxLoading || isUsdtTxLoading}
                >
                    ETH
                </Button>
                <Button
                    variant={tokenType === "usdt" ? "solid" : "ghost"}
                    color="primary"
                    onPress={() => setTokenType("usdt")}
                    disabled={!usdtContractAddress || isEthTxLoading || isUsdtTxLoading}
                >
                    USDT
                </Button>
            </div>

            <Input
                className="text-white"
                variant="bordered"
                label="Recipient Address"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                color="primary"
                validate={validateAddress}
                disabled={isEthTxLoading || isUsdtTxLoading}
            />

            <div className="relative">
                <Input
                    className="text-white"
                    type="number"
                    label="Amount"
                    placeholder="Enter amount"
                    pattern="[0-9]*[.,]?[0-9]*"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(',', '.'))}
                    min={0}
                    step="any"
                    color="primary"
                    validate={validateAmount}
                    disabled={isEthTxLoading || isUsdtTxLoading}
                />
                <Button
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    variant="ghost"
                    onPress={handleMax}
                    disabled={isEthTxLoading || isUsdtTxLoading}
                >
                    MAX
                </Button>
            </div>

            {isEthTxError && txEthError && <p className="text-red-500 text-sm">{txEthError.message}</p>}
            {isUsdtTxError && txUsdtError && <p className="text-red-500 text-sm">{txUsdtError.message}</p>}

            {isEthTxSuccess && <p className="text-green-500 text-sm">Amount transfered succesfully. {shortenHash(ethhash)}</p>}
            {isUsdtTxSuccess && <p className="text-green-500 text-sm">Amount transfered succesfully. {shortenHash(usdthash)}</p>}

            {isEthTxLoading && <p className="text-white-500 text-sm">processing transaction: {shortenHash(ethhash)}</p>}
            {isUsdtTxLoading && <p className="text-white-500 text-sm">processing transaction: {shortenHash(usdthash)}</p>}

            <Button color="primary" onPress={handleSubmit} disabled={isEthTxLoading || isUsdtTxLoading}>
                Transfer
            </Button>
        </div>
    );
};

export default Transfer;
