"use client"

import { Appbar } from "./appbar"
import { Depth } from "./depth/depth"
import { MarketInfo } from "./market-info"
import { Swap } from "./swap"
import { TradeView } from "./trade-view"

export default function Market({ market }: { market: string }) {
    return (
        <>
            <Appbar />
            <div className="bg-base-background-l0 text-high-emphasis flex flex-1 flex-col overflow-auto">
                <div className="flex flex-col flex-1">
                    <div className="flex flex-row mb-4 h-screen flex-1 gap-2 overflow-hidden px-4">
                        <div className="flex flex-col flex-1">
                            <div className="flex flex-col gap-2">
                                <MarketInfo market={market} />
                                <div className="flex flex-col">
                                    <div className="flex flex-row relative gap-2" style={{ "height": "620px" }}>
                                        <div className="flex flex-col bg-base-background-l1 flex-1 overflow-hidden rounded-lg px-3 pt-2">
                                            <TradeView market={market} />
                                        </div>
                                        <div className="flex flex-col bg-base-background-l1 w-1/3 max-w-[300px] min-w-[260px] overflow-hidden rounded-lg">
                                            <Depth market={market} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Swap />
                    </div>
                </div>
            </div>
        </>
    )
}
