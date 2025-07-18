'use client'
import Market from "@/app/components/market";
import { useParams } from "next/navigation";

export default function Page() {
    const { market } = useParams();

    return (
        <Market market={market as string}/>
    )
}