/* BIOBUZZ Portfolio Review settings.
   apiUrl: the address of your review server (the Cloudflare Worker), with no slash at the end.
           Leave it empty ("") inside claude.ai; there the page uses Claude directly. */
window.PORTFOLIO_REVIEW_CONFIG = {
  apiUrl: "",
  requireAccessCode: true,
  maxImagesPerCall: 3
};
"https://portfolio-review.yourname.workers.dev"
