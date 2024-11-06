import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
    const doors_data = await sql`
    SELECT *
    FROM doors
    WHERE time in (
	    SELECT MAX(time)
        FROM doors
        GROUP BY espid
    )`;
    
    return NextResponse.json({ doors_data }, { status: 200 });
}
  