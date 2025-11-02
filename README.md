# XPathy Chrome Extension - User Manual

## Overview

The **XPathy Chrome Extension** allows you to convert **XPathy (Java)** snippets into **XPath expressions** directly inside your browser — and instantly **highlight the matching elements** on the page. It connects to a lightweight **local server** (powered by [xpathy-server](https://github.com/Volta-Jebaprashanth/xpathy-server)) that handles the snippet-to-XPath conversion.

This tool is designed for automation testers and developers using the **XPathy Java library**, providing an interactive way to verify locators visually in real time.

---

## 🧩 Features

* Convert **XPathy Java expressions** to **XPath** instantly.
* Highlight all matching elements on the current web page.
* Navigate through matches using **Previous / Next** controls.
* Works in both **Chrome Toolbar** and **DevTools panel**.
* Local server integration — your code never leaves your machine.
* Simple, responsive UI with dark theme for comfortable debugging.


---

# 🚀 Setup Instructions

## Step 1: Start the Local Server

1. Download the `xpathy-server.jar` file from the GitHub releases page. [Download xpathy-server 3.0.0.jar](https://github.com/Volta-Jebaprashanth/xpathy-server/raw/main/releases/xpathy-server%203.0.0/xpathy-server%203.0.0.jar)

2. Double-click the `.jar` file to launch the UI server. (Requires Java installed on your machine.)
3. Once started, the server runs locally (by default at `http://localhost:5056`).



No terminal or command line needed — it starts the launcher directly.



| Step 1                                            | Step 2                                                                                     |
|---------------------------------------------------| ------------------------------------------------------------------------------------------ |
| ![Step 1](https://github.com/Volta-Jebaprashanth/xpathy-server/raw/main/screenshots/1.png) | ![Step 2](https://github.com/Volta-Jebaprashanth/xpathy-server/raw/main/screenshots/2.png) |



---

## Step 2: Load the Chrome Extension

1. Download the latest source code **ZIP** of the extension of this current repository:

    * 📦 [Direct ZIP Download](https://github.com/Volta-Jebaprashanth/xpathy-chrome-extension/archive/refs/heads/main.zip)
2. Extract the ZIP **xpathy-chrome-extension-main.zip** on your computer.
3. Open **Chrome** and navigate to `chrome://extensions/`.
4. Enable **Developer mode** (toggle in the top-right corner).
![Extension Popup](https://raw.githubusercontent.com/Volta-Jebaprashanth/xpathy-chrome-extension/refs/heads/main/screenshots/1.png)

5. Click **Load unpacked** and select your **XPathy Extension folder**.

| After adding XPathy                                                                                                                 | Pin it                                                                                                                              |
|-------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| ![Extension Popup](https://raw.githubusercontent.com/Volta-Jebaprashanth/xpathy-chrome-extension/refs/heads/main/screenshots/2.png) | ![Extension Popup](https://raw.githubusercontent.com/Volta-Jebaprashanth/xpathy-chrome-extension/refs/heads/main/screenshots/3.png) |


6. The extension icon (blue “X”) will appear in your Chrome toolbar.



![Extension Popup](https://raw.githubusercontent.com/Volta-Jebaprashanth/xpathy-chrome-extension/refs/heads/main/screenshots/4.png)


---



## ⚙️ Usage



### 1. Enter an XPathy Snippet

Type or paste your **XPathy (Java)** code snippet into the editor. Click the **▶ (Run)** button. 

![Extension Popup](https://raw.githubusercontent.com/Volta-Jebaprashanth/xpathy-chrome-extension/refs/heads/main/screenshots/5.png)
---


* The extension sends the snippet to your **local server**.
* The converted XPath appears below your snippet.
* All matching elements on the web page are highlighted with a red overlay.
* Use **Next / Previous** buttons to navigate through matches.


---

### 2. Handling Connection Errors

If the server isn’t running, or **running on different port**, or you are running the server on another machine connected via local network, you’ll automatically see the settings options:

![Extension Popup](https://raw.githubusercontent.com/Volta-Jebaprashanth/xpathy-chrome-extension/refs/heads/main/screenshots/6.png)


You can update the **API Endpoint** manually in the settings: Click **Save** and retry.


---

### 3. Handling Syntex Errors - in Real Time

If your snippet has syntax errors, the extension displays in **real time** with the **Run** button color. if its green, the snippet is valid; if red, there are errors.

![Extension Popup](https://raw.githubusercontent.com/Volta-Jebaprashanth/xpathy-chrome-extension/refs/heads/main/screenshots/7.png)
![Extension Popup](https://raw.githubusercontent.com/Volta-Jebaprashanth/xpathy-chrome-extension/refs/heads/main/screenshots/8.png)



---

###  4. DevTools Mode

You can also use XPathy directly inside Chrome DevTools:

1. Open **DevTools (F12)**.
2. Go to the **XPathy** tab.
3. Enter your snippet and run it — the page elements will be highlighted instantly.

![Extension Popup](https://raw.githubusercontent.com/Volta-Jebaprashanth/xpathy-chrome-extension/refs/heads/main/screenshots/9.png)


---

## 🧰 Tech Stack

* **Frontend:** HTML, CSS, JavaScript 
* **Backend:** Java (xpathy-server)
* **Browser:** Chrome Extension Manifest V3

---

## 💬 Troubleshooting

| Issue                   | Possible Cause                   | Solution                                             |
| ----------------------- | -------------------------------- | ---------------------------------------------------- |
| `Failed to fetch`       | Server not running or wrong port | Ensure the JAR is running on `http://localhost:5056` |
| No elements highlighted | XPath didn’t match any element   | Validate your snippet or check DOM structure         |

---

### Made with ❤️ by  **Volta Jebaprashanth**
📧 [voltajeba@gmail.com](mailto:voltajeba@gmail.com)
🔗 [LinkedIn](https://www.linkedin.com/in/voltajeba)

---

Happy Testing with XPathy! 🚀