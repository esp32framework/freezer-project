import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const espid = searchParams.get("id");
  const temp = searchParams.get("temp");
  const hum = searchParams.get("hum");
  const press = searchParams.get("press");
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

  await sql`INSERT INTO EspData (espid, time, temperature, humidity, pressure) 
            VALUES (${espid}, ${sql_date}, ${temp}, ${hum}, ${press});`;

  const measurements =
    await sql`SELECT * FROM espdata ORDER BY time DESC LIMIT 15;`;
  return NextResponse.json({ measurements }, { status: 200 });
}
