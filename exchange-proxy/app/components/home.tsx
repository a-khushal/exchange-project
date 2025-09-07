export const Home = () => {
    return (
        <div className="flex flex-col bg-base-background-l1 flex-1 gap-3 rounded-xl p-4">
            <div className="flex flex-row">
                <div className="items-center justify-center flex-row flex gap-2">
                    <div className="flex justify-center flex-col cursor-pointer rounded-lg py-1 font-medium outline-hidden hover:opacity-90 text-high-emphasis px-3 h-8 text-sm bg-base-background-l2">Spot</div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr>
                            <th className="border-b border-base-border-light px-1 py-3 text-sm font-normal text-med-emphasis first:pl-2 last:pr-6">
                                <div className="flex flex-row items-center px-1 first:pl-0 cursor-pointer select-none justify-start text-left">Name</div>
                            </th>
                            <th className="border-b border-base-border-light w-[17%] px-1 py-3 text-sm font-normal text-med-emphasis first:pl-2 last:pr-6">
                                <div className="flex flex-row items-center px-1 first:pl-0 cursor-pointer select-none justify-end text-right">Price</div>
                            </th>
                            <th className="border-b border-base-border-light w-[17%] px-1 py-3 text-sm font-normal text-med-emphasis first:pl-2 last:pr-6">
                                <div className="flex flex-row items-center px-1 first:pl-0 cursor-pointer select-none justify-end text-right">24h Volume</div>
                            </th>
                            <th className="border-b border-base-border-light w-[17%] px-1 py-3 text-sm font-normal text-med-emphasis first:pl-2 last:pr-6">
                                <div className="flex flex-row items-center px-1 first:pl-0 cursor-pointer select-none justify-end text-right">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-down h-4 w-4 mr-1" aria-hidden="true">
                                        <path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path>
                                    </svg>
                                    Market Cap
                                </div>
                            </th>
                            <th className="border-b border-base-border-light w-[17%] px-1 py-3 text-sm font-normal text-med-emphasis first:pl-2 last:pr-6">
                                <div className="flex flex-row items-center px-1 first:pl-0 cursor-pointer select-none justify-end text-right">24h Change</div>
                            </th>
                            <th className="border-b border-base-border-light w-[17%] px-1 py-3 text-sm font-normal text-med-emphasis first:pl-2 last:pr-6">
                                <div className="flex flex-row items-center px-1 first:pl-0 cursor-pointer select-none justify-end text-right">Last 7 Days</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="gap-2 divide-y divide-base-border-light">
                        <tr className="group hover:bg-base-background-l2 cursor-pointer">
                            <td className="text-sm tabular-nums px-2 py-3 last:pr-7">
                                <a className="flex shrink whitespace-nowrap" href="/trade/BTC_USD">
                                    <div className="flex items-center undefined">
                                        <div className="relative">
                                            <div className="relative flex-none overflow-hidden rounded-full border-base-border-med border" style={{ width: "40px", height: "40px" }}>
                                                <div className="relative">
                                                    <img alt="BTC Logo" loading="lazy" width="40" height="40" decoding="async" data-nimg="1" className="" srcSet="/_next/image?url=%2Fcoins%2Fbtc.png&amp;w=48&amp;q=95 1x, /_next/image?url=%2Fcoins%2Fbtc.png&amp;w=96&amp;q=95 2x" src="https://backpack.exchange/_next/image?url=%2Fcoins%2Fbtc.png&amp;w=96&amp;q=95" style={{ color: "transparent" }}></img>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-3 flex flex-col">
                                            <p className="text-high-emphasis text-base font-medium whitespace-nowrap">Bitcoin</p>
                                            <div className="flex items-center justify-start flex-row gap-2">
                                                <div className="font-medium text-med-emphasis text-left text-xs leading-5">BTC/USD</div>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </td>
                            <td className="text-sm tabular-nums px-2 py-3 last:pr-7 text-right">
                                <p className="text-base font-medium tabular-nums">$115,042.00</p>
                            </td>
                            <td className="text-sm tabular-nums px-2 py-3 last:pr-7 text-right">
                                <p className="text-base font-medium tabular-nums">$16.1M</p>
                            </td>
                            <td className="text-sm tabular-nums px-2 py-3 last:pr-7 text-right">
                                <p className="text-base font-medium tabular-nums">$2.3T</p>
                            </td>
                            <td className="text-sm tabular-nums px-2 py-3 last:pr-7 text-right">
                                <p className="text-base font-medium tabular-nums text-red-text">-2.56%</p>
                            </td>
                            <td className="text-sm tabular-nums px-2 py-3 last:pr-7 text-right">
                                <div className="align-center flex justify-end"><div className="recharts-wrapper" style={{ position: "relative", cursor: "default", width: "100px", height: "20px" }}>
                                    <svg className="recharts-surface" width="100" height="20" viewBox="0 0 100 20" style={{ width: "100%", height: "100%" }}>
                                        <title></title><desc></desc><defs><clipPath id="recharts1782-clip"><rect x="1" y="1" height="18" width="98"></rect></clipPath></defs><g className="recharts-layer recharts-line"><path stroke="#fd4b4e" strokeWidth="2" width="98" height="18" fill="none" className="recharts-curve recharts-line-curve" d="M1,8.007C2.21,8.279,3.42,8.551,4.63,8.551C5.84,8.551,7.049,7.734,8.259,7.382C9.469,7.03,10.679,6.439,11.889,6.439C13.099,6.439,14.309,6.919,15.519,6.919C16.728,6.919,17.938,5.49,19.148,5.49C20.358,5.49,21.568,6.35,22.778,6.35C23.988,6.35,25.198,2.649,26.407,2.207C27.617,1.764,28.827,1.744,30.037,1.543C31.247,1.342,32.457,1,33.667,1C34.877,1,36.086,2.785,37.296,3.707C38.506,4.63,39.716,6.533,40.926,6.533C42.136,6.533,43.346,6.444,44.556,6.266C45.765,6.089,46.975,3.817,48.185,3.817C49.395,3.817,50.605,3.97,51.815,4.277C53.025,4.583,54.235,7.44,55.444,7.44C56.654,7.44,57.864,6.429,59.074,6.429C60.284,6.429,61.494,6.544,62.704,6.774C63.914,7.004,65.123,8.315,66.333,8.315C67.543,8.315,68.753,7.591,69.963,7.427C71.173,7.262,72.383,7.345,73.593,7.18C74.802,7.016,76.012,5.39,77.222,5.327C78.432,5.264,79.642,5.233,80.852,5.233C82.062,5.233,83.272,6.029,84.481,7.62C85.691,9.212,86.901,14.347,88.111,14.826C89.321,15.305,90.531,15.248,91.741,15.544C92.951,15.84,94.16,16.027,95.37,16.603C96.58,17.179,97.79,18.089,99,19"></path><g className="recharts-layer"></g></g>
                                    </svg>
                                </div>
                            </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}