import 'dotenv/config';
import { getPayload } from 'payload';
import config from '../../payload.config.js';

async function main() {
  console.log('Connecting to Payload...');
  const payload = await getPayload({ config });
  console.log('Connected. Checking for existing admin...');

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@example.com' } },
  });

  if (existing.docs.length > 0) {
    console.log('Admin user already exists, skipping.');
    return;
  }

  console.log('Creating admin user...');
  await payload.create({
    collection: 'users',
    data: {
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    },
  });
  console.log('Admin user created successfully');
}

main().then(() => process.exit(0)).catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});