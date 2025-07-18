declare const LightweightCharts: any;

export class ChartManager {
    private candleSeries: any;
    private lastUpdateTime: number = 0;
    private chart: any;
    private currentBar: {
        open: number | null;
        high: number | null;
        low: number | null;
        close: number | null;
    } = {
        open: null,
        high: null,
        low: null,
        close: null,
    };

    constructor(
        ref: any,
        initialData: any[],
        layout: { background: string; color: string }
    ) {
        const chart = LightweightCharts.createChart(ref, {
            autoSize: true,
            overlayPriceScales: {
                ticksVisible: true,
                borderVisible: true,
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
            rightPriceScale: {
                visible: true,
                ticksVisible: true,
                entireTextOnly: true,
            },
            grid: {
                horzLines: {
                    visible: false,
                },
                vertLines: {
                    visible: false,
                },
            },
            layout: {
                background: {
                    type: LightweightCharts.ColorType.Solid,
                    color: layout.background,
                },
                textColor: "white",
            },
        });
        this.chart = chart;
        this.candleSeries = chart.addCandlestickSeries();

        this.candleSeries.setData(
            initialData.map((data) => ({
                ...data,
                time: (data.timestamp / 1000),
            }))
        );
    }
    public update(updatedPrice: any) {
        if (!this.lastUpdateTime) {
            this.lastUpdateTime = new Date().getTime();
        }

        this.candleSeries.update({
            time: (this.lastUpdateTime / 1000),
            close: updatedPrice.close,
            low: updatedPrice.low,
            high: updatedPrice.high,
            open: updatedPrice.open,
        });

        if (updatedPrice.newCandleInitiated) {
            this.lastUpdateTime = updatedPrice.time;
        }
    }
    public destroy() {
        this.chart.remove();
    }
}