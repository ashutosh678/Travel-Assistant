module.exports = {
	apps: [
		{
			name: "travel-assistant",
			script: "./dist/server.js",
			instances: 1,
			exec_mode: "fork",
			watch: false,
			max_memory_restart: "1G",
			error_file: "./logs/error.log",
			out_file: "./logs/access.log",
			time: true,
			env: {
				NODE_ENV: "development",
				PORT: 8000,
				HOST: "0.0.0.0",
			},
			env_production: {
				NODE_ENV: "production",
				PORT: 8000,
				HOST: "0.0.0.0",
			},
			exp_backoff_restart_delay: 100,
			max_restarts: 10,
			restart_delay: 4000,
			autorestart: true,
		},
	],
};
