// next.config.js
module.exports = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Ignore source map warnings for swagger-ui.js.map
            config.ignoreWarnings = [
                {
                    message: /Failed to parse source map/,
                },
            ];
        }
        return config;
    },
};
