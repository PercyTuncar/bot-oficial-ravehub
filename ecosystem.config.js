module.exports = {
  apps: [{
    name: 'whatsapp-bot',
    script: './index.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false, // Don't watch in production to avoid restart loops on log changes
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    min_uptime: '30s',
    max_restarts: 5,
    restart_delay: 10000
  }]
};
