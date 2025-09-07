import { Ticker } from "@/app/utils/types";
import axios from "axios";
import { useEffect, useState } from "react";
import { BidsTable } from "./bids-table";
import { AsksTable } from "./asks-table";
import { SignalingManager } from "@/app/utils/signaling-manager";

export const OrderBook = ({ market }: { market: string }) => {
    const [bids, setBids] = useState<[string, string][]>();
    const [asks, setAsks] = useState<[string, string][]>();
    const [price, setPrice] = useState<string>();

    useEffect(() => {
        async function main() {
            const res = await axios.get('/api/v1/tickers');
            const data = res.data;
            const ticker = data.find((t: Ticker) => t.symbol === market);
            setPrice(ticker.lastPrice);
    
            const depth = (await axios.get(`/api/v1/depth?symbol=${market}`)).data;
            setBids(depth.bids.reverse());
            setAsks(depth.asks);
        }
    
        main();
    
        const signaling = SignalingManager.getInstance();
    
        signaling.registerCallback("depth", (data: any) => {
            setBids((originalBids) => {
                const bidsAfterUpdate = [...(originalBids || [])];
    
                for (let i = 0; i < bidsAfterUpdate.length; i++) {
                    for (let j = 0; j < data.bids.length; j++) {
                        if (bidsAfterUpdate[i][0] === data.bids[j][0]) {
                            bidsAfterUpdate[i][1] = data.bids[j][1];
                            break;
                        }
                    }
                }
                return bidsAfterUpdate;
            });
    
            setAsks((originalAsks) => {
                const asksAfterUpdate = [...(originalAsks || [])];
    
                for (let i = 0; i < asksAfterUpdate.length; i++) {
                    for (let j = 0; j < data.asks.length; j++) {
                        if (asksAfterUpdate[i][0] === data.asks[j][0]) {
                            asksAfterUpdate[i][1] = data.asks[j][1];
                            break;
                        }
                    }
                }
                return asksAfterUpdate;
            });
        }, `DEPTH-${market}`);
    
        signaling.registerCallback("ticker", (data: any) => {
            if (data.symbol === market && data.lastPrice) {
                setPrice(data.lastPrice);
            }
        }, `TICKER-${market}`);
    
        signaling.sendMessage({ method: "SUBSCRIBE", params: [`depth.${market}`, `ticker.${market}`] });
    
        return () => {
            signaling.sendMessage({ method: "UNSUBSCRIBE", params: [`depth.200ms.${market}`, `ticker.200ms.${market}`] });
            signaling.deRegisterCallback("depth", `DEPTH-${market}`);
            signaling.deRegisterCallback("ticker", `TICKER-${market}`);
        };
    }, []);
    
    return (
        <div className="flex flex-col grow overflow-y-hidden">
            <div className="flex flex-col h-full grow overflow-x-hidden">
                <BookHeader />
                <div className="flex flex-col no-scrollbar h-full flex-1 overflow-y-auto scrollbar-hide font-sans px-2">
                    {asks && <AsksTable asks={asks} />}
                    {price && <PriceDisplay price={price} />}
                    {bids && <BidsTable bids={bids} />}
                </div>
            </div>
        </div>
    );
};

const PriceDisplay = ({ price }: {
    price: string
}) => {
    return (
        <div className="flex flex-col bg-base-background-l1 z-10 flex-0 snap-centerpy-1 sticky bottom-0 py-1">
            <div className="flex justify-between flex-row">
                <div className="flex items-center flex-row gap-1.5">
                    <button type="button" tabIndex={0} data-react-aria-pressable="true" className="hover:opacity-90" data-rac="" id="react-aria5665846618-«r4c»">
                        <p className="font-medium tabular-nums text-red-text">
                            {price}
                        </p>
                    </button>
                </div>
                <button type="button" tabIndex={0} data-react-aria-pressable="true" className="font-medium hover:cursor-pointer hover:opacity-80 text-accent-blue text-xs transition-opacity pointer-events-none opacity-0 duration-200" data-rac="" id="react-aria5665846618-«r4e»">
                    Recenter
                </button>
            </div>
        </div>
    )
}

const BookHeader = () => {
    return (
        <div className="flex w-full px-3 py-2 text-xs font-medium text-high-emphasis">
            <div className="w-1/3 text-left truncate">Price</div>
            <div className="w-1/3 text-center text-med-emphasis hover:opacity-80 hover:cursor-pointer">
                <button type="button" tabIndex={0}>Size</button>
            </div>
            <div className="w-1/3 text-right text-med-emphasis hover:opacity-80 hover:cursor-pointer">
                <button type="button" tabIndex={0}>Total</button>
            </div>
        </div>
    );
};

