import { PROXY_URL } from '@/app/utils/constants';
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await axios.get(`${PROXY_URL}/tickers`);
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to fetch tickers' }, { status: 500 });
    }
}
