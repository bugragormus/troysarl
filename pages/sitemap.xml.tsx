import { GetServerSideProps } from "next";
import { supabase } from "../lib/supabaseClient";

const BASE_URL = "https://troysarl.com";

function generateSiteMap(cars: { id: string; updated_at: string }[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!-- Static Pages -->
     <url>
       <loc>${BASE_URL}</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>${BASE_URL}/about</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <priority>0.7</priority>
     </url>
     <url>
       <loc>${BASE_URL}/cars</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <changefreq>daily</changefreq>
       <priority>0.9</priority>
     </url>
     <url>
       <loc>${BASE_URL}/contact</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <priority>0.8</priority>
     </url>
     <url>
       <loc>${BASE_URL}/appointments</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <priority>0.6</priority>
     </url>

     <!-- Dynamic Car Pages -->
     ${cars
       .map(({ id, updated_at }) => {
         return `
       <url>
           <loc>${`${BASE_URL}/cars/${id}`}</loc>
           <lastmod>${new Date(updated_at).toISOString()}</lastmod>
           <changefreq>weekly</changefreq>
           <priority>0.8</priority>
       </url>
     `;
       })
       .join("")}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps handles the response
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Fetch data from Supabase
  const { data: cars } = await supabase
    .from("cars")
    .select("id, updated_at")
    .eq("is_hidden", false);

  // We generate the XML sitemap with the cars data
  const sitemap = generateSiteMap(cars || []);

  res.setHeader("Content-Type", "text/xml");
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap;
