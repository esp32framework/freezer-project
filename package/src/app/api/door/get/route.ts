import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET(request: Request) {
  const doors_data = await sql`
    SELECT *
    FROM doors AS d1
    WHERE time = (
        SELECT MAX(time)
        FROM doors AS d2
        WHERE d1.espid = d2.espid
    );`;

    const resp = NextResponse.json({ doors_data }, { status: 200 });
    resp.headers.set('Cache-Control', 'no-store');
    return resp;
}
