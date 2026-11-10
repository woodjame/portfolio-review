/* BIOBUZZ Portfolio Review settings.
   apiUrl: the address of your review server (the Cloudflare Worker), with no slash at the end.
           Leave it empty ("") inside claude.ai; there the page uses Claude directly. */
window.PORTFOLIO_REVIEW_CONFIG = {
apiUrl: "https://YOUR-WORKER-NAME.YOUR-ACCOUNT.workers.dev",
  requireAccessCode: true,
  maxImagesPerCall: 3
};

