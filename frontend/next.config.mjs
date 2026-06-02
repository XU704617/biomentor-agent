const backendBaseUrl =
  process.env.FASTAPI_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  async rewrites() {
    return [
      { source: "/api/health", destination: `${backendBaseUrl}/api/health` },
      { source: "/api/agent/:path*", destination: `${backendBaseUrl}/api/agent/:path*` },
      { source: "/api/attempts/:path*", destination: `${backendBaseUrl}/api/attempts/:path*` },
      { source: "/api/bio-tools/:path*", destination: `${backendBaseUrl}/api/bio-tools/:path*` },
      { source: "/api/courses/:path*", destination: `${backendBaseUrl}/api/courses/:path*` },
      { source: "/api/diagnosis/:path*", destination: `${backendBaseUrl}/api/diagnosis/:path*` },
      { source: "/api/knowledge-graph/:path*", destination: `${backendBaseUrl}/api/knowledge-graph/:path*` },
      { source: "/api/materials/:path*", destination: `${backendBaseUrl}/api/materials/:path*` },
      { source: "/api/photo-learning/:path*", destination: `${backendBaseUrl}/api/photo-learning/:path*` },
      { source: "/api/questions/:path*", destination: `${backendBaseUrl}/api/questions/:path*` },
      { source: "/api/quiz/:path*", destination: `${backendBaseUrl}/api/quiz/:path*` },
      { source: "/api/rag/:path*", destination: `${backendBaseUrl}/api/rag/:path*` },
      { source: "/api/reports/:path*", destination: `${backendBaseUrl}/api/reports/:path*` },
      { source: "/api/research/papers/:path*", destination: `${backendBaseUrl}/api/research/papers/:path*` },
      { source: "/api/research/tasks/:path*", destination: `${backendBaseUrl}/api/research/tasks/:path*` },
      { source: "/api/system/:path*", destination: `${backendBaseUrl}/api/system/:path*` },
      { source: "/api/tutor/:path*", destination: `${backendBaseUrl}/api/tutor/:path*` },
    ];
  },
};

export default nextConfig;
