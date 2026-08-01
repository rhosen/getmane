const site = require("./src/_data/site.json");

function toAbsoluteUrl(path = "") {
  const base = site.siteOrigin.endsWith("/") ? site.siteOrigin : `${site.siteOrigin}/`;
  const normalized = String(path).replace(/^\//, "");
  return new URL(normalized, base).toString();
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "styles.css": "styles.css" });
  eleventyConfig.addPassthroughCopy({ "social-preview.svg": "social-preview.svg" });
  eleventyConfig.addPassthroughCopy({ "app-ads.txt": "app-ads.txt" });
  eleventyConfig.addPassthroughCopy({ "src/scripts": "scripts" });
  eleventyConfig.addPassthroughCopy({ "src/styles": "styles" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  eleventyConfig.addFilter("absoluteUrl", toAbsoluteUrl);
  eleventyConfig.addFilter("playUrl", (utmContent = "website") => {
    const url = new URL(site.playStoreUrl);
    url.searchParams.set("utm_source", site.utm.source);
    url.searchParams.set("utm_medium", site.utm.medium);
    url.searchParams.set("utm_campaign", site.utm.campaign);
    url.searchParams.set("utm_content", utmContent);
    return url.toString();
  });

  eleventyConfig.addCollection("sitemapPages", (collectionApi) =>
    collectionApi.getAll().filter((item) => item.url && !item.data.excludeFromSitemap)
  );

  return {
    pathPrefix: site.pathPrefix,
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};
