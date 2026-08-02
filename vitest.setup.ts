import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const setupDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(setupDir, '.env') });
