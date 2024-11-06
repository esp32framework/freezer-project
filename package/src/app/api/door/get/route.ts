import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const doors_data = await sql`
    SELECT *
    FROM doors AS d1
    WHERE time = (
        SELECT MAX(time)
        FROM doors AS d2
        WHERE d1.espid = d2.espid
    );`;

  return NextResponse.json({ doors_data }, { status: 200 });
}
