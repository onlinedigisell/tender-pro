# Tender Pro MahaTender Sync Chrome Extension

This extension syncs the visible MahaTender page into Tender Pro after the user manually logs in and completes CAPTCHA/OTP.

## Install in Chrome

1. Open Chrome.
2. Go to `chrome://extensions`.
3. Turn on `Developer mode`.
4. Click `Load unpacked`.
5. Select this folder:
   `chrome-extension/tender-pro-sync`
6. Pin **Tender Pro Sync** to the toolbar.

## Use

1. Open MahaTender.
2. Login manually.
3. Fill CAPTCHA/OTP manually.
4. Open current/recent tender list or tender detail page.
5. Click the **Tender Pro Sync** extension icon.
6. Click **Sync visible page**.
7. Open Tender Pro → Submission Tracker to see created/updated records.

Use **Deep scan visible tender links** when the list page has links to separate tender detail pages.
The extension will open those links one by one in background tabs and sync each visible detail page.

The extension does not store MahaTender username, password, CAPTCHA, or OTP.
