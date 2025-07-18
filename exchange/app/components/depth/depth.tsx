import { OrderBook } from "./order-book"

export const Depth = ({ market }: { market: string }) => {
    return (
        <div className="flex flex-col h-full">
            <DepthButtons />
            <OrderBook market={market} />
        </div>
    )
}

const DepthButtons = () => {
    return (
        <div className="px-4 py-4">
            <div className="items-center justify-start flex-row flex gap-2 gap-x-2">
                <div className="flex justify-center flex-col cursor-pointer rounded-lg py-1 font-medium outline-hidden hover:opacity-90 text-high-emphasis px-3 h-8 text-sm bg-base-background-l2">
                    Book
                </div>
                <div className="flex justify-center flex-col cursor-pointer rounded-lg py-1 font-medium outline-hidden hover:opacity-90 text-med-emphasis px-3 h-8 text-sm">
                    Trades
                </div>
            </div>
        </div>
    )
}
