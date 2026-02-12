module.exports = {
  apps: [
    {
      name: "luxera-api",
      script: "./dist/app.js", // adjust if your entry is different
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      instances: 1,
      exec_mode: "cluster",
      max_memory_restart: "500M",
    },
  ],
};
