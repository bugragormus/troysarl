module.exports = {
  siteUrl: "https://troysarl.com",
  generateRobotsTxt: true,
  exclude: [
    "/super-secret-dashboard-98765",
    "/super-secret-dashboard-98765/*",
    "/404",
  ],
  // İsteğe bağlı: Tarama dışı bırakılacak sayfalar
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "Googlebot", disallow: "/super-secret-dashboard-98765" },
    ],
  },
};
