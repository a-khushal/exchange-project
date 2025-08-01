import { useState } from "react";
import { OrderBook } from "./order-book";
import { Trades } from "./trades";

export const Depth = ({ market }: { market: string }) => {
    const [activeTab, setActiveTab] = useState<"book" | "trades">("book");

    return (
        <div className="flex flex-col h-full">
            <DepthButtons activeTab={activeTab} setActiveTab={setActiveTab} />
            {activeTab === "book" ? (
                <OrderBook market={market} />
            ) : (
                <Trades market={market} />
            )}
        </div>
    );
};

const DepthButtons = ({
    activeTab,
    setActiveTab,
}: {
    activeTab: "book" | "trades";
    setActiveTab: (tab: "book" | "trades") => void;
}) => {
    return (
        <div className="px-4 py-4">
            <div className="items-center justify-start flex-row flex gap-2 gap-x-2">
                <div
                    className={`flex justify-center flex-col cursor-pointer rounded-lg py-1 font-medium outline-hidden px-3 h-8 text-sm ${
                        activeTab === "book"
                            ? "bg-base-background-l2 text-high-emphasis"
                            : "text-med-emphasis hover:opacity-90"
                    }`}
                    onClick={() => setActiveTab("book")}
                >
                    Book
                </div>
                <div
                    className={`flex justify-center flex-col cursor-pointer rounded-lg py-1 font-medium outline-hidden px-3 h-8 text-sm ${
                        activeTab === "trades"
                            ? "bg-base-background-l2 text-high-emphasis"
                            : "text-med-emphasis hover:opacity-90"
                    }`}
                    onClick={() => setActiveTab("trades")}
                >
                    Trades
                </div>
            </div>
        </div>
    );
};
