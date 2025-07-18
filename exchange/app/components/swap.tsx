"use client"

import React from "react"
import Link from "next/link"

export function Swap() {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col bg-base-background-l1 w-[332px] gap-4 rounded-lg px-4 py-4">
                <div className="flex flex-col gap-4">
                    <div className="bg-base-background-l2 flex h-12 w-full overflow-hidden rounded-xl">
                        <button className="w-full overflow-hidden rounded-xl text-sm font-semibold bg-green-background-transparent text-green-text">
                            Buy
                        </button>
                        <button className="w-full rounded-xl text-sm font-semibold text-low-emphasis hover:text-red-text">
                            Sell
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-row items-center gap-2">
                            <div className="flex justify-center flex-col cursor-pointer rounded-lg py-1 px-3 font-medium text-sm bg-base-background-l2 text-high-emphasis hover:opacity-90 h-8">
                                Limit
                            </div>
                            <div className="flex justify-center flex-col cursor-pointer rounded-lg py-1 px-3 font-medium text-sm text-med-emphasis hover:opacity-90 h-8">
                                Market
                            </div>
                            <div className="flex flex-row group">
                                <button className="text-med-emphasis h-8 rounded-l-lg pr-1 pl-3 text-sm font-medium group-hover:opacity-90">
                                    Conditional
                                </button>
                                <button className="text-med-emphasis h-8 rounded-r-lg border-l border-none pr-2 text-sm font-medium group-hover:opacity-90">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-chevron-down text-base-icon hover:text-high-emphasis"
                                    >
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col text-high-emphasis flex-1 gap-3">
                            <div className="flex justify-between">
                                <button className="cursor-help text-med-emphasis text-xs font-normal relative">
                                    Balance
                                    <span className="border-base-border-med absolute bottom-0 left-0 w-full translate-y-full border-b border-dashed" />
                                </button>
                                <p className="text-high-emphasis text-xs font-medium">–</p>
                            </div>

                            {/* Price */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-med-emphasis text-xs font-normal">Price</p>
                                    <div className="flex flex-row text-xs font-medium text-accent-blue gap-2">
                                        <button className="hover:opacity-80">Mid</button>
                                        <div className="bg-base-border-med h-4 w-px" />
                                        <button className="hover:opacity-80">BBO</button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <input
                                        step="0.01"
                                        placeholder="0"
                                        type="text"
                                        value="176.02"
                                        inputMode="numeric"
                                        readOnly
                                        className="bg-base-background-l2 placeholder-med-emphasis border border-transparent focus:border-accent-blue focus:outline-none h-12 w-full rounded-lg pr-10 pl-3 text-2xl"
                                    />
                                    <div className="absolute top-1/2 right-1 -translate-y-1/2 p-2 pointer-events-none">
                                        <img
                                            src="https://backpack.exchange/coins/usd.svg"
                                            alt="USD Logo"
                                            width={24}
                                            height={24}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="flex flex-col gap-2">
                                <p className="text-med-emphasis text-xs font-normal">Quantity</p>
                                <div className="relative">
                                    <input
                                        step="0.01"
                                        placeholder="0"
                                        type="text"
                                        inputMode="numeric"
                                        className="bg-base-background-l2 placeholder-med-emphasis border border-transparent focus:border-accent-blue focus:outline-none h-12 w-full rounded-lg pr-10 pl-3 text-2xl"
                                    />
                                    <div className="absolute top-1/2 right-1 -translate-y-1/2 p-2 pointer-events-none">
                                        <img
                                            src="https://backpack.exchange/_next/image?url=%2Fcoins%2Fsol.png&w=48&q=95"
                                            alt="SOL Logo"
                                            width={24}
                                            height={24}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Slider */}
                            <div className="mt-4 mb-1">
                                <div className="relative bg-base-background-l3 mx-2 h-1 rounded-full">
                                    <div className="bg-accent-blue h-full rounded-full" style={{ width: "0%" }} />
                                    <div className="bg-accent-blue top-0.5 h-3.5 w-3.5 rounded-full border-2 border-base-background-l3 absolute left-0% translate-x-[-50%]" />
                                </div>
                                <div className="flex justify-between mt-2 text-med-emphasis text-xs font-normal">
                                    <p>0</p>
                                    <p>100%</p>
                                </div>
                            </div>

                            {/* Order Value */}
                            <p className="text-med-emphasis text-xs font-normal">Order Value</p>
                            <div className="relative">
                                <input
                                    placeholder="0"
                                    type="text"
                                    inputMode="numeric"
                                    className="bg-base-background-l2 placeholder-med-emphasis border border-transparent focus:border-accent-blue focus:outline-none h-12 w-full rounded-lg pr-10 pl-3 text-2xl"
                                />
                                <div className="absolute top-1/2 right-1 -translate-y-1/2 p-2 pointer-events-none">
                                    <img
                                        src="https://backpack.exchange/coins/usd.svg"
                                        alt="USD Logo"
                                        width={24}
                                        height={24}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-4">
                            <Link
                                href="/signup"
                                className="inline-flex justify-center items-center h-12 rounded-xl px-4 py-2 text-base font-semibold bg-button-primary-background text-button-primary-text hover:opacity-90"
                            >
                                Sign up to trade
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex justify-center items-center h-12 rounded-xl px-4 py-2 text-base font-semibold bg-button-secondary-background text-button-secondary-text hover:opacity-90"
                            >
                                Sign in to trade
                            </Link>
                        </div>

                        {/* Checkboxes */}
                        <div className="flex flex-row mt-2 flex-wrap gap-x-4 gap-y-3">
                            <div className="flex items-center">
                                <input
                                    id="postOnly"
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 rounded-sm border-2 border-base-border-med bg-base-950 cursor-pointer"
                                />
                                <label
                                    htmlFor="postOnly"
                                    className="pl-2 text-xs font-medium text-med-emphasis cursor-help"
                                >
                                    Post Only
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="ioc"
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 rounded-sm border-2 border-base-border-med bg-base-950 cursor-pointer"
                                />
                                <label
                                    htmlFor="ioc"
                                    className="pl-2 text-xs font-medium text-med-emphasis cursor-help"
                                >
                                    IOC
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-1" />
        </div>
    )
}
