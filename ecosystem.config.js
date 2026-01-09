/**
 * PM2 Ecosystem Configuration - RaveHub WhatsApp Bot
 * 
 * PRODUCTION-OPTIMIZED for 24/7 operation with anti-ban safeguards.
 * 
 * CRITICAL SETTINGS EXPLAINED:
 * 
 * 1. exec_mode: "fork" (NOT cluster)
 *    - useMultiFileAuthState corrupts with concurrent processes
 *    - Only one instance should access auth_info folder
 * 
 * 2. exp_backoff_restart_delay
 *    - Exponential backoff prevents "restart loops" 
 *    - Avoids rapid reconnection attempts that trigger WhatsApp bans
 * 
 * 3. max_memory_restart
 *    - Prevents memory leaks from media handling
 *    - Restarts before OOM crashes
 * 
 * 4. watch: false
 *    - CRITICAL: Don't watch auth_info folder
 *    - Session files update frequently, would cause constant restarts
 */

module.exports = {
    apps: [{
        // ===== IDENTIFICATION =====
        name: 'ravehub-whatsapp-bot',
        script: './index.js',
        
        // ===== EXECUTION MODE =====
        instances: 1,                           // SINGLE instance only
        exec_mode: 'fork',                      // NOT cluster - auth corruption risk
        
        // ===== RESTART BEHAVIOR =====
        autorestart: true,
        exp_backoff_restart_delay: 1000,        // Start at 1s, exponentially increase
        max_restarts: 15,                       // Max restarts in min_uptime window
        min_uptime: '60s',                      // Consider stable after 60s
        restart_delay: 5000,                    // Fallback: 5s between restarts
        
        // ===== MEMORY MANAGEMENT =====
        max_memory_restart: '512M',             // Restart if exceeds 512MB
        node_args: [
            '--max-old-space-size=512',         // Limit V8 heap
            '--gc-interval=100'                 // More frequent garbage collection
        ],
        
        // ===== FILE WATCHING =====
        watch: false,                           // CRITICAL: Don't watch files
        ignore_watch: [                         // Extra safety
            'auth_info',
            'node_modules',
            'logs',
            '.git',
            '*.log'
        ],
        
        // ===== LOGGING =====
        error_file: './logs/pm2-error.log',
        out_file: './logs/pm2-output.log',
        log_file: './logs/pm2-combined.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,                       // Combine logs for easier auditing
        
        // ===== ENVIRONMENT =====
        env: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        env_development: {
            NODE_ENV: 'development',
            PORT: 3000
        },
        
        // ===== CRASH HANDLING =====
        kill_timeout: 10000,                    // 10s graceful shutdown timeout
        wait_ready: true,                       // Wait for 'ready' signal
        listen_timeout: 30000,                  // 30s to send ready signal
        
        // ===== CRON RESTART (Optional: nightly restart for stability) =====
        // Uncomment if you want automatic daily restarts at 4 AM
        // cron_restart: '0 4 * * *',
        
        // ===== SOURCE MAPS =====
        source_map_support: true,
        
        // ===== SHUTDOWN SIGNALS =====
        shutdown_with_message: true,
        treekill: false                         // Don't kill child processes aggressively
    }],
    
    // ===== DEPLOYMENT CONFIGURATION =====
    deploy: {
        production: {
            user: 'ubuntu',
            host: ['your-server-ip'],
            ref: 'origin/main',
            repo: 'git@github.com:your-repo/ravehub-bot.git',
            path: '/home/ubuntu/ravehub-bot',
            'pre-deploy-local': '',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
            'pre-setup': ''
        }
    }
};
