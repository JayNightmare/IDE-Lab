module.exports = {
    apps: [
        {
            name: "IDE Lab",
            script: "src/index.ts",
            interpreter: "./node_modules/.bin/ts-node",
            watch: false,
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
