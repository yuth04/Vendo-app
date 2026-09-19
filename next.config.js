/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'ik.imagekit.io',
            },
            {
                protocol: 'https',
                hostname: 'applicable-bert-yuthdev-d543ccf2.koyeb.app',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'https://applicable-bert-yuthdev-d543ccf2.koyeb.app/api/:path*',
            },
        ];
    },
};

export default nextConfig;