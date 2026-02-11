/**
 * Migration script: Add "order" column to the project table.
 *
 * Usage:
 *   DATABASE_URL="postgres://..." npx tsx scripts/add-project-order.ts
 *
 * This script:
 * 1. Adds an "order" INTEGER column with DEFAULT 0 to the project table
 * 2. Populates existing projects with sequential order values based on date DESC
 */

import { neon } from '@neondatabase/serverless';

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log('Adding "order" column to project table...');

  // Add the column if it does not already exist
  await sql`
    ALTER TABLE project
    ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;
  `;

  console.log('Column added. Populating order values based on date DESC...');

  // Assign sequential order values based on current date DESC ordering
  await sql`
    WITH ranked AS (
      SELECT slug, ROW_NUMBER() OVER (ORDER BY date DESC) - 1 AS new_order
      FROM project
    )
    UPDATE project
    SET "order" = ranked.new_order
    FROM ranked
    WHERE project.slug = ranked.slug;
  `;

  console.log('Migration complete. Project order values populated.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
