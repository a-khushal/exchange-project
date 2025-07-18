'use client'

import { useState, useEffect } from "react";
import { Ticker } from "../utils/types";
import axios from "axios";

export const MarketInfo = ({market}: {market: string}) => {
    const [ticker, setTicker] = useState<Ticker | null>(null);

    useEffect(() => {
        async function fetchTicker() {
            try {
                const res = await axios.get('/api/v1/tickers');
                const data = res.data
                const ticker = data.find((t: Ticker) => t.symbol === market);
                if (!ticker) {
                    throw new Error(`No ticker found for ${market}`);
                }
                setTicker(ticker)
            } catch (e) {
                setTicker(null);
            }
        }
        fetchTicker();
    }, [market]);

    return (
        <>
            <div className="flex items-center flex-row bg-base-background-l1 relative w-full rounded-lg">
                <div className="flex items-center flex-row no-scrollbar mr-4 h-[72px] w-full overflow-auto pl-4">
                    <div className="flex justify-between flex-row w-full gap-4">
                        <div className="flex flex-row shrink-0 gap-[32px]">
                            <TickerComponent market={market} />
                            <div className="flex items-center flex-row flex-wrap gap-x-6">
                                <div className="flex flex-col h-full justify-center">
                                    <button
                                        type="button"
                                        tabIndex={0}
                                        data-react-aria-pressable="true"
                                        className="cursor-help"
                                        data-rac=""
                                        id="react-aria9853998908-«rn»"
                                    >
                                        <p className="font-medium tabular-nums text-red-400 text-lg">{ticker ? ticker.lastPrice : '--'}</p>
                                    </button>
                                    <p className="text-high-emphasis text-left text-sm font-normal tabular-nums">
                                        ${ticker ? ticker.lastPrice : '--'}
                                    </p>
                                </div>

                                <div className="flex justify-center flex-col relative">
                                    <p className="font-semibold text-med-emphasis text-xs">24H Change</p>
                                    <span className={`mt-1 text-sm leading-4 font-normal tabular-nums ${ticker && Number(ticker.priceChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {ticker ? `${ticker.priceChange} ${Number(ticker.priceChangePercent) > 0 ? '+' : ''}${(Number(ticker.priceChangePercent) * 100).toFixed(2)}%` : '--'}
                                    </span>
                                </div>

                                <div className="flex justify-center flex-col relative">
                                    <p className="font-medium text-med-emphasis text-xs">24H High</p>
                                    <span className="text-high-emphasis mt-1 text-sm leading-4 font-normal tabular-nums">
                                        {ticker ? ticker.high : '--'}
                                    </span>
                                </div>

                                <div className="flex justify-center flex-col relative">
                                    <p className="font-medium text-med-emphasis text-xs">24H Low</p>
                                    <span className="text-high-emphasis mt-1 text-sm leading-4 font-normal tabular-nums">
                                        {ticker ? ticker.low : '--'}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    tabIndex={0}
                                    data-react-aria-pressable="true"
                                    className="font-medium transition-opacity hover:cursor-pointer hover:opacity-80 text-accent-blue text-base text-left"
                                    data-rac=""
                                    id="react-aria9853998908-«rp»"
                                >
                                    <div className="flex justify-center flex-col relative">
                                        <p className="font-medium text-med-emphasis text-xs">24H Volume (USD)</p>
                                        <span className="text-high-emphasis mt-1 text-sm leading-4 font-normal tabular-nums">
                                            {ticker ? Number(ticker.quoteVolume).toLocaleString() : '--'}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function TickerComponent({ market }: { market: string }) {
    return <div className="flex h-[60px] shrink-0 space-x-4">
        <div className="flex flex-row relative ml-2 -mr-4">
            <img alt="SOL Logo" loading="lazy" decoding="async" data-nimg="1" className="z-10 rounded-full h-6 w-6 mt-4 outline-baseBackgroundL1" src="/sol.webp" />
            <img alt="USDC Logo" loading="lazy" decoding="async" data-nimg="1" className="h-6 w-6 -ml-2 mt-4 rounded-full" src="/usdc.webp" />
        </div>
        <button type="button" className="react-aria-Button" data-rac="">
            <div className="flex items-center justify-between flex-row cursor-pointer rounded-lg p-3 hover:opacity-80">
                <div className="flex items-center flex-row gap-2 undefined">
                    <div className="flex flex-row relative">
                        <p className="font-medium text-sm undefined">{market.replace("_", " / ")}</p>
                    </div>
                </div>
            </div>
        </button>
    </div>
}