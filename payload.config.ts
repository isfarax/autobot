import { buildConfig } from 'payload';
import path from 'path';
import { fileURLToPath } from 'url';
import { Users } from './payload/collections/Users';
import { Documents } from './payload/collections/Documents';
import { Media } from './payload/collections/Media';
import { postgresAdapter } from '@payloadcms/db-postgres';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'super-secret-key-change-in-production',
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {},
  db: postgresAdapter({
    pool: {
      host: 'localhost',
      port: 5432,
      database: 'autobot',
      user: 'postgres',
      password: 'somalia',
    },
  }),
  collections: [Users, Documents, Media],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
});