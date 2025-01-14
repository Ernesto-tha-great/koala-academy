import type { NextConfig } from "next";
const withMDX = require('@next/mdx')();

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn-images-1.medium.com',
      },
      {
        protocol: 'https',
        hostname: 'morph.ghost.io',
      },
      {
        protocol: 'https',
        hostname: 'lh7-rt.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'miro.medium.com',
      },
      {
        protocol: 'https',
        hostname: 'media2.dev.to',
      },
      {
        protocol: 'https',
        hostname: 'dev-to-uploads.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.dev.to',
      },
      {
        protocol: 'https',
        hostname: 'lh7-us.googleusercontent.com',
      },
        {
        protocol: 'https',
        hostname: 'docs.morphl2.io',
      },
    ],
  },
};

export default withMDX(nextConfig);
