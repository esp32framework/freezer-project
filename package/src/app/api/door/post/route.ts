import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { espid, is_open } = await request.json();
  const open = is_open == "true" ? true : false;

  const date = new Date();
  const argentinaTime = new Date(
    date.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })
  );

  // Obtenemos los componentes de la fecha y hora
  const year = argentinaTime.getFullYear();
  const month = String(argentinaTime.getMonth() + 1).padStart(2, "0"); // Mes empieza desde 0
  const day = String(argentinaTime.getDate()).padStart(2, "0");
  const hours = String(argentinaTime.getHours()).padStart(2, "0");
  const minutes = String(argentinaTime.getMinutes()).padStart(2, "0");
  const seconds = String(argentinaTime.getSeconds()).padStart(2, "0");

  const sql_date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  await sql`INSERT INTO doors (time, espid, is_open) 
            VALUES (${sql_date}, ${espid}, ${open});`;

  return NextResponse.json({ status: 200 });
}
