/**
 * Test Server
 * Starts backend in test mode with isolated database
 */

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment variables
config({ path: path.join(__dirname, '.env.test') });

// Start server
await import('./src/server.js');
