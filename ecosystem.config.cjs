module.exports = {
  apps: [
    {
      name: 'la-tierrita',
      script: 'node_modules/.bin/tsx',
      args: 'server.ts',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
