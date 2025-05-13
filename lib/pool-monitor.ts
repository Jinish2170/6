import { activeConnections } from './db';

// Pool health monitor
let poolMonitorInterval: NodeJS.Timeout | null = null;

export function startPoolMonitor() {
    if (poolMonitorInterval) return;
    
    console.log('[DB Pool Monitor] Starting database connection monitoring');
    
    poolMonitorInterval = setInterval(() => {
        console.log(`[DB Pool Monitor] Active connections: ${activeConnections}`);
        // Check for a potential connection leak
        if (activeConnections > 10) {
            console.warn(`[WARNING] High number of active connections: ${activeConnections}`);
        }
    }, 30000); // Log every 30 seconds
}

// Export a function to stop the monitor if needed
export function stopPoolMonitor() {
    if (poolMonitorInterval) {
        clearInterval(poolMonitorInterval);
        poolMonitorInterval = null;
        console.log('[DB Pool Monitor] Stopped');
    }
}
