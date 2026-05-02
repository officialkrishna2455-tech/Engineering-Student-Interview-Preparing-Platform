/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // Disable static page generation for all pages at build time.
  // This prevents "TypeError: Invalid URL" errors during Vercel builds
  // when runtime environment variables (NEXTAUTH_URL, etc.) are not
  // available at build time in the expected format.
  output: "standalone",
};

module.exports = nextConfig;
