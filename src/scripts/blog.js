const tocRoot = document.querySelector("[data-blog-toc]");
const articleRoot = document.querySelector(".blog-article");
const progressBar = document.querySelector("[data-reading-progress]");

if (tocRoot && articleRoot) {
  const slugify = (value) =>
    (value ?? "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  const headings = Array.from(articleRoot.querySelectorAll("h2, h3")).filter((heading) => {
    if (!heading.id) {
      heading.id = slugify(heading.textContent);
    }

    return Boolean(heading.id);
  });

  headings.forEach((heading) => {
    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent ?? "";
    link.classList.toggle("is-child", heading.tagName === "H3");
    tocRoot.appendChild(link);
  });

  const tocLinks = Array.from(tocRoot.querySelectorAll("a"));

  if (headings.length && tocLinks.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          tocLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      {
        rootMargin: "-20% 0px -65%",
      },
    );

    headings.forEach((heading) => observer.observe(heading));
  }
}

if (progressBar) {
  let rafId = 0;

  const updateProgress = () => {
    rafId = 0;

    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop || 0;
    const viewportHeight = window.innerHeight || doc.clientHeight || 0;
    const maxScroll = Math.max(1, doc.scrollHeight - viewportHeight);
    const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));

    progressBar.style.transform = `scaleX(${progress})`;
  };

  const scheduleUpdate = () => {
    if (rafId) {
      return;
    }

    rafId = window.requestAnimationFrame(updateProgress);
  };

  updateProgress();
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("load", scheduleUpdate);
}
