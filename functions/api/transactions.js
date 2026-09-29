import { neon } from '@neondatabase/serverless';

export async function onRequestGet(context) {
  try {
    const sql = neon(context.env.DATABASE_URL);
    const rows = await sql`SELECT id, username, type, dzd, cad, date, edit_requested as "editRequested", request_note as "requestNote" FROM transactions ORDER BY date DESC`;
    return new Response(JSON.stringify(rows), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const sql = neon(context.env.DATABASE_URL);

    await sql`
      INSERT INTO transactions (id, username, type, dzd, cad, date, edit_requested, request_note)
      VALUES (${data.id}, ${data.username}, ${data.type}, ${data.dzd}, ${data.cad}, ${data.date}, ${data.editRequested}, ${data.requestNote})
    `;

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestDelete(context) {
  try {
    const { id } = await context.request.json();
    const sql = neon(context.env.DATABASE_URL);

    await sql`DELETE FROM transactions WHERE id = ${id}`;

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
