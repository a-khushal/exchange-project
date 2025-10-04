export const AsksTable = ({ asks }: { asks: [string, string][] }) => {
    let currentTotal = 0;

    const filteredAsks = asks
        .filter(([_, quantity]) => parseFloat(quantity) > 0)
        .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));

    const relevantAsks = filteredAsks.slice(0, 15);

    const asksWithTotal: [string, string, number][] = relevantAsks.map(([price, quantity]) => {
        currentTotal += Number(quantity);
        return [price, quantity, currentTotal];
    });

    const maxTotal = currentTotal;
    asksWithTotal.reverse();

    return (
        <div>
            {asksWithTotal.map(([price, quantity, total]) => (
                <Ask
                    key={price}
                    price={price}
                    quantity={quantity}
                    total={total}
                    maxTotal={maxTotal}
                />
            ))}
        </div>
    );
};

function Ask({
    price,
    quantity,
    total,
    maxTotal,
}: {
    price: string;
    quantity: string;
    total: number;
    maxTotal: number;
}) {
    return (
        <div className="relative flex w-full text-xs font-mono">
            <div
                className="absolute top-0 left-0 h-full transition-all"
                style={{
                    width: `${(total / maxTotal) * 100}%`,
                    backgroundColor: "rgba(228, 75, 68, 0.325)",
                }}
            />
            <div className="relative flex w-full justify-between gap-1 px-2 py-0.5 z-10">
                <div className="w-1/3 text-left text-red-400">{price}</div>
                <div className="w-1/3 text-center">{quantity}</div>
                <div className="w-1/3 text-right">{total.toFixed(2)}</div>
            </div>
        </div>
    );
}
