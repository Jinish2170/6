// filepath: d:\files\coding\hemil\6\lib\db-init.ts
import { startPoolMonitor } from './pool-monitor';

// Start monitoring the database connection pool in development
if (process.env.NODE_ENV !== 'production') {
    startPoolMonitor();
}

// Function to gracefully close database connections on app shutdown
export function cleanupDatabaseConnections() {
    console.log('Cleaning up database connections...');
    // Import dynamically to prevent circular dependency
    import('./db').then(({ pool }) => {
        pool.end().then(() => {
            console.log('All database connections closed');
        }).catch(err => {
            console.error('Error closing database connections:', err);
        });
    });
}

// Register cleanup handler for development environment
if (typeof process !== 'undefined') {
    process.on('SIGTERM', cleanupDatabaseConnections);
    process.on('SIGINT', cleanupDatabaseConnections);
}
