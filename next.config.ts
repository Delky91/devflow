import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   /* config options here */
   serverExternalPackages: ["pino", "pino-prettier"],
   images: {
      remotePatterns: [
         {
            protocol: "https",
            hostname: "static.vecteezy.com",
            port: "",
         },
      ],
   },
};

export default nextConfig;
