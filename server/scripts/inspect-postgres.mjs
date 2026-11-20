// server/scripts/inspect-postgres.mjs
import 'dotenv/config';
import { prisma } from '../config/prisma.js';

async function main() {
  await prisma.$connect();
  console.log('PostgreSQL connected.');
  
  // List all models on prisma client
  const modelNames = Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_'));
  console.log('Prisma Client models:', modelNames);

  for (const m of modelNames) {
    if (typeof prisma[m]?.count === 'function') {
      try {
        const count = await prisma[m].count();
        console.log(`  ${m}: ${count} rows`);
      } catch (e) {
        console.log(`  ${m}: count error - ${e.message}`);
      }
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
