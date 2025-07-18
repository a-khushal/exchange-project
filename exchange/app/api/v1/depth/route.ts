import { PROXY_URL } from '@/app/utils/constants';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
        return NextResponse.json({ error: 'Missing symbol parameter' }, { status: 400 });
    }

    try {
        const response = await axios.get(`${PROXY_URL}/depth?symbol=${symbol}`);
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("Depth fetch error:", error?.response?.data || error.message);
        return NextResponse.json(
            { error: error?.response?.data || error.message || 'Failed to fetch depth' },
            { status: 500 }
        );
    }
}