/**
 * 🗺️ Sitemap Generator for LMS Platform
 * Generates sitemap.xml in /public directory based on your app routes.
 */

const { SitemapStream, streamToPromise } = require("sitemap");
const { createWriteStream } = require("fs");
const path = require("path");

(async () => {
  const sitemap = new SitemapStream({ hostname: "https://yourdomain.com" }); // 🔁 replace with your real domain later

  const writeStream = createWriteStream(
    path.resolve(__dirname, "../public/sitemap.xml")
  );

  sitemap.pipe(writeStream);

  const routes = [
    { url: "/", changefreq: "monthly", priority: 1.0 },
    { url: "/login", changefreq: "monthly", priority: 0.8 },
    { url: "/register", changefreq: "monthly", priority: 0.8 },
    { url: "/student/dashboard", changefreq: "daily", priority: 0.9 },
    { url: "/student/courses", changefreq: "weekly", priority: 0.8 },
    { url: "/student/leaderboard", changefreq: "weekly", priority: 0.7 },
    { url: "/admin/dashboard", changefreq: "daily", priority: 0.8 },
    { url: "/admin/gamification", changefreq: "weekly", priority: 0.6 },
    { url: "/teacher/dashboard", changefreq: "weekly", priority: 0.7 },
  ];

  routes.forEach((r) => sitemap.write(r));

  sitemap.end();

  await streamToPromise(sitemap);

  console.log("✅ Sitemap generated successfully at /public/sitemap.xml");
})();
