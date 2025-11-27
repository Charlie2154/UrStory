/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = config.externals || [];

    // Prevent Firebase Auth from being parsed server-side
    config.externals.push({
      "firebase/auth": "commonjs firebase/auth",
      "@firebase/auth": "commonjs @firebase/auth"
    });

    return config;
  },
};

module.exports = nextConfig;
