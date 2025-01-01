import type { NextConfig } from "next";
const withMDX = require('@next/mdx')();

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  images: {
    domains: [
      'images.unsplash.com', 
      'cdn-images-1.medium.com', 
      'morph.ghost.io', 
      'lh7-rt.googleusercontent.com', 
      'miro.medium.com',
      'media2.dev.to',
      'dev-to-uploads.s3.amazonaws.com',
      'assets.dev.to',
      "lh7-us.googleusercontent.com"
    ],
    
  },
};

export default withMDX(nextConfig);
