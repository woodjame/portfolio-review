/* BIOBUZZ Portfolio Review settings.
   With apiUrl empty (""), each team pastes its own Claude API key on the page and the review
   goes straight from their browser to Claude. No server is needed.
   Only fill in apiUrl later if you set up your own review server. */
window.PORTFOLIO_REVIEW_CONFIG = {
  apiUrl: "",
  modelDefault: "claude-haiku-5-5",
  modelComplex: "claude-sonnet-5-5",
  maxImagesPerCall: 3
};
