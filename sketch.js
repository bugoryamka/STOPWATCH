let startTime = 0;
let endTime = 0;
let elapsedTime = 0;
let isRunning = false;
let startWorldTime;
let activities = [];

// DOM Elements
const toggleButton = document.getElementById("toggleButton");
const stopwatchDisplay = document.getElementById("stopwatchDisplay");
const taskListContainer = document.getElementById("taskList");
const exportTasksButton = document.getElementById("exportTasksButton");
const exportDateButton = document.getElementById("exportDateButton");

// Event Listeners
toggleButton.addEventListener("click", () => toggleStopwatch(toggleButton));
exportTasksButton.addEventListener("click", exportTasks);
exportDateButton.addEventListener("click", exportDate);

// Start or stop the stopwatch
function toggleStopwatch(button) {
  if (isRunning) {
    // Stop the stopwatch
    isRunning = false;
    elapsedTime = Date.now() - startTime;
    endTime = Date.now();
    button.textContent = "Start Stopwatch";
    stopwatchDisplay.classList.remove("running");
    showTaskNameModal();
  } else {
    // Start the stopwatch
    startWorldTime = new Date();
    startTime = Date.now() - elapsedTime;
    isRunning = true;
    button.textContent = "Stop Stopwatch";
    stopwatchDisplay.classList.add("running");
    runStopwatch();
  }
}

// Run the stopwatch (counting upwards)
function runStopwatch() {
  if (isRunning) {
    const currentTime = Date.now() - startTime;
    displayStopwatch(currentTime);
    setTimeout(runStopwatch, 1000);
  }
}

// Display Stopwatch in HH:MM:SS format
function displayStopwatch(ms) {
  let seconds = Math.floor(ms / 1000) % 60;
  let minutes = Math.floor(ms / (1000 * 60)) % 60;
  let hours = Math.floor(ms / (1000 * 60 * 60));

  stopwatchDisplay.textContent =
    `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// Show modal to enter task name
function showTaskNameModal() {
  let taskName = prompt("Enter the task name:");
  if (taskName) {
    saveTask(taskName);
  }
}

// Save the task entered in the modal
function saveTask(taskName) {
  let durationInMs = elapsedTime;
  let hours = Math.floor(durationInMs / (1000 * 60 * 60));
  let minutes = Math.floor((durationInMs / (1000 * 60)) % 60);
  let seconds = Math.floor((durationInMs / 1000) % 60);
  let formattedDuration = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  let startTimeFormatted = new Date(startWorldTime).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  let endTimeFormatted = new Date(endTime).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  let taskDate = new Date(startWorldTime).toISOString().split('T')[0];

  activities.push({
    activity: taskName,
    start_time: startTimeFormatted,
    end_time: endTimeFormatted,
    duration: formattedDuration,
    date: taskDate,
  });

  updateTaskList();
}

// Update the task list display
function updateTaskList() {
  taskListContainer.innerHTML = "";

  activities.forEach((activity, index) => {
    let activityItem = document.createElement("li");
    activityItem.classList.add("list-group-item");
    activityItem.textContent = `${index + 1}. ${activity.activity} - Duration: ${activity.duration} | Start: ${activity.start_time} | End: ${activity.end_time} | Date: ${activity.date}`;
    taskListContainer.appendChild(activityItem);
  });
}

// Export activities to an Excel file
function exportTasks() {
  const tasksByDate = activities.reduce((acc, task) => {
    const date = task.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    const { date: taskDate, ...taskWithoutDate } = task;
    acc[date].push(taskWithoutDate);
    return acc;
  }, {});

  const workbook = XLSX.utils.book_new();
  for (const date in tasksByDate) {
    const worksheetData = tasksByDate[date].map(task => [
      task.activity,
      task.start_time,
      task.end_time,
      task.duration,
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Activity", "Start Time", "End Time", "Duration"],
      ...worksheetData,
    ]);

    XLSX.utils.book_append_sheet(workbook, worksheet, date);
  }

  const excelFile = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
  const blob = new Blob([s2ab(excelFile)], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "activities.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}

// Export current date to Excel
function exportDate() {
  const currentDate = new Date().toLocaleString();
  const ws = XLSX.utils.aoa_to_sheet([['Date'], [currentDate]]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, 'Date_Export.xlsx');
}

// Helper function to convert a string to an ArrayBuffer
function s2ab(s) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

// Display current time in 24-hour format (Moscow Time)
function displayTime() {
  const now = new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" });
  const time = new Date(now);
  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  document.getElementById("timeDisplay").textContent = `${hours}:${minutes}:${seconds}`;
}

// Display current date in day.month.year format
function displayDate() {
  const now = new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" });
  const date = new Date(now);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  document.getElementById("currentDate").textContent = `${day}.${month}.${year}`;
}

// Initialize and update the current time and date
window.onload = function () {
  setInterval(displayTime, 1000);
  displayDate();
};