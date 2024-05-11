/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_MERCHANT_ID: process.env.NEXT_PUBLIC_MERCHANT_ID,
    NEXT_PUBLIC_SALT_KEY: process.env.NEXT_PUBLIC_SALT_KEY,
    NEXT_PUBLIC_SALT_INDEX: process.env.NEXT_PUBLIC_SALT_INDEX,
  },
};

export default nextConfig;
