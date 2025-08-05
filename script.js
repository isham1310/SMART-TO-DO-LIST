// Initialize particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

// DOM elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const prioritySelect = document.getElementById('priority-select');
const categorySelect = document.getElementById('category-select');
const dueDateInput = document.getElementById('due-date');
const emptyState = document.getElementById('empty-state');
const filterBtns = document.querySelectorAll('.filter-btn');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Initialize
createParticles();
updateStats();
renderTasks();

// Set default due date to today
dueDateInput.value = new Date().toISOString().split('T')[0];

// Form submission
taskForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const taskText = taskInput.value.trim();
    
    if (taskText !== '') {
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            priority: prioritySelect.value,
            category: categorySelect.value,
            dueDate: dueDateInput.value,
            createdAt: new Date().toISOString()
        };
        
        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        updateStats();
        
        taskInput.value = '';
        taskInput.focus();
    }
});

// Filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        filterBtns.forEach(b => {
            b.classList.remove('active', 'bg-black', 'text-white');
            b.classList.add('bg-gray-200', 'text-gray-700');
        });
        
        this.classList.add('active', 'bg-black', 'text-white');
        this.classList.remove('bg-gray-200', 'text-gray-700');
        
        currentFilter = this.dataset.filter;
        renderTasks();
    });
});

// Task list event delegation
taskList.addEventListener('click', function(event) {
    const clickedElement = event.target;
    
    if (clickedElement.classList.contains('task-text')) {
        const taskId = parseInt(clickedElement.closest('.task-item').dataset.id);
        toggleTask(taskId);
    }
    
    if (clickedElement.classList.contains('delete-btn')) {
        const taskId = parseInt(clickedElement.closest('.task-item').dataset.id);
        deleteTask(taskId);
    }
});

function addTask(text, priority = 'low', category = 'personal', dueDate = '') {
    const newTask = {
        id: Date.now(),
        text: text,
        completed: false,
        priority: priority,
        category: category,
        dueDate: dueDate,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    updateStats();
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
    updateStats();
}

function renderTasks() {
    let filteredTasks = tasks;
    
    // Apply filters
    switch(currentFilter) {
        case 'pending':
            filteredTasks = tasks.filter(t => !t.completed);
            break;
        case 'completed':
            filteredTasks = tasks.filter(t => t.completed);
            break;
        case 'high':
            filteredTasks = tasks.filter(t => t.priority === 'high');
            break;
    }
    
    taskList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item slide-in flex items-center justify-between p-4 rounded-xl shadow-sm transition-all hover:bg-gray-50 priority-${task.priority}`;
        li.dataset.id = task.id;
        
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        
        li.innerHTML = `
            <div class="flex items-center flex-grow">
                <button class="mr-3 w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 border-green-500' : ''}">
                    ${task.completed ? '<i class="fas fa-check text-white text-xs"></i>' : ''}
                </button>
                <div class="flex-grow">
                    <span class="task-text cursor-pointer ${task.completed ? 'completed' : ''} text-gray-700 font-medium">
                        ${task.text}
                    </span>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}">
                            ${getPriorityIcon(task.priority)} ${task.priority}
                        </span>
                        <span class="text-xs px-2 py-1 rounded-full ${getCategoryColor(task.category)}">
                            ${getCategoryIcon(task.category)} ${task.category}
                        </span>
                        ${task.dueDate ? `
                            <span class="text-xs px-2 py-1 rounded-full ${isOverdue ? 'bg-black text-white' : 'bg-gray-600 text-white'}">
                                <i class="fas fa-calendar mr-1"></i>
                                ${formatDate(task.dueDate)}
                                ${isOverdue ? ' (Overdue)' : ''}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
            <button class="delete-btn ml-4 text-red-500 hover:text-red-700 transition-colors">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        taskList.appendChild(li);
    });
}

function getPriorityColor(priority) {
    switch(priority) {
        case 'high': return 'bg-black text-white';
        case 'medium': return 'bg-gray-600 text-white';
        case 'low': return 'bg-gray-300 text-gray-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}

function getPriorityIcon(priority) {
    switch(priority) {
        case 'high': return '🔴';
        case 'medium': return '🟡';
        case 'low': return '🟢';
        default: return '⚪';
    }
}

function getCategoryColor(category) {
    switch(category) {
        case 'work': return 'bg-gray-900 text-white';
        case 'personal': return 'bg-gray-700 text-white';
        case 'shopping': return 'bg-gray-500 text-white';
        case 'health': return 'bg-gray-300 text-gray-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}

function getCategoryIcon(category) {
    switch(category) {
        case 'work': return '💼';
        case 'personal': return '👤';
        case 'shopping': return '🛒';
        case 'health': return '🏥';
        default: return '📝';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });
}

function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    document.getElementById('total-tasks').textContent = totalTasks;
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('pending-tasks').textContent = pendingTasks;
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add some sample tasks on first load
if (tasks.length === 0) {
    addTask('Welcome to your Smart To-Do List!', 'high', 'personal');
    addTask('Click on a task to mark it as complete', 'medium', 'work');
    addTask('Try adding tasks with different priorities and categories', 'low', 'personal');
}

// Additional utility functions
function clearAllTasks() {
    if (confirm('Are you sure you want to delete all tasks?')) {
        tasks = [];
        saveTasks();
        renderTasks();
        updateStats();
    }
}

function exportTasks() {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'todo-tasks.json';
    link.click();
    URL.revokeObjectURL(url);
}

function importTasks(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedTasks = JSON.parse(e.target.result);
                tasks = importedTasks;
                saveTasks();
                renderTasks();
                updateStats();
                alert('Tasks imported successfully!');
            } catch (error) {
                alert('Error importing tasks. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + Enter to add task
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        taskForm.dispatchEvent(new Event('submit'));
    }
    
    // Escape to clear input
    if (event.key === 'Escape') {
        taskInput.value = '';
        taskInput.blur();
    }
}); 