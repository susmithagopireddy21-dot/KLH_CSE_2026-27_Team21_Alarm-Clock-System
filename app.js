// ============================================================
// CHRONOOS WEBSITE - MAIN JAVASCRIPT
// ============================================================

// ------------------------------------------------------------
// LIVE CLOCK
// ------------------------------------------------------------

function updateClock() {
    const now = new Date();

    const dateElement = document.getElementById("current-date");
    const timeElement = document.getElementById("current-time");

    if (!dateElement || !timeElement) {
        return;
    }

    const dateOptions = {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    };

    const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    };

    dateElement.textContent = now.toLocaleDateString(
        "en-IN",
        dateOptions
    );

    timeElement.textContent = now.toLocaleTimeString(
        "en-IN",
        timeOptions
    );
}

// Update immediately
updateClock();

// Update every second
setInterval(updateClock, 1000);

// ============================================================
// ALARM MANAGEMENT
// ============================================================

let alarms = JSON.parse(localStorage.getItem("chronoosAlarms")) || [];

function saveAlarms() {
    localStorage.setItem("chronoosAlarms", JSON.stringify(alarms));
}

function createAlarmModal() {
    if (document.getElementById("alarmModal")) {
        return;
    }

    const modal = document.createElement("div");

    modal.id = "alarmModal";

    modal.innerHTML = `
        <div class="alarm-modal-overlay">
            <div class="alarm-modal">

                <div class="alarm-modal-header">
                    <div>
                        <p class="card-label">NEW ALARM</p>
                        <h2>Schedule an Alarm</h2>
                    </div>

                    <button class="alarm-close" id="closeAlarmModal">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <label>
                    Alarm Time
                    <input type="time" id="alarmTimeInput">
                </label>

                <label>
                    Alarm Label
                    <input
                        type="text"
                        id="alarmLabelInput"
                        placeholder="Example: Morning Study"
                    >
                </label>

                <div class="alarm-modal-actions">
                    <button class="secondary-button" id="cancelAlarm">
                        Cancel
                    </button>

                    <button class="primary-button" id="saveAlarm">
                        <i class="fa-solid fa-bell"></i>
                        Save Alarm
                    </button>
                </div>

            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document
        .getElementById("closeAlarmModal")
        .addEventListener("click", closeAlarmModal);

    document
        .getElementById("cancelAlarm")
        .addEventListener("click", closeAlarmModal);

    document
        .getElementById("saveAlarm")
        .addEventListener("click", addNewAlarm);
}

function refreshAlarmPage() {
    renderAlarmPage();
}

function openAlarmModal() {
    createAlarmModal();

    document.getElementById("alarmModal").style.display = "flex";

    document.getElementById("alarmTimeInput").focus();
}

function closeAlarmModal() {
    const modal = document.getElementById("alarmModal");

    if (modal) {
        modal.style.display = "none";
    }
}

function addNewAlarm() {
    const timeInput = document.getElementById("alarmTimeInput");
    const labelInput = document.getElementById("alarmLabelInput");

    const time = timeInput.value;
    const label = labelInput.value.trim();

    if (!time) {
        alert("Please select an alarm time.");
        return;
    }

    const alarm = {
        id: Date.now(),
        time: time,
        label: label || "Untitled Alarm",
        active: true
    };

    alarms.push(alarm);

    saveAlarms();

    updateAlarmCount();
    updateNextAlarm();

    closeAlarmModal();

    alert("Alarm added successfully!");
}

function updateAlarmCount() {
    const activeAlarms = alarms.filter(
        alarm => alarm.active
    ).length;

    const alarmCards = document.querySelectorAll(
        ".stat-card"
    );

    alarmCards.forEach(card => {
        const label = card.querySelector(".stat-info span");

        if (
            label &&
            label.textContent.trim() === "Active Alarms"
        ) {
            const value = card.querySelector(
                ".stat-info strong"
            );

            if (value) {
                value.textContent =
                    String(activeAlarms).padStart(2, "0");
            }
        }
    });
}

function updateNextAlarm() {
    const activeAlarms = alarms
        .filter(alarm => alarm.active)
        .sort((a, b) => a.time.localeCompare(b.time));

    if (activeAlarms.length === 0) {
        return;
    }

    const nextAlarm = activeAlarms[0];

    const nextAlarmCard =
        document.querySelector(".next-alarm");

    if (!nextAlarmCard) {
        return;
    }

    const title =
        nextAlarmCard.querySelector(".card-header h2");

    const time =
        nextAlarmCard.querySelector(".alarm-time");

    if (title) {
        title.textContent = nextAlarm.label;
    }

    if (time) {
        const [hours, minutes] =
            nextAlarm.time.split(":");

        let hour = parseInt(hours, 10);

        const period = hour >= 12 ? "PM" : "AM";

        hour = hour % 12 || 12;

        time.innerHTML =
            `${String(hour).padStart(2, "0")}:${minutes}
             <span>${period}</span>`;
    }
}


function renderAlarmPage() {
    const alarmList = document.getElementById("alarm-list");

    if (!alarmList) {
        return;
    }

    if (alarms.length === 0) {
        alarmList.innerHTML = "<p>No alarms saved yet. Click Add Alarm to create one.</p>";
        return;
    }

    alarmList.innerHTML = "";

    alarms.forEach(alarm => {
        const card = document.createElement("div");
        card.className = "alarm-page-item";

        const timeParts = alarm.time.split(":");
        let hour = parseInt(timeParts[0], 10);
        const minutes = timeParts[1];
        const period = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;

        const details = document.createElement("div");
        details.innerHTML = `
            <h3>${String(hour).padStart(2, "0")}:${minutes} ${period}</h3>
            <p></p>
        `;
        details.querySelector("p").textContent = alarm.label;

        const status = document.createElement("span");
        status.textContent = alarm.active ? "Active" : "Inactive";
        status.className = alarm.active ? "alarm-status active" : "alarm-status";

        card.appendChild(details);
        card.appendChild(status);
        alarmList.appendChild(card);
    });
}

// Connect all Add Alarm buttons
document.addEventListener("DOMContentLoaded", () => {

    const alarmButtons =
        document.querySelectorAll(".primary-button");

    alarmButtons.forEach(button => {

        if (
            button.textContent
                .toLowerCase()
                .includes("add alarm")
        ) {
            button.addEventListener(
                "click",
                openAlarmModal
            );
        }
    });

    updateAlarmCount();
    updateNextAlarm();
});

// ============================================================
// ALARM TRIGGER
// ============================================================

let triggeredAlarms = new Set();

function checkAlarms() {
    const now = new Date();

    const currentHour = String(
        now.getHours()
    ).padStart(2, "0");

    const currentMinute = String(
        now.getMinutes()
    ).padStart(2, "0");

    const currentTime =
        `${currentHour}:${currentMinute}`;

    alarms.forEach(alarm => {

        if (
            alarm.active &&
            alarm.time === currentTime &&
            !triggeredAlarms.has(alarm.id)
        ) {
            triggeredAlarms.add(alarm.id);

            triggerAlarm(alarm);
        }
    });
}

function triggerAlarm(alarm) {

    // Mark alarm as completed
    alarm.active = false;

    saveAlarms();

    updateAlarmCount();
    updateNextAlarm();

    // Browser notification
// Browser notification
if (
    window.chronoosNotificationsEnabled === true &&
    "Notification" in window &&
    Notification.permission === "granted"
) {
    new Notification("ChronoOS Alarm", {
        body: alarm.label,
        icon: "assets/clock.png"
    });
}

    // Start alarm sound
    playAlarmSound();

    // Start vibration where supported
    if (navigator.vibrate) {
        navigator.vibrate([
            500,
            300,
            500,
            300,
            500
        ]);
    }

    // Visual alarm message
    showAlarmAlert(alarm);
}

function showAlarmAlert(alarm) {

    const alertBox = document.createElement("div");

    alertBox.className = "chronoos-alarm-alert";

    alertBox.innerHTML = `
        <div class="chronoos-alarm-icon">
            <i class="fa-solid fa-bell"></i>
        </div>

        <div class="chronoos-alarm-content">
            <span>ALARM RINGING</span>
            <strong>${alarm.label}</strong>
            <small>Scheduled time reached</small>
        </div>

        <button class="chronoos-alarm-stop">
            <i class="fa-solid fa-stop"></i>
            Stop Alarm
        </button>
    `;

    document.body.appendChild(alertBox);

    const stopButton =
        alertBox.querySelector(
            ".chronoos-alarm-stop"
        );

    stopButton.addEventListener(
        "click",
        () => {

            stopAlarmSound();

            if (navigator.vibrate) {
                navigator.vibrate(0);
            }

            alertBox.remove();
        }
    );
}

// ============================================================
// ALARM SOUND
// ============================================================

let alarmAudio = null;
let alarmSoundLoop = null;

function playAlarmSound() {

    if (window.chronoosSoundEnabled === false) {
        return;
    }

    if (alarmAudio) {
        return;
    }

    alarmAudio = new AudioContext();

    function beep() {

        const oscillator = alarmAudio.createOscillator();
        const gainNode = alarmAudio.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = 880;

        gainNode.gain.setValueAtTime(
            0.3,
            alarmAudio.currentTime
        );

        oscillator.connect(gainNode);
        gainNode.connect(alarmAudio.destination);

        oscillator.start();

        oscillator.stop(
            alarmAudio.currentTime + 0.4
        );
    }

    beep();

    alarmSoundLoop = setInterval(() => {

        if (alarmAudio) {
            beep();
        }

    }, 800);
}

// ============================================================
// STOP ALARM SOUND
// ============================================================

function stopAlarmSound() {

    if (alarmSoundLoop) {
        clearInterval(alarmSoundLoop);
        alarmSoundLoop = null;
    }

    if (alarmAudio) {
        alarmAudio.close();
        alarmAudio = null;
    }

    if (navigator.vibrate) {
        navigator.vibrate(0);
    }
}

// Check alarms every second
setInterval(() => window.checkAlarms(), 1000);

// ============================================================
// CHRONOOS SIDEBAR NAVIGATION
// ============================================================


document.addEventListener("DOMContentLoaded", () => {

    const navItems = document.querySelectorAll(
        ".navigation .nav-item"
    );

    const pageSections = document.querySelectorAll(
        "[data-dashboard-page]"
    );

    navItems.forEach(item => {
        item.addEventListener("click", event => {
            event.preventDefault();

            const selectedPage = item.dataset.page;

if (selectedPage === "alarms") {
    renderAlarmPage();
}

            navItems.forEach(navItem => {
                navItem.classList.remove("active");
            });

            item.classList.add("active");

            pageSections.forEach(section => {
                section.hidden =
                    section.dataset.dashboardPage !== selectedPage;
            });
        });
    });

});


/* ============================================================
   CHRONOOS TASK STOPWATCH AND COUNTDOWN
   ============================================================ */

(() => {
    const taskNameInput = document.getElementById("stopwatchTask");
    const hoursInput = document.getElementById("taskHours");
    const minutesInput = document.getElementById("taskMinutes");
    const secondsInput = document.getElementById("taskSeconds");

    const countdownDisplay = document.getElementById("taskCountdownDisplay");
    const taskNameDisplay = document.getElementById("currentTaskName");
    const taskStatus = document.getElementById("taskTimerStatus");

    const elapsedDisplay = document.getElementById("stopwatchElapsedDisplay");
    const stopwatchStatus = document.getElementById("stopwatchStatus");

    const startTaskButton = document.getElementById("startTaskTimer");
    const pauseTaskButton = document.getElementById("pauseTaskTimer");
    const resetTaskButton = document.getElementById("resetTaskTimer");
    const startStopwatchButton = document.getElementById("startStopwatch");
    const resetStopwatchButton = document.getElementById("resetStopwatch");

    // This script can safely load on pages without the Stopwatch dashboard.
    if (!countdownDisplay || !startTaskButton) return;

    let remainingSeconds = 1500;
    let countdownEndTime = null;
    let countdownRunning = false;
    let countdownInterval = null;
    let elapsedSeconds = 0;
    let elapsedStartTime = null;
    let stopwatchRunning = false;
    let stopwatchInterval = null;
    let alertAudio = null;

    function formatTime(totalSeconds) {
        const safeSeconds = Math.max(0, Math.floor(totalSeconds));
        const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, "0");
        const seconds = String(safeSeconds % 60).padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
    }

    function readTimeLimit() {
        const hours = Number(hoursInput.value);
        const minutes = Number(minutesInput.value);
        const seconds = Number(secondsInput.value);

        if (
            !Number.isInteger(hours) || hours < 0 || hours > 99 ||
            !Number.isInteger(minutes) || minutes < 0 || minutes > 59 ||
            !Number.isInteger(seconds) || seconds < 0 || seconds > 59
        ) {
            taskStatus.textContent = "Enter a valid time limit.";
            return null;
        }

        const total = hours * 3600 + minutes * 60 + seconds;

        if (total <= 0) {
            taskStatus.textContent = "Set a time limit greater than zero.";
            return null;
        }

        return total;
    }

    function stopCompletionSound() {
        if (alertAudio) {
            alertAudio.pause();
            alertAudio.currentTime = 0;
            alertAudio = null;
        }

        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        if (navigator.vibrate) navigator.vibrate(0);

        const alertBox = document.getElementById("taskCompletionAlert");
        if (alertBox) alertBox.remove();
    }

    function showCompletionAlert() {
        countdownRunning = false;
        countdownEndTime = null;
        clearInterval(countdownInterval);
        countdownInterval = null;

        taskStatus.textContent = "Time is up! Task time limit completed.";
        countdownDisplay.textContent = "00:00:00";

        if (navigator.vibrate) {
            navigator.vibrate([500, 250, 500, 250, 800]);
        }

        // Browser audio requires the user to start the timer from the page.
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;

            if (AudioContextClass) {
                const audioContext = new AudioContextClass();
                const oscillator = audioContext.createOscillator();
                const gain = audioContext.createGain();

                oscillator.type = "sine";
                oscillator.frequency.value = 880;
                gain.gain.value = 0.15;

                oscillator.connect(gain);
                gain.connect(audioContext.destination);

                oscillator.start();

                let beeps = 0;
                const beepInterval = setInterval(() => {
                    oscillator.frequency.value = beeps % 2 === 0 ? 660 : 880;
                    beeps++;

                    if (beeps >= 8) {
                        clearInterval(beepInterval);
                        oscillator.stop();
                        audioContext.close();
                    }
                }, 250);
            }
        } catch (error) {
            console.warn("Audio alert could not start:", error);
        }

        const alertBox = document.createElement("div");
        alertBox.id = "taskCompletionAlert";
        alertBox.setAttribute("role", "alert");
        alertBox.style.cssText =
            "position:fixed;inset:0;z-index:9999;background:#101020dd;" +
            "display:flex;align-items:center;justify-content:center;padding:20px;";

        const panel = document.createElement("div");
        panel.style.cssText =
            "background:#211d38;color:white;padding:30px;border-radius:18px;" +
            "max-width:420px;width:100%;text-align:center;box-shadow:0 15px 50px #0008;";

        const heading = document.createElement("h2");
        heading.textContent = "Task Time Completed!";

        const message = document.createElement("p");
        message.textContent =
            `Time is up for: ${taskNameInput.value.trim() || "Your task"}`;

        const stopButton = document.createElement("button");
        stopButton.className = "primary-button";
        stopButton.textContent = "Dismiss Alert";
        stopButton.addEventListener("click", stopCompletionSound);

        panel.append(heading, message, stopButton);
        alertBox.appendChild(panel);
        document.body.appendChild(alertBox);
    }

    function updateCountdown() {
        if (!countdownRunning || countdownEndTime === null) return;

        remainingSeconds = Math.max(
            0,
            Math.ceil((countdownEndTime - Date.now()) / 1000)
        );

        countdownDisplay.textContent = formatTime(remainingSeconds);

        if (remainingSeconds <= 0) {
            showCompletionAlert();
        }
    }

    startTaskButton.addEventListener("click", () => {
        if (countdownRunning) return;

        stopCompletionSound();

        const total = readTimeLimit();
        if (total === null) return;

        remainingSeconds = total;
        countdownEndTime = Date.now() + remainingSeconds * 1000;
        countdownRunning = true;

        taskNameDisplay.textContent =
            taskNameInput.value.trim() || "Untitled task";

        taskStatus.textContent = "Task timer running.";
        countdownDisplay.textContent = formatTime(remainingSeconds);

        clearInterval(countdownInterval);
        countdownInterval = setInterval(updateCountdown, 200);
        updateCountdown();
    });

    pauseTaskButton.addEventListener("click", () => {
        if (!countdownRunning) return;

        remainingSeconds = Math.max(
            0,
            Math.ceil((countdownEndTime - Date.now()) / 1000)
        );

        countdownRunning = false;
        countdownEndTime = null;
        clearInterval(countdownInterval);
        countdownInterval = null;

        countdownDisplay.textContent = formatTime(remainingSeconds);
        taskStatus.textContent = "Task timer paused.";
    });

    resetTaskButton.addEventListener("click", () => {
        countdownRunning = false;
        countdownEndTime = null;
        clearInterval(countdownInterval);
        countdownInterval = null;

        stopCompletionSound();

        const total = readTimeLimit();
        remainingSeconds = total === null ? 0 : total;

        countdownDisplay.textContent = formatTime(remainingSeconds);
        taskStatus.textContent = "Task timer reset.";
    });

    function updateElapsed() {
        if (!stopwatchRunning || elapsedStartTime === null) return;

        const currentElapsed = elapsedSeconds +
            Math.floor((Date.now() - elapsedStartTime) / 1000);

        elapsedDisplay.textContent = formatTime(currentElapsed);
    }

    startStopwatchButton.addEventListener("click", () => {
        if (stopwatchRunning) {
            stopwatchRunning = false;
            elapsedSeconds += Math.floor((Date.now() - elapsedStartTime) / 1000);
            elapsedStartTime = null;
            clearInterval(stopwatchInterval);
            stopwatchInterval = null;
            stopwatchStatus.textContent = "Stopwatch paused.";
        } else {
            stopwatchRunning = true;
            elapsedStartTime = Date.now();
            stopwatchInterval = setInterval(updateElapsed, 250);
            stopwatchStatus.textContent = "Stopwatch running.";
        }

        startStopwatchButton.textContent =
            stopwatchRunning ? "Pause Stopwatch" : "Resume Stopwatch";

        updateElapsed();
    });

    resetStopwatchButton.addEventListener("click", () => {
        stopwatchRunning = false;
        elapsedSeconds = 0;
        elapsedStartTime = null;
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;

        elapsedDisplay.textContent = "00:00:00";
        stopwatchStatus.textContent = "Stopwatch reset.";
        startStopwatchButton.textContent = "Start Stopwatch";
    });

    countdownDisplay.textContent = formatTime(remainingSeconds);
    elapsedDisplay.textContent = "00:00:00";
})();


// ============================================================
// CHRONOOS SETTINGS
// ============================================================

(() => {
    document.addEventListener("DOMContentLoaded", () => {

        const darkMode = document.getElementById("darkModeSetting");
        const accentColor = document.getElementById("accentColorSetting");
        const notifications = document.getElementById("notificationSetting");
        const sound = document.getElementById("soundSetting");
        const timeFormat = document.getElementById("timeFormatSetting");

        const saveButton = document.getElementById("saveSettingsButton");
        const resetButton = document.getElementById("resetSettingsButton");
        const status = document.getElementById("settingsStatus");

        // Stop if the Settings page is not present.
        if (!darkMode || !accentColor || !notifications ||
            !sound || !timeFormat || !saveButton || !resetButton) {
            return;
        }

        const defaultSettings = {
            darkMode: true,
            accentColor: "#8b5cf6",
            notifications: false,
            sound: true,
            timeFormat: "12"
        };

        let settings = { ...defaultSettings };

        function applySettings() {
            document.body.dataset.theme =
                settings.darkMode ? "dark" : "light";

            document.documentElement.style.setProperty(
                "--primary",
                settings.accentColor
            );

            document.documentElement.style.setProperty(
                "--primary-light",
                settings.accentColor
            );

            // Global preference used by alarm and timer sound functions.
            window.chronoosSoundEnabled = settings.sound;
window.chronoosNotificationsEnabled = settings.notifications;

            darkMode.checked = settings.darkMode;
            accentColor.value = settings.accentColor;
            notifications.checked = settings.notifications;
            sound.checked = settings.sound;
            timeFormat.value = settings.timeFormat;
        }

        function saveSettings() {
            localStorage.setItem(
                "chronoosSettings",
                JSON.stringify(settings)
            );
        }

        function loadSettings() {
            try {
                const saved = JSON.parse(
                    localStorage.getItem("chronoosSettings")
                );

                if (saved && typeof saved === "object") {
                    settings = { ...defaultSettings, ...saved };
                }
            } catch (error) {
                console.warn("Could not load settings:", error);
            }

            applySettings();
        }

        darkMode.addEventListener("change", () => {
            settings.darkMode = darkMode.checked;
            applySettings();
        });

        accentColor.addEventListener("change", () => {
            settings.accentColor = accentColor.value;
            applySettings();
        });

        sound.addEventListener("change", () => {
            settings.sound = sound.checked;
            applySettings();
        });

        timeFormat.addEventListener("change", () => {
            settings.timeFormat = timeFormat.value;
            applySettings();
        });

        notifications.addEventListener("change", async () => {
            if (notifications.checked) {
                if (!("Notification" in window)) {
                    notifications.checked = false;
                    settings.notifications = false;
                    status.textContent =
                        "Browser notifications are not supported.";
                    return;
                }

                const permission = await Notification.requestPermission();

                if (permission !== "granted") {
                    notifications.checked = false;
                    settings.notifications = false;
                    status.textContent =
                        "Notification permission was not granted.";
                    return;
                }
            }

            settings.notifications = notifications.checked;
            status.textContent = "Notification preference updated.";
        });

        saveButton.addEventListener("click", () => {
            settings.darkMode = darkMode.checked;
            settings.accentColor = accentColor.value;
            settings.sound = sound.checked;
            settings.timeFormat = timeFormat.value;

            // Notifications can only be enabled with browser permission.
            settings.notifications =
                notifications.checked &&
                "Notification" in window &&
                Notification.permission === "granted";

            notifications.checked = settings.notifications;

            applySettings();
            saveSettings();

            status.textContent = "Your preferences have been saved!";
        });

        resetButton.addEventListener("click", () => {
            settings = { ...defaultSettings };

            applySettings();
            saveSettings();

            status.textContent = "Settings restored to defaults.";
        });

        loadSettings();
    });
})();


// ============================================================
// CHRONOOS REMINDERS
// ============================================================

(() => {
    document.addEventListener("DOMContentLoaded", () => {

        const titleInput = document.getElementById("reminderTitle");
        const dateInput = document.getElementById("reminderDateTime");
        const typeInput = document.getElementById("reminderType");
        const intervalInput = document.getElementById("reminderInterval");
        const endDateInput = document.getElementById("reminderEndDateTime");
        const repeatRow = document.getElementById("repeatIntervalRow");
        const endRow = document.getElementById("reminderEndRow");

        const addButton = document.getElementById("addReminderButton");
        const reminderList = document.getElementById("reminderList");
        const status = document.getElementById("reminderStatus");

        if (!titleInput || !dateInput || !typeInput ||
            !intervalInput || !endDateInput || !addButton ||
            !reminderList || !repeatRow || !endRow) {
            return;
        }

        let reminders = [];

        try {
            reminders = JSON.parse(
                localStorage.getItem("chronoosReminders")
            ) || [];
        } catch (error) {
            reminders = [];
        }

        function saveReminders() {
            localStorage.setItem(
                "chronoosReminders",
                JSON.stringify(reminders)
            );
        }

        function updateForm() {
            const type = typeInput.value;

            repeatRow.hidden = type === "once";
            endRow.hidden = type !== "until";
        }

        typeInput.addEventListener("change", updateForm);

        function renderReminders() {
            reminderList.innerHTML = "";

            if (reminders.length === 0) {
                reminderList.textContent = "No reminders added yet.";
                return;
            }

            reminders.forEach(reminder => {
                const item = document.createElement("div");
                item.className = "settings-row";

                const details = document.createElement("div");

                const heading = document.createElement("strong");
                heading.textContent = reminder.title;

                const date = document.createElement("p");
                date.textContent =
                    "Starts: " + new Date(reminder.dateTime).toLocaleString();

                const type = document.createElement("p");

                if (reminder.type === "once") {
                    type.textContent = "One-time reminder";
                } else if (reminder.type === "permanent") {
                    type.textContent =
                        "Repeats every " + reminder.interval + " minutes";
                } else {
                    type.textContent =
                        "Repeats every " + reminder.interval +
                        " minutes until " +
                        new Date(reminder.endDateTime).toLocaleString();
                }

                details.append(heading, date, type);

                const deleteButton = document.createElement("button");
                deleteButton.className = "icon-button";
                deleteButton.textContent = "Delete";

                deleteButton.addEventListener("click", () => {
                    reminders = reminders.filter(
                        entry => entry.id !== reminder.id
                    );

                    saveReminders();
                    renderReminders();
                    status.textContent = "Reminder deleted.";
                });

                item.append(details, deleteButton);
                reminderList.appendChild(item);
            });
        }

        addButton.addEventListener("click", () => {
            const title = titleInput.value.trim();
            const dateTime = dateInput.value;
            const type = typeInput.value;
            const startTime = new Date(dateTime).getTime();

            if (!title || !dateTime) {
                status.textContent =
                    "Please enter a title and start date/time.";
                return;
            }

            if (!Number.isFinite(startTime) || startTime <= Date.now()) {
                status.textContent =
                    "Please choose a valid future date and time.";
                return;
            }

            const reminder = {
                id: Date.now(),
                title,
                dateTime,
                type,
                interval: type === "once" ? null :
                    Number(intervalInput.value),
                endDateTime: null,
                nextTrigger: startTime,
                completed: false
            };

            if (type === "until") {
                const endDateTime = endDateInput.value;
                const endTime = new Date(endDateTime).getTime();

                if (!endDateTime || !Number.isFinite(endTime) ||
                    endTime <= startTime) {
                    status.textContent =
                        "Choose an end date after the start date.";
                    return;
                }

                reminder.endDateTime = endDateTime;
            }

            reminders.push(reminder);

            saveReminders();
            renderReminders();

            titleInput.value = "";
            dateInput.value = "";
            endDateInput.value = "";
            typeInput.value = "once";

            updateForm();

            status.textContent = "Reminder added successfully!";
        });

        function checkReminders() {
            const now = Date.now();
            let changed = false;

            reminders.forEach(reminder => {
                if (reminder.completed) return;

                const nextTrigger = Number(
                    reminder.nextTrigger || new Date(reminder.dateTime).getTime()
                );

                if (reminder.type === "until" &&
                    now >= new Date(reminder.endDateTime).getTime()) {
                    reminder.completed = true;
                    changed = true;
                    return;
                }

                if (now < nextTrigger) return;

                if (reminder.type === "once") {
                    showReminderNotification(reminder.title);
                    reminder.completed = true;
                    changed = true;
                    return;
                }

                const endTime = reminder.type === "until"
                    ? new Date(reminder.endDateTime).getTime()
                    : Infinity;

                if (nextTrigger <= endTime) {
                    showReminderNotification(reminder.title);

                    reminder.nextTrigger =
                        nextTrigger + reminder.interval * 60 * 1000;

                    if (reminder.nextTrigger > endTime) {
                        reminder.completed = true;
                    }

                    changed = true;
                }
            });

            if (changed) {
                saveReminders();
                renderReminders();
            }
        }

        function showReminderNotification(title) {
            if (
                window.chronoosNotificationsEnabled === true &&
                "Notification" in window &&
                Notification.permission === "granted"
            ) {
                new Notification("ChronoOS Reminder", {
                    body: title
                });
            }
        }

        updateForm();
        renderReminders();

        checkReminders();
        setInterval(checkReminders, 1000);
    });
})();


// ============================================================
// CHRONOOS COUNTDOWN TIMER
// ============================================================

(() => {
    document.addEventListener("DOMContentLoaded", () => {

        const hoursInput = document.getElementById("timerHours");
        const minutesInput = document.getElementById("timerMinutes");
        const secondsInput = document.getElementById("timerSeconds");

        const display = document.getElementById("timerCountdownDisplay");
        const status = document.getElementById("timerStatus");

        const startButton = document.getElementById("startTimerButton");
        const pauseButton = document.getElementById("pauseTimerButton");
        const resetButton = document.getElementById("resetTimerButton");
        const presetButtons = document.querySelectorAll(".timer-preset");

        if (!hoursInput || !minutesInput || !secondsInput || !display) {
            return;
        }

        let remainingSeconds = 300;
        let timerInterval = null;
        let isRunning = false;
        let endTime = null;

        function formatTime(totalSeconds) {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            return [hours, minutes, seconds]
                .map(value => String(value).padStart(2, "0"))
                .join(":");
        }

        function updateDisplay() {
            display.textContent = formatTime(remainingSeconds);
        }

        function getInputSeconds() {
            const hours = Number(hoursInput.value);
            const minutes = Number(minutesInput.value);
            const seconds = Number(secondsInput.value);

            if (
                !Number.isInteger(hours) ||
                !Number.isInteger(minutes) ||
                !Number.isInteger(seconds) ||
                hours < 0 || hours > 99 ||
                minutes < 0 || minutes > 59 ||
                seconds < 0 || seconds > 59
            ) {
                status.textContent = "Please enter valid time values.";
                return null;
            }

            return hours * 3600 + minutes * 60 + seconds;
        }

        function stopTimerInterval() {
            if (timerInterval !== null) {
                clearInterval(timerInterval);
                timerInterval = null;
            }

            isRunning = false;
            endTime = null;
        }

        function completeTimer() {
            stopTimerInterval();
            remainingSeconds = 0;
            updateDisplay();

            status.textContent = "Time's up! Timer completed.";

            if (window.chronoosSoundEnabled !== false &&
                typeof playAlarmSound === "function") {
                playAlarmSound();
            }

            if (
                window.chronoosNotificationsEnabled === true &&
                "Notification" in window &&
                Notification.permission === "granted"
            ) {
                new Notification("ChronoOS Timer", {
                    body: "Your countdown timer has finished!"
                });
            }
        }

        function tick() {
            remainingSeconds = Math.max(
                0,
                Math.ceil((endTime - Date.now()) / 1000)
            );

            updateDisplay();

            if (remainingSeconds <= 0) {
                completeTimer();
            }
        }

        function startTimer() {
            if (isRunning) return;

            if (remainingSeconds <= 0) {
                const inputSeconds = getInputSeconds();

                if (inputSeconds === null) return;

                if (inputSeconds === 0) {
                    status.textContent = "Please set a duration greater than zero.";
                    return;
                }

                remainingSeconds = inputSeconds;
            }

            if (remainingSeconds <= 0) {
                status.textContent = "Please set a duration greater than zero.";
                return;
            }

            isRunning = true;
            endTime = Date.now() + remainingSeconds * 1000;

            status.textContent = "Timer is running...";

            timerInterval = setInterval(tick, 250);
            tick();
        }

        function pauseTimer() {
            if (!isRunning) return;

            tick();

            if (isRunning) {
                stopTimerInterval();
                status.textContent = "Timer paused.";
            }
        }

        function resetTimer() {
            stopTimerInterval();

            const inputSeconds = getInputSeconds();

            remainingSeconds = inputSeconds === null ? 0 : inputSeconds;

            updateDisplay();
            status.textContent = "Timer reset. Ready to start.";
            
            if (typeof stopAlarmSound === "function") {
                stopAlarmSound();
            }
        }

        startButton.addEventListener("click", startTimer);
        pauseButton.addEventListener("click", pauseTimer);
        resetButton.addEventListener("click", resetTimer);

        [hoursInput, minutesInput, secondsInput].forEach(input => {
            input.addEventListener("input", () => {
                if (isRunning) return;

                const inputSeconds = getInputSeconds();

                if (inputSeconds !== null) {
                    remainingSeconds = inputSeconds;
                    updateDisplay();
                    status.textContent = "Ready to start.";
                }
            });
        });

        presetButtons.forEach(button => {
            button.addEventListener("click", () => {
                stopTimerInterval();

                const presetMinutes = Number(button.dataset.minutes);

                hoursInput.value = 0;
                minutesInput.value = presetMinutes;
                secondsInput.value = 0;

                remainingSeconds = presetMinutes * 60;

                if (typeof stopAlarmSound === "function") {
                    stopAlarmSound();
                }

                updateDisplay();
                status.textContent = `${presetMinutes}-minute timer selected.`;
            });
        });

        remainingSeconds = getInputSeconds() ?? 300;
        updateDisplay();

    });
})();
