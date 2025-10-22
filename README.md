# 🧠 Task Tracker — Chrome Extension

**Task Tracker** is a simple and elegant Chrome extension that helps you stay productive by tracking your daily tasks every time you open a new tab.  
It automatically opens a lightweight task checklist UI, allowing you to add, edit, and manage tasks for the last 7 days — directly inside your browser.

---

## 🌟 Features

- ✅ Add and manage your daily tasks effortlessly  
- 🗓️ Automatically tracks the last  days of tasks  
- ✏️ Edit and lock your task list to prevent accidental changes  
- 📊 Built-in local analytics for task activity tracking  
- 🧩 Opens on every new tab for quick access  
- ⚡ Fast, minimal, and distraction-free interface  

---

## 🧩 Project Structure

```
Task Tracker Extension/
│
├── manifest.json           # Chrome extension configuration
├── popup.html              # Main UI displayed on new tab
├── popup.js                # Core logic for task handling
├── styles.css              # Light gradient UI styling
├── background.js           # Background service worker (MV3)
├── analytics.js            # Local analytics tracking (optional)
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md               # Documentation
```

---

## ⚙️ Installation (Developer Mode)

1. **Clone or Download** this repository.  
2. Open **Google Chrome** and go to `chrome://extensions/`.  
3. Turn on **Developer mode** (top-right corner).  
4. Click **“Load unpacked”** and select the extension folder.  
5. Open a new tab — your **Task Tracker** will appear automatically!

---

## 📊 Local Analytics (Optional Feature)

The extension includes a simple analytics feature that tracks:
- How many tasks are added, completed, or deleted  
- How many times the extension (new tab) was opened  

You can find or display this data from `chrome.storage.local`.

To enable analytics, ensure your `analytics.js` is linked in `popup.html` or imported in `popup.js`.

---

## 🧠 How It Works

- Every time you open a new tab, `popup.html` is shown.  
- You can add or edit tasks using the buttons at the bottom.  
- The data persists in `chrome.storage.local`.  
- A simple analytics module records actions (e.g., task added, opened app).  

---

## 🪄 Tech Stack

- HTML5  
- CSS3  
- JavaScript (ES6)  
- Chrome Extension API (Manifest V3)  

---

## 🧑‍💻 Author

**Ajay Malwal**  
📍 India  
🌐 Web Developer & Cyber Security Enthusiast  
🔗 [GitHub](https://github.com/Ajaymalwal) • [Portfolio](#)  

---

## 📜 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute.

---

## 💡 Future Enhancements

- Google account sync for cross-device task storage  
- Detailed analytics dashboard  
- Daily productivity reminders  
- Dark mode toggle  
