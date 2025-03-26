const withTM = require("next-transpile-modules")(["react-responsive-carousel"]);

module.exports = withTM({
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qxrbqckbuviqgekopmiu.supabase.co",
      },
    ],
    minimumCacheTTL: 864000, // 10 gün
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/cars",
        permanent: true, // SEO açısından kalıcı yönlendirme (301)
      },
    ];
  },
});
