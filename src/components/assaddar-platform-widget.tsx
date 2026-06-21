import Script from "next/script";

const WIDGET_URL = "https://assaddar-widget-production.up.railway.app/widget.js";
const API_URL = "https://assaddar-api-production.up.railway.app";
const ASSISTANT_ID = "asst_5965790b88cc480b836f5eca";

export function AssaddarPlatformWidget() {
  return (
    <Script
      id="assaddar-platform-widget"
      src={WIDGET_URL}
      strategy="afterInteractive"
      data-assistant-id={ASSISTANT_ID}
      data-api-url={API_URL}
    />
  );
}
