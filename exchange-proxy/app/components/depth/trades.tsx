import { useEffect, useState } from "react";
import axios from "axios";
import { SignalingManager } from "@/app/utils/signaling-manager";
import { BACKEND_URL } from "@/app/utils/constants";

interface Trade {
    id: number;
    isBuyerMaker: boolean;
    price: string;
    quantity: string;
    timestamp: number;
}

export const Trades = ({ market }: { market: string }) => {
    const [trades, setTrades] = useState<Trade[]>([]);

    useEffect(() => {
        async function fetchInitialTrades() {
            const res = await axios.get(`${BACKEND_URL}/api/v1/trades?symbol=${market}`);
            setTrades(res.data.reverse());
        }
    
        fetchInitialTrades();
    
        const signaling = SignalingManager.getInstance();
    
        const handleTradeUpdate = (data: Trade[]) => {
            setTrades((prev) => {
                const updated = [...data.reverse(), ...prev];
                return updated.slice(0, 50);
            });
        };
    
        signaling.registerCallback("trade", handleTradeUpdate, `TRADE-${market}`);
        signaling.sendMessage({ method: "SUBSCRIBE", params: [`trade.${market}`] });
    
        return () => {
            signaling.deRegisterCallback("trade", `TRADE-${market}`);
            signaling.sendMessage({ method: "UNSUBSCRIBE", params: [`trade.${market}`] });
        };
    }, [market]);
            

    return (
        <div className="flex flex-col grow overflow-y-hidden">
            <div className="flex flex-col h-full grow overflow-x-hidden">
                <TradeHeader market={market} />
                <div className="flex flex-col no-scrollbar h-full flex-1 overflow-y-auto scrollbar-hide font-sans px-2">
                    {trades.map((trade) => (
                        <TradeRow key={trade.id} trade={trade} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const TradeHeader = ({ market }: { market: string }) => {
    const quoteAsset = market.split("_")[1];
    const baseAsset = market.split("_")[0];
    
    return (
        <div className="flex w-full px-3 py-2 text-xs font-medium text-high-emphasis">
            <div className="w-1/3 text-left truncate text-med-emphasis">Price({quoteAsset})</div>
            <div className="w-1/3 text-center text-med-emphasis">Qty({baseAsset})</div>
            <div className="w-1/3 text-right text-med-emphasis mr-3">Time</div>
        </div>
    );
};

const TradeRow = ({ trade }: { trade: Trade }) => {
    const time = new Date(trade.timestamp).toLocaleTimeString("en-GB", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    const priceColor = trade.isBuyerMaker ? "text-red-400" : "text-green-400";

    return (
        <div className="flex w-full px-3 py-0.5 text-xs font-medium text-high-emphasis">
            <div className={`w-1/3 text-left tabular-nums ${priceColor}`}>
                {trade.price}
            </div>
            <div className="w-1/3 text-center tabular-nums text-med-emphasis">
                {trade.quantity}
            </div>
            <div className="w-1/3 text-right tabular-nums text-med-emphasis">
                {time}
            </div>
        </div>
    );
};
