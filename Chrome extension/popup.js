const STORAGE_KEY = 'taskData';
const PASSWORD_KEY = 'EditDataPassword';
let isEditable = false;

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  document.getElementById('addTaskBtn').addEventListener('click', addTask);
  document.getElementById('editBtn').addEventListener('click', toggleEditMode);

  const resetBtn = document.createElement('button');
  resetBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="17 1 21 5 17 9" />
  <path d="M3 11a9 9 0 0115-6.7L21 5" />
  <polyline points="7 23 3 19 7 15" />
  <path d="M21 13a9 9 0 01-15 6.7L3 19" />
</svg>

 Reset Password`;
 resetBtn.classList.add('bottom-btn');
  resetBtn.addEventListener('click', resetPassword);
  document.querySelector('.buttons').appendChild(resetBtn);
});

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

// Updated loadData to include creationDates
function loadData() {
  getStorage(STORAGE_KEY, result => {
    const data = result[STORAGE_KEY] || { tasks: [], checklist: {}, creationDates: {} };
    renderTable(data);
  });
}

// Updated addTask to store creation date
function addTask() {
  const taskName = prompt('Enter task name:');
  if (!taskName) return;
  getStorage(STORAGE_KEY, result => {
    // Ensure we have a default object, and ensure creationDates exists
    const data = result[STORAGE_KEY] || { tasks: [], checklist: {}, creationDates: {} };
    if (!data.creationDates) { data.creationDates = {}; }
    if (!data.tasks.includes(taskName)) {
      data.tasks.push(taskName);
      data.creationDates[taskName] = new Date().toISOString().split('T')[0];
      setStorage({ [STORAGE_KEY]: data }, loadData);
    } else {
      alert("Task already exists!");
    }
  });
}

// New helper function to get date range from a start date until today
function getDateRange(startDate) {
  const dates = [];
  let current = new Date(startDate);
  const today = new Date();
  while (current <= today) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// New helper function to get overall date range from earliest task creation date to today
function getOverallDateRange(data) {
  const creationDates = data.creationDates || {};
  let earliest = null;
  data.tasks.forEach(task => {
    if (creationDates[task]) {
      let dt = new Date(creationDates[task]);
      if (!earliest || dt < earliest) {
        earliest = dt;
      }
    }
  });
  if (!earliest) {
    earliest = new Date();
  }
  return getDateRange(earliest.toISOString().split('T')[0]);
}

// Updated renderTable to use overall date range and show checkboxes only from task creation date
function renderTable(data) {
  const container = document.getElementById('taskTable');
  container.innerHTML = '';
  const dates = getOverallDateRange(data);
  const table = document.createElement('table');

  const headerRow = document.createElement('tr');
  headerRow.innerHTML = `<th>Task</th>` + dates.map(d => `<th>${d.slice(5)}</th>`).join('') + `<th> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M3 6h18"/>
  <path d="M8 6V4h8v2"/>
  <rect x="6" y="6.5" width="12" height="13" rx="2"/>
  <line x1="10" y1="11" x2="10" y2="16"/>
  <line x1="14" y1="11" x2="14" y2="16"/>
</svg>
</th>`;
  table.appendChild(headerRow);

  data.tasks.forEach(task => {
    const row = document.createElement('tr');
    let rowHTML = `<td>${task}</td>`;
    const creationDate = data.creationDates[task] || dates[0];
    dates.forEach(date => {
      if (date < creationDate) {
        rowHTML += `<td></td>`;
      } else {
        const checked = data.checklist[task]?.[date] || false;
        rowHTML += `<td><input type="checkbox" data-task="${task}" data-date="${date}" ${checked ? 'checked' : ''}></td>`;
      }
    });
    rowHTML += `<td><button class="delete-btn" data-task="${task}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="10" />
  <line x1="8" y1="8" x2="16" y2="16" />
  <line x1="16" y1="8" x2="8" y2="16" />
</svg>
</button></td>`;
    row.innerHTML = rowHTML;
    table.appendChild(row);
  });

  container.appendChild(table);
  attachCheckboxListeners(data);
  attachDeleteListeners(data);
}

function attachCheckboxListeners(data) {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', e => {
      const target = e.target;
      const newChecked = target.checked;
      if (!isEditable) {
        const password = prompt('Enter password to change checkbox state:');
        getStorage(PASSWORD_KEY, result => {
         
          if (!result[PASSWORD_KEY]) {
            alert('No password set. Please set a password first.');
            const newPass = prompt('Set a new password:');
            if (!newPass) {
              // revert checkbox state
              target.checked = !newChecked;
              return;
            }
            // If no password is set, save the new password
            setStorage({ [PASSWORD_KEY]: newPass }, () => {
              isEditable = true;
              loadData();
            }
            );
            return;
          }
          // Check if the entered password matches the stored password
          if (!password) {
            alert('Password cannot be empty!');
            // revert checkbox state
            target.checked = !newChecked;
            return;
          }
          // If password is set, compare it with the stored password
          console.log('Stored password:', result[PASSWORD_KEY]);
          console.log('Entered password:', password);
          if (result[PASSWORD_KEY] !== password) {
            alert('Incorrect password!');
            // revert checkbox state
            target.checked = !newChecked;
          } else {
            updateCheckbox(data, target, newChecked);
          }
        });
      } else {
        updateCheckbox(data, target, newChecked);
      }
    });
  });
}

function updateCheckbox(data, target, newChecked) {
  const task = target.getAttribute('data-task');
  const date = target.getAttribute('data-date');
  if (!data.checklist[task]) data.checklist[task] = {};
  data.checklist[task][date] = newChecked;
  setStorage({ [STORAGE_KEY]: data });
}

function attachDeleteListeners(data) { 
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(btn => {
     btn.addEventListener('click', () => {
       const task = btn.getAttribute('data-task');
        const password = prompt('Enter password to delete this task:'); 
        getStorage(PASSWORD_KEY, result => {
           if (result[PASSWORD_KEY] !== password) {
             alert('Incorrect password!');
              return; 
            } 
            if (confirm(`Are you sure you want to delete task "${task}"?`))
               {
                 data.tasks = data.tasks.filter(t => t !== task); 
                 delete data.checklist[task]; 
                 delete data.creationDates[task]; 
                 setStorage({ [STORAGE_KEY]: data }, loadData); 
                } }); 
              }); 
            }); }

function toggleEditMode() {
  const password = prompt('Enter password:');
  getStorage(PASSWORD_KEY, result => {
    if (!result[PASSWORD_KEY]) {
      const newPass = prompt('Set a new password:');
      if (newPass) {
        setStorage({ [PASSWORD_KEY]: newPass });
        isEditable = true;
        loadData();
      }
    } else if (password === result[PASSWORD_KEY]) {
      isEditable = !isEditable;
      loadData();
    } else {
      alert('Incorrect password!');
    }
  });
}

function resetPassword() {
  const confirmReset = confirm('Are you sure you want to reset the password? This requires the current password.');
  if (!confirmReset) return;
  const currentPass = prompt('Enter current password:');
  getStorage(PASSWORD_KEY, result => {
    if (result[PASSWORD_KEY] === currentPass) {
      const newPass = prompt('Enter new password:');
      if (newPass) {
        setStorage({ [PASSWORD_KEY]: newPass }, () => {
          alert('Password has been reset.');
        });
      }
    } else {
      alert('Incorrect password.');
    }
  });
}

// Helper functions for storage fallback
function getStorage(key, callback) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get([key], callback);
  } else {
    const item = localStorage.getItem(key);
    let result = {};
    result[key] = item ? JSON.parse(item) : undefined;
    callback(result);
  }
}

function setStorage(obj, callback) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set(obj, callback);
  } else {
    Object.keys(obj).forEach(key => {
      localStorage.setItem(key, JSON.stringify(obj[key]));
    });
    if (callback) callback();
  }
}