const withTM = require("next-transpile-modules")(["react-responsive-carousel"]);

module.exports = withTM({
  images: {
    domains: ["qxrbqckbuviqgekopmiu.supabase.co"],
  },
  async redirects() {
    return [
      {
        source: "/",
        minimumCacheTTL: 864000, // 10 gün
        destination: "/cars",
        permanent: true, // SEO açısından kalıcı yönlendirme (301)
      },
    ];
  },
});
