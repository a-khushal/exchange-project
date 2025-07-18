import { useEffect, useRef } from "react";
import { KLine } from "../utils/types";
import { ChartManager } from "../utils/chart-manager";
import axios from "axios";

export function TradeView({
    market,
}: {
    market: string;
}) {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartManagerRef = useRef<ChartManager>(null);

    const init = async () => {
        let klineData: KLine[] = [];
        try {
            const response = await axios.get(`/api/v1/klines?symbol=${market}&interval=${"1h"}&startTime=${Math.floor((new Date().getTime() - 1000 * 60 * 60 * 24 * 10) / 1000)}&endTime=${Math.floor(new Date().getTime() / 1000)}`);
            klineData = response.data;
            klineData.sort((x, y) => (Number(x.end) < Number(y.end) ? -1 : 1));
        } catch (e) {
            console.error(e);
        }
        if (chartRef) {
            if (chartManagerRef.current) {
                chartManagerRef.current.destroy();
            }
            const chartManager = new ChartManager(
                chartRef.current,
                [
                    ...klineData?.map((x) => ({
                        close: parseFloat(x.close),
                        high: parseFloat(x.high),
                        low: parseFloat(x.low),
                        open: parseFloat(x.open),
                        timestamp: new Date(x.end),
                    })),
                ].sort((x, y) => (x.timestamp < y.timestamp ? -1 : 1)) || [],
                {
                    background: "#0e0f14",
                    color: "white",
                }
            );
            //@ts-ignore
            chartManagerRef.current = chartManager;
        }
    };

    useEffect(() => {
        init();
    }, [market, chartRef]);

    return (
        <>
            <div ref={chartRef} style={{ height: "520px", width: "100%", marginTop: 4 }}></div>
        </>
    );
}