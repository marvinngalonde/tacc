import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Manually load the .env file
dotenv.config();

export default defineConfig({
    datasource: {
        // Adding the ! or a fallback helps with TS, 
        // but the CLI needs the actual string value
        url: process.env.DATABASE_URL,
    },
    migrations: {
        seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
    },
});