import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
// export async function POST(request: Request) {
//   //const pets = await sql`SELECT time_tst AT TIME ZONE 'UTC' AS time_tst FROM time_test WHERE time_tst ;`;
//   const measurements = await sql`SELECT * FROM espdata ORDER BY time DESC LIMIT 21;`;
//   return NextResponse.json({ measurements }, { status: 200 });
// }

export async function POST(request: Request) {
  // Parseamos el cuerpo de la solicitud para obtener los datos enviados
  const { test, body } = await request.json();
  
  //console.log("Llego el json: ", request.json());

  // Insertamos los datos en la base de datos
  // await sql`INSERT INTO post_test (test, body) 
  //           VALUES (${test}, ${body});`;

  // Seleccionamos los últimos 15 registros
  // const measurements =
  //   await sql`SELECT * FROM post_test;`;
  return NextResponse.json({test, body}, { status: 200 });
}

export async function PUT(request: Request) {
  const { test, body } = await request.json();

  
  return NextResponse.json({test, body}, { status: 200 });
}