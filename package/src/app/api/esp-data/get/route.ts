import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(request: Request) {
    const measurements = await sql`SELECT * FROM espdata ORDER BY time DESC LIMIT 21;`;
    return NextResponse.json({ measurements }, { status: 200 });
}
