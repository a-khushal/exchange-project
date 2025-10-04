import { Ticker } from "@/app/utils/types";
import axios from "axios";
import { useEffect, useState } from "react";
import { BidsTable } from "./bids-table";
import { AsksTable } from "./asks-table";
import { SignalingManager } from "@/app/utils/signaling-manager";
import { BACKEND_URL } from "@/app/utils/constants";

export const OrderBook = ({ market }: { market: string }) => {
    const [bids, setBids] = useState<[string, string][]>();
    const [asks, setAsks] = useState<[string, string][]>();
    const [price, setPrice] = useState<string>();

    useEffect(() => {
        async function main() {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/v1/tickers`);
                const data = res.data;
                const ticker = data.find((t: Ticker) => t.symbol === market);

                if (ticker) {
                    setPrice(ticker.lastPrice || '0');
                } else {
                    console.warn(`No ticker data found for market: ${market}`);
                    setPrice('0');
                }

                const depthRes = await axios.get(`${BACKEND_URL}/api/v1/depth?symbol=${market}`);
                if (depthRes.data) {
                    setBids(depthRes.data.bids?.reverse() || []);
                    setAsks(depthRes.data.asks || []);
                }
            } catch (error) {
                console.error('Error fetching order book data:', error);
                setPrice('0');
                setBids([]);
                setAsks([]);
            }
        }

        main();

        const signaling = SignalingManager.getInstance();

        signaling.registerCallback("depth", (data: any) => {
            setBids((originalBids) => {
                let updated = new Map(originalBids || []);

                for (const [price, size] of data.bids) {
                    if (parseFloat(size) === 0) {
                        updated.delete(price);
                    } else {
                        updated.set(price, size);
                    }
                }

                return Array.from(updated.entries()).sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
            });

            setAsks((originalAsks) => {
                let updated = new Map(originalAsks || []);

                for (const [price, size] of data.asks) {
                    if (parseFloat(size) === 0) {
                        updated.delete(price);
                    } else {
                        updated.set(price, size);
                    }
                }

                return Array.from(updated.entries()).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
            });
        }, `depth@${market}`);

        signaling.registerCallback("ticker", (data: any) => {
            if (data.symbol === market && data.lastPrice) {
                setPrice(data.lastPrice);
            }
        }, `ticker@${market}`);

        signaling.sendMessage({ method: "SUBSCRIBE", params: [`depth@${market}`, `ticker@${market}`] });

        return () => {
            // signaling.sendMessage({ method: "UNSUBSCRIBE", params: [`depth.200ms.${market}`, `ticker.200ms.${market}`] });
            signaling.sendMessage({ method: "UNSUBSCRIBE", params: [`depth@${market}`, `ticker@${market}`] });
            signaling.deRegisterCallback("depth", `depth@${market}`);
            signaling.deRegisterCallback("ticker", `ticker@${market}`);
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

