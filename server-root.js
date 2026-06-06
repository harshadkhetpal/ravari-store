#!/usr/bin/env node
/**
 * Root-level server entry point for Hostinger
 * Delegates to backend/server.js with proper path resolution
 */

require('dotenv').config();
require('./backend/server.js');
