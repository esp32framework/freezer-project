import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(request: Request) {
    // Instead of returning all we return the 50 last rows. This is to not pass the usage limits of the PostgreSQL database in Vercel
    const measurements = await sql`SELECT * FROM espdata ORDER BY time DESC LIMIT 50;`;
    return NextResponse.json({ measurements }, { status: 200 });
}