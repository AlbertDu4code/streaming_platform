import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@influxdata/influxdb-client"],
  images: {
    domains: ["localhost"],
  },
};

export default nextConfig;
