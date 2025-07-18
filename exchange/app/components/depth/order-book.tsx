import { Ticker } from "@/app/utils/types";
import axios from "axios";
import { useEffect, useState } from "react";
import { BidsTable } from "./bids-table";
import { AsksTable } from "./asks-table";

export const OrderBook = ({ market }: { market: string }) => {
    const [bids, setBids] = useState<[string, string][]>();
    const [asks, setAsks] = useState<[string, string][]>();
    const [price, setPrice] = useState<string>();

    useEffect(() => {
        async function main() {
            const res = await axios.get('/api/v1/tickers');
            const data = res.data
            const ticker = data.find((t: Ticker) => t.symbol === market);
            setPrice(ticker.lastPrice)

            const depth = (await axios.get(`/api/v1/depth?symbol=${market}`)).data;
            setBids(depth.bids.reverse())
            setAsks(depth.asks);
        }

        main();
    }, [])

    return (
        <div className="flex flex-col grow overflow-y-hidden">
            <div className="flex flex-col h-full grow overflow-x-hidden">
                <BookHeader />
                <div className="flex flex-col no-scrollbar h-full flex-1 overflow-y-auto font-sans px-2">
                    {asks && <AsksTable asks={asks} />}
                    {price && <PriceDisplay price={price}/>}
                    {bids && <BidsTable bids={bids} />}
                </div>
            </div>
        </div>
    );
};

const PriceDisplay = ({price}: {
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
        <div className="flex flex-row min-w-0 gap-1 px-3 py-2">
            <div className="flex justify-between flex-row w-2/3 min-w-0 gap-1">
                <p className="text-high-emphasis font-medium truncate text-xs">
                    Price
                </p>
                <button
                    type="button"
                    tabIndex={0}
                    className="font-medium transition-opacity hover:cursor-pointer hover:opacity-80 text-med-emphasis h-auto truncate text-right text-xs"
                >
                    Size
                </button>
            </div>
            <button
                type="button"
                tabIndex={0}
                className="font-medium transition-opacity hover:cursor-pointer hover:opacity-80 text-med-emphasis h-auto w-1/3 truncate text-right text-xs"
            >
                Total
            </button>
        </div>
    );
};
