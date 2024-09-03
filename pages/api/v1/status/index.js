import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const pgVersionResult = await database.query("SHOW server_version");
  const pgVersionValue = pgVersionResult.rows[0].server_version;

  const maxConnResult = await database.query("SHOW max_connections");
  const maxConnValue = parseInt(maxConnResult.rows[0].max_connections);

  const databaseName = process.env.POSTGRES_DB;
  const openedConnResult = await database.query({
    text: `SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1`,
    values: [databaseName],
  });
  const openedConnValue = openedConnResult.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: pgVersionValue,
        max_connections: maxConnValue,
        opened_connections: openedConnValue,
      },
    },
  });
}

export default status;
