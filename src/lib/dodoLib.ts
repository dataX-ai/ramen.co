import DodoPayments from "dodopayments";
export const dodopayments = new DodoPayments({
  bearerToken:
    process.env.ENV === "development"
      ? process.env.DODO_API_KEY_TEST
      : process.env.DODO_API_KEY_LIVE, // This is the default and can be omitted if env is named as DODO_PAYMENTS_API_KEY
  environment:
    process.env.ENV === "development" ? "test_mode" : "live_mode", // defaults to 'live_mode'
});

export const dodoWebhookKey = process.env.ENV === "development" ? process.env.DODO_TEST_PAYMENTS_WEBHOOK_KEY : process.env.DODO_LIVE_PAYMENTS_WEBHOOK_KEY;

export const dodoNonVegProductId = process.env.ENV === "development" ? process.env.DODO_TEST_NON_VEG_PRODUCT_ID : process.env.DODO_LIVE_NON_VEG_PRODUCT_ID;

export const dodoVegProductId = process.env.ENV === "development" ? process.env.DODO_TEST_VEG_PRODUCT_ID : process.env.DODO_LIVE_VEG_PRODUCT_ID;