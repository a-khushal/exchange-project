"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export const Appbar = () => {
    const route = usePathname();
    const router = useRouter()

    return <div className="text-white border-b border-slate-800">
        <div className="flex justify-between items-center p-2">
            <div className="flex">
                <div className={`text-xl pl-4 flex flex-col justify-center cursor-pointer text-white`} onClick={() => router.push('/')}>
                    Exchange
                </div>
                <div className={`text-sm pt-1 flex flex-col justify-center pl-8 cursor-pointer ${route.startsWith('/trade') ? 'text-white' : 'text-slate-500'}`} onClick={() => router.push('/trade/SOL_USDC')}>
                    Trade
                </div>
            </div>
            <div className="flex">
                <div className="p-2 mr-2">
                    <SuccessButton>Deposit</SuccessButton>
                    <PrimaryButton>Withdraw</PrimaryButton>
                </div>
            </div>
        </div>
    </div>
}


export const PrimaryButton = ({ children, onClick }: { children: string, onClick?: () => void }) => {
    return <button type="button" className="text-center font-semibold rounded-lg focus:ring-blue-200 focus:none focus:outline-none hover:opacity-90 disabled:opacity-80 disabled:hover:opacity-80 relative overflow-hidden h-[32px] text-sm px-3 py-1.5 mr-4 ">
        <div className="absolute inset-0 bg-blue-500 opacity-[16%]"></div>
        <div className="flex flex-row items-center justify-center gap-4"><p className="text-blue-500">{children}</p></div>
    </button>

} 

export const SuccessButton = ({ children, onClick }: { children: string, onClick?: () => void }) => {
    return <button type="button" className="text-center font-semibold rounded-lg focus:ring-green-200 focus:none focus:outline-none hover:opacity-90 disabled:opacity-80 disabled:hover:opacity-80 relative overflow-hidden h-[32px] text-sm px-3 py-1.5 mr-4 ">
        <div className="absolute inset-0 bg-green-500 opacity-[16%]"></div>
        <div className="flex flex-row items-center justify-center gap-4"><p className="text-green-500">{children}</p></div>
    </button>

} 