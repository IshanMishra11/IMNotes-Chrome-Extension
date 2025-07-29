document.addEventListener('DOMContentLoaded', function () {
  const saveBtn = document.getElementById('saveBtn');
  const noteInput = document.getElementById('noteInput');
  const noteList = document.getElementById('noteList');
  const message = document.getElementById('message');
  const darkModeToggle = document.getElementById('darkModeToggle');

  let currentURL = '';

  // STEP 1: Get the current tab's URL
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = new URL(tabs[0].url);
    currentURL = url.origin; // e.g., https://www.example.com
    loadNotesForURL(currentURL);
  });

  // Save note for specific URL
  saveBtn.addEventListener('click', function () {
    const note = noteInput.value.trim();
    if (!note || !currentURL) return;

    chrome.storage.sync.get([currentURL], function (result) {
      const notes = result[currentURL] || [];
      notes.push(note);
      chrome.storage.sync.set({ [currentURL]: notes }, function () {
        noteInput.value = '';
        showMessage("Note saved ✅");
        displayNotes(notes);
      });
    });
  });

  // Toggle Dark Mode
  darkModeToggle.addEventListener('change', function () {
    const dark = darkModeToggle.checked;
    document.body.classList.toggle('dark', dark);
    chrome.storage.sync.set({ darkMode: dark });
  });

  function loadNotesForURL(urlKey) {
    chrome.storage.sync.get([urlKey], function (result) {
      const notes = result[urlKey] || [];
      displayNotes(notes);
    });
  }

  function displayNotes(notes) {
  noteList.innerHTML = '';
  notes.forEach((note, index) => {
    const li = document.createElement('li');
    li.textContent = note;

    const delBtn = document.createElement('span');
    delBtn.textContent = '❌';
    delBtn.classList.add('delete-btn');
    delBtn.title = 'Delete this note';
    delBtn.addEventListener('click', function () {
      notes.splice(index, 1);
      chrome.storage.sync.set({ [currentURL]: notes }, function () {
        displayNotes(notes);
      });
    });

    li.appendChild(delBtn);
    noteList.appendChild(li);
  });
}


  function showMessage(text) {
    message.textContent = text;
    message.classList.add('visible');
    setTimeout(() => message.classList.remove('visible'), 2000);
  }

  function loadTheme() {
    chrome.storage.sync.get(['darkMode'], function (result) {
      const isDark = result.darkMode || false;
      darkModeToggle.checked = isDark;
      document.body.classList.toggle('dark', isDark);
    });
  }

  loadTheme(); // load dark mode setting
});
