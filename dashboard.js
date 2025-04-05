document.addEventListener('DOMContentLoaded', () => {
  refreshUserProfile();
  loadLearningPath();
  // Dynamically add fade-out animation style
  const style = document.createElement('style');
  style.innerHTML = `
    .fade-out {
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  `;
  document.head.appendChild(style);
});

// Refresh the user profile UI
function refreshUserProfile() {
  const token = localStorage.getItem('careerai_token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }
  fetch('/api/user/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('userName').textContent = data.name || 'User';
      document.getElementById('userCareer').textContent = data.career || 'Not Selected Yet';
    })
    .catch(err => {
      console.error('❌ Failed to fetch user:', err);
      localStorage.removeItem('careerai_token');
      window.location.href = '/login.html';
    });
}

// Logout
function logout() {
  localStorage.removeItem('careerai_token');
  window.location.href = '/login.html';
}

let generatedRoadmapMarkdown = "";
let learningPathTasks = [];

// Generate Roadmap with enhanced UI
async function generateRoadmap() {
  const roadmapContent = document.getElementById('roadmapContent');
  if (!roadmapContent) {
    console.error('roadmapContent element not found');
    return;
  }
  roadmapContent.innerHTML = `
    <div style="text-align:center; padding:1rem;">
      <div class="spinner" style="margin:auto; width:40px; height:40px; border:6px solid #ccc; border-top:6px solid #2e5ee0; border-radius:50%; animation:spin 1s linear infinite;"></div>
      <p style="margin-top:0.5rem;">Generating roadmap... Please wait</p>
    </div>
  `;
  try {
    const token = localStorage.getItem('careerai_token');
    const career = document.getElementById('userCareer').textContent;
    const res = await fetch('/api/user/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ career })
    });
    const data = await res.json();
    if (res.ok && data.roadmap) {
      generatedRoadmapMarkdown = data.roadmap;
      // Render markdown to HTML using Marked
      roadmapContent.innerHTML = marked.parse(data.roadmap);
      // Show the Confirm Roadmap button
      document.getElementById('confirmRoadmapBtn').style.display = 'inline-block';
    } else {
      roadmapContent.innerHTML = "⚠️ Could not generate roadmap.";
    }
  } catch (err) {
    console.error('❌ Roadmap generation failed:', err);
    roadmapContent.innerHTML = "❌ Error generating roadmap.";
  }
}

// Confirm Roadmap: parse markdown into a checklist and store tasks in the backend
function confirmRoadmap() {
  const lines = generatedRoadmapMarkdown.split('\n');
  learningPathTasks = [];
  lines.forEach(line => {
    line = line.trim();
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const taskText = line.substring(2).trim();
      if (taskText) {
        learningPathTasks.push({ text: taskText, completed: false });
      }
    }
  });
  if (learningPathTasks.length === 0) {
    alert("No tasks found in the roadmap to confirm.");
    return;
  }
  document.getElementById('confirmRoadmapBtn').style.display = 'none';
  // Save tasks to backend
  saveLearningPathTasks();
}

// Save learning path tasks to backend
async function saveLearningPathTasks() {
  const token = localStorage.getItem('careerai_token');
  try {
    const res = await fetch('/api/user/learning-path', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ tasks: learningPathTasks })
    });
    const data = await res.json();
    if (res.ok) {
      learningPathTasks = data.tasks;
      document.getElementById('learningPathCard').style.display = 'block';
      renderLearningPath();
    } else {
      alert('Failed to save learning path tasks.');
    }
  } catch (err) {
    console.error('Error saving learning path tasks:', err);
    alert('Error saving learning path tasks.');
  }
}

// Load learning path tasks from backend
async function loadLearningPath() {
  const token = localStorage.getItem('careerai_token');
  try {
    const res = await fetch('/api/user/learning-path', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok && data.tasks) {
      learningPathTasks = data.tasks;
      if (learningPathTasks.length > 0) {
        document.getElementById('learningPathCard').style.display = 'block';
        renderLearningPath();
      }
    }
  } catch (err) {
    console.error('Error loading learning path tasks:', err);
  }
}

// Render the checklist UI with delete option and animation
function renderLearningPath() {
  const container = document.getElementById('learningPathContent');
  if (!container) return;
  container.innerHTML = '';
  learningPathTasks.forEach((task, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'checklist-item flex justify-between items-center p-3 bg-white rounded shadow transition transform hover:scale-105 duration-200';
    // Add a data-index attribute for deletion animation
    itemDiv.setAttribute('data-index', index);
    
    // Left side: Checkbox and text
    const leftDiv = document.createElement('div');
    leftDiv.className = 'flex items-center space-x-3';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.className = 'h-5 w-5 text-blue-600 focus:ring-blue-500';
    checkbox.addEventListener('change', () => {
      learningPathTasks[index].completed = checkbox.checked;
      updateLearningPathTasks();
      updateStreak();
    });
    const span = document.createElement('span');
    span.textContent = task.text;
    span.className = 'text-gray-800';
    leftDiv.appendChild(checkbox);
    leftDiv.appendChild(span);
    
    // Right side: Delete button with animation
    const delBtn = document.createElement('button');
    delBtn.innerHTML = '&times;';
    delBtn.className = 'delete-btn text-red-500 text-2xl transition hover:text-red-700';
    delBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to delete this task?")) {
        const itemElement = document.querySelector(`.checklist-item[data-index="${index}"]`);
        if (itemElement) {
          itemElement.classList.add('fade-out');
          setTimeout(() => {
            performDeleteTask(index);
          }, 300);
        } else {
          performDeleteTask(index);
        }
      }
    });
    
    itemDiv.appendChild(leftDiv);
    itemDiv.appendChild(delBtn);
    container.appendChild(itemDiv);
  });
}

// Perform deletion: call backend to delete task
async function performDeleteTask(index) {
  const token = localStorage.getItem('careerai_token');
  try {
    const res = await fetch(`/api/user/learning-path/${index}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok && data.tasks) {
      learningPathTasks = data.tasks;
      renderLearningPath();
    } else {
      console.warn('Deletion response not OK:', data);
      // If tasks are returned despite a non-ok status, update UI anyway
      if (data.tasks) {
        learningPathTasks = data.tasks;
        renderLearningPath();
      } else {
        alert('Failed to delete task.');
      }
    }
  } catch (err) {
    alert('Success deleting task.');
  }
}


// Update learning path tasks in backend (after checkbox changes)
async function updateLearningPathTasks() {
  const token = localStorage.getItem('careerai_token');
  try {
    await fetch('/api/user/learning-path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ tasks: learningPathTasks })
    });
  } catch (err) {
    console.error('Error updating tasks:', err);
  }
}

// Update streak counter: if all tasks are complete, increment the streak and reset tasks
function updateStreak() {
  const allCompleted = learningPathTasks.every(task => task.completed);
  let streak = parseInt(localStorage.getItem('currentStreak') || '0', 10);
  if (allCompleted) {
    streak += 1;
    alert(`Congratulations! You've completed all tasks. Your streak is now ${streak} day(s)!`);
    learningPathTasks = learningPathTasks.map(task => ({ ...task, completed: false }));
    updateLearningPathTasks();
    renderLearningPath();
  }
  document.getElementById('streakCounter').textContent = `Current Streak: ${streak} day(s)`;
}
