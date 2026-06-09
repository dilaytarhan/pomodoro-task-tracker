
# Focus Flow — Pomodoro Task Tracker 🍅

A modern, feature-rich Pomodoro timer web app with integrated task management and productivity statistics.

![Focus Flow](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

## ✨ Features

- **🎯 Pomodoro Timer** - Customizable focus, short break, and long break intervals
- **📝 Task Management** - Create, prioritize, and track tasks with localStorage persistence
- **📊 Statistics Dashboard** - Track focus time, sessions completed, daily streak, and tasks done
- **🌙 Dark/Light Theme** - Toggle between themes for comfortable viewing
- **🔊 Sound Effects** - Audio notifications for timer completion and button interactions
- **⌨️ Keyboard Shortcuts** - Quick controls (Space to start/pause, R to reset)
- **💾 Persistent Storage** - All data saved locally in your browser
- **📱 Responsive Design** - Works on desktop and mobile devices

## 🚀 Quick Start

1. **Clone the repository**
```bash
   git clone https://github.com/dilaytarhan/pomodoro-task-tracker.git
   cd pomodoro-task-tracker
```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - No build tools or dependencies required!

3. **Start focusing**
   - Click the play button or press Space to begin
   - Add tasks using the input field
   - Customize timer durations in Settings ⚙️

## 📖 How to Use

### Timer Modes
- **Focus** - Default 25 minutes of focused work
- **Short Break** - 5 minute break after focus
- **Long Break** - 15 minute break after 4 sessions

### Task Management
- Add tasks with priority levels (Low, Medium, High)
- Click task text to set it as your current focus
- Check off completed tasks
- Filter by All, Active, or Done

### Settings
- Customize timer durations
- Enable/disable sound alerts
- Toggle browser notifications
- Auto-start breaks or focus sessions
- Reset daily statistics

## 🎨 Customization

Edit timer values in **Settings ⚙️**:
- Focus duration (default: 25 min)
- Short break duration (default: 5 min)
- Long break duration (default: 15 min)
- Sessions before long break (default: 4)

## 🔧 Project Structure
pomodoro-task-tracker/
├── index.html          # Main HTML structure
├── script.js           # All app logic and interactivity
├── style.css           # Styling and responsive design
├── assets/
│   └── sounds/         # Audio files for notifications
│       ├── timer-finish.wav
│       └── button-click.wav
├── LICENSE             # MIT License
└── README.md           # This file

## 💾 Local Storage

The app uses browser localStorage to save:
- **Settings** - Timer durations, preferences
- **Tasks** - All your tasks and their status
- **Statistics** - Focus minutes, sessions, streak
- **Theme** - Your dark/light mode preference

Clear browser data to reset everything.

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Space** | Start / Pause timer |
| **R** | Reset timer |
| **Enter** | Add new task |

## 🎵 Sound Features

- **Timer Finish** - Notification sound when focus/break ends
- **Button Clicks** - Subtle feedback for interactions
- Toggle sound alerts in Settings

All sounds can be disabled in the **Sound alerts** toggle.

## 🌐 Browser Support

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## 📊 Tech Stack

- **HTML5** - Semantic structure
- **CSS3** - Modern styling with CSS variables
- **Vanilla JavaScript** - No frameworks or dependencies
- **Web Audio API** - Sound synthesis and playback
- **localStorage API** - Persistent data storage

## 🤝 Contributing

Found a bug? Have a feature idea? Feel free to:
1. Open an issue
2. Fork the repository
3. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Dilay Tarhan** - [GitHub](https://github.com/dilaytarhan)

## 🙏 Acknowledgments

- Pomodoro Technique by Francesco Cirillo
- Sound effects from Mixkit
- Fonts from Google Fonts (Inter, JetBrains Mono)

---

**Made with ❤️ for productivity lovers**

*Last updated: June 2026*
