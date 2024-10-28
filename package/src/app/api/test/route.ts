import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function GET(request: Request) {
  //const pets = await sql`SELECT time_tst AT TIME ZONE 'UTC' AS time_tst FROM time_test WHERE time_tst ;`;
  const measurements = await sql`SELECT * FROM espdata ORDER BY time DESC LIMIT 15;`;
  return NextResponse.json({ measurements }, { status: 200 });
}
