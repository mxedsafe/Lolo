// Native HTTP query to Neon DB (Zero NPM packages required)
async function neonQuery(dbUrl, query, params = []) {
  const url = new URL(dbUrl);
  const endpoint = `https://${url.hostname}/sql`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': dbUrl,
    },
    body: JSON.stringify({ query, params }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Database query error');
  }
  return data.rows;
}

export async function onRequestGet(context) {
  try {
    const dbUrl = context.env.DATABASE_URL;
    const query = `SELECT id, username, type, dzd, cad, date, edit_requested as "editRequested", request_note as "requestNote" FROM transactions ORDER BY date DESC`;
    const rows = await neonQuery(dbUrl, query);

    return new Response(JSON.stringify(rows), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const dbUrl = context.env.DATABASE_URL;
    const data = await context.request.json();

    const query = `
      INSERT INTO transactions (id, username, type, dzd, cad, date, edit_requested, request_note)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const params = [
      data.id,
      data.username,
      data.type,
      data.dzd,
      data.cad,
      data.date,
      data.editRequested || false,
      data.requestNote || ''
    ];

    await neonQuery(dbUrl, query, params);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestDelete(context) {
  try {
    const dbUrl = context.env.DATABASE_URL;
    const { id } = await context.request.json();

    const query = `DELETE FROM transactions WHERE id = $1`;
    await neonQuery(dbUrl, query, [id]);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
