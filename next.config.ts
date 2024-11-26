import type { NextConfig } from "next";
const withMDX = require('@next/mdx')();

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  images: {
    domains: ['images.unsplash.com'],
  },
};

export default withMDX(nextConfig);
