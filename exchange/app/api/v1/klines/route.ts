import { PROXY_URL } from '@/app/utils/constants';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');

    if (!symbol || !interval || !startTime || !endTime) {
        return NextResponse.json({ error: 'Missing parameter' }, { status: 400 });
    }

    try {
        const response = await axios.get(`${PROXY_URL}/klines?symbol=${symbol}&interval=${"1h"}&startTime=${parseInt(startTime)}&endTime=${parseInt(endTime)}`);
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("Depth fetch error:", error?.response?.data || error.message);
        return NextResponse.json(
            { error: error?.response?.data || error.message || 'Failed to fetch depth' },
            { status: 500 }
        );
    }
}