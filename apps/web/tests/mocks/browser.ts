/**
 * MSW Browser Setup for Browser Environment (Playwright/E2E Tests)
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup worker with handlers for browser
export const worker = setupWorker(...handlers);
