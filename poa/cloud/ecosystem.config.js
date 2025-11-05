// PM2 Ecosystem Configuration for Proof-of-Art Network

module.exports = {
  apps: [
    {
      name: "poa-network",
      script: "npx",
      args: "hardhat node --hostname 0.0.0.0",
      cwd: "/app",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      env: {
        NODE_ENV: "production",
        CHAIN_ID: process.env.CHAIN_ID || "31337"
      },
      error_file: "./logs/poa-network-error.log",
      out_file: "./logs/poa-network-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 4000
    }
  ]
};

