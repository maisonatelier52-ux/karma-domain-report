/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow article preview images from any host (we use plain <img> tags, no next/image).
  poweredByHeader: false,
};

export default nextConfig;
