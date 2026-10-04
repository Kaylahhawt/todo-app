// Minimalist and fully functional Todo Web Application
class TodoApp {
  constructor() {
    this.STORAGE_KEY = 'todo_app_tasks';
    this.THEME_KEY = 'todo_app_theme';

    this.tasks = this.loadTasks();
    this.currentFilter = 'all';
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.editingTaskId = null;

    this.cacheDom();
    this.initDate();
    this.initTheme();
    this.bindEvents();
    this.render();
  }

  cacheDom() {
    this.themeToggleBtn = document.getElementById('theme-toggle');
    this.currentDateEl = document.getElementById('current-date');
    this.todoForm = document.getElementById('todo-form');
    this.taskInput = document.getElementById('task-input');
    this.prioritySelect = document.getElementById('priority-select');
    this.categorySelect = document.getElementById('category-select');
    this.dueDateInput = document.getElementById('due-date-input');

    this.searchInput = document.getElementById('search-input');
    this.filterTabs = document.querySelectorAll('.filter-tab');
    this.categoryChips = document.querySelectorAll('.chip');

    this.taskList = document.getElementById('task-list');
    this.emptyState = document.getElementById('empty-state');
    this.progressFill = document.getElementById('progress-fill');
    this.progressText = document.getElementById('progress-text');
    this.itemsLeft = document.getElementById('items-left');
    this.clearCompletedBtn = document.getElementById('clear-completed');

    this.countAll = document.getElementById('count-all');
    this.countActive = document.getElementById('count-active');
    this.countCompleted = document.getElementById('count-completed');
    this.quickDateBtns = document.querySelectorAll('.quick-date-btn');
  }

  initDate() {
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    this.currentDateEl.textContent = new Date().toLocaleDateString(undefined, options);
  }

  initTheme() {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem(this.THEME_KEY, 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem(this.THEME_KEY, 'dark');
    }
  }

  loadTasks() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : this.getDefaultTasks();
    } catch (e) {
      console.error('Failed to load tasks:', e);
      return this.getDefaultTasks();
    }
  }

  getDefaultTasks() {
    return [
      {
        id: '1',
        text: 'Welcome to your new Todo App! ✨',
        priority: 'high',
        category: 'Personal',
        dueDate: '',
        completed: false,
        createdAt: Date.now() - 100000
      },
      {
        id: '2',
        text: 'Click on the checkbox to mark tasks as completed',
        priority: 'normal',
        category: 'Work',
        dueDate: '',
        completed: true,
        createdAt: Date.now() - 50000
      },
      {
        id: '3',
        text: 'Filter tasks by categories, search, or status',
        priority: 'low',
        category: 'Shopping',
        dueDate: '',
        completed: false,
        createdAt: Date.now()
      }
    ];
  }

  saveTasks() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
  }

  bindEvents() {
    this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

    this.todoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTask();
    });

    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.render();
    });

    this.filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        this.filterTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.dataset.filter;
        this.render();
      });
    });

    this.categoryChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        this.categoryChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentCategory = chip.dataset.category;
        this.render();
      });
    });

    this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

    // Quick due-date shortcuts (Today / Tomorrow)
    this.quickDateBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const days = parseInt(btn.dataset.days, 10) || 0;
        const date = new Date();
        date.setDate(date.getDate() + days);
        this.dueDateInput.value = this.toISODate(date);
        this.taskInput.focus();
      });
    });

    // Task list event delegation (toggle, delete, edit)
    this.taskList.addEventListener('click', (e) => {
      const target = e.target;
      const taskItem = target.closest('.task-item');
      if (!taskItem) return;
      const id = taskItem.dataset.id;

      if (target.classList.contains('custom-checkbox')) {
        this.toggleTask(id);
      } else if (target.closest('.delete-btn')) {
        this.deleteTask(id);
      } else if (target.closest('.edit-btn')) {
        this.startEditTask(id);
      }
    });

    // Double-click to edit task text
    this.taskList.addEventListener('dblclick', (e) => {
      const textEl = e.target.closest('.task-text');
      if (!textEl) return;
      const taskItem = textEl.closest('.task-item');
      if (taskItem) {
        this.startEditTask(taskItem.dataset.id);
      }
    });
  }

  addTask() {
    const text = this.taskInput.value.trim();
    if (!text) return;

    const newTask = {
      id: Date.now().toString(),
      text,
      priority: this.prioritySelect.value,
      category: this.categorySelect.value,
      dueDate: this.dueDateInput.value,
      completed: false,
      createdAt: Date.now()
    };

    this.tasks.unshift(newTask);
    this.saveTasks();

    this.taskInput.value = '';
    this.dueDateInput.value = '';
    this.prioritySelect.value = 'normal';
    this.categorySelect.value = 'Personal';

    this.render();
    this.taskInput.focus();
  }

  toggleTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    this.saveTasks();
    this.render();

    if (task.completed) {
      const allDone = this.tasks.length > 0 && this.tasks.every((t) => t.completed);
      this.celebrate(allDone);
    }
  }

  celebrate(allDone) {
    if (typeof window.confetti !== 'function') return;
    const prefersReduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const colors = ['#6d5efc', '#a855f7', '#22d3ee', '#10b981', '#f59e0b'];

    if (allDone) {
      // Longer celebration when every task is complete.
      const end = Date.now() + 1200;
      const frame = () => {
        window.confetti({
          particleCount: 6,
          spread: 70,
          startVelocity: 45,
          origin: { y: 0.7 },
          colors
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    } else {
      window.confetti({
        particleCount: 60,
        spread: 62,
        startVelocity: 38,
        origin: { y: 0.7 },
        colors
      });
    }
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.saveTasks();
    this.render();
  }

  startEditTask(id) {
    this.editingTaskId = id;
    this.render();
    const editInput = this.taskList.querySelector(`[data-edit-id="${id}"]`);
    if (editInput) {
      editInput.focus();
      editInput.select();
    }
  }

  finishEditTask(id, newText) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      const trimmed = newText.trim();
      if (trimmed) {
        task.text = trimmed;
      } else {
        this.tasks = this.tasks.filter((t) => t.id !== id);
      }
      this.saveTasks();
    }
    this.editingTaskId = null;
    this.render();
  }

  cancelEditTask() {
    this.editingTaskId = null;
    this.render();
  }

  clearCompleted() {
    const prevCount = this.tasks.length;
    this.tasks = this.tasks.filter((t) => !t.completed);
    if (this.tasks.length !== prevCount) {
      this.saveTasks();
      this.render();
    }
  }

  getFilteredTasks() {
    return this.tasks.filter((task) => {
      if (this.currentFilter === 'active' && task.completed) return false;
      if (this.currentFilter === 'completed' && !task.completed) return false;
      if (this.currentCategory !== 'all' && task.category !== this.currentCategory) return false;
      if (this.searchQuery && !task.text.toLowerCase().includes(this.searchQuery)) return false;
      return true;
    });
  }

  escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  toISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  categoryEmoji(category) {
    const map = {
      Personal: '🟣',
      Work: '🔵',
      Shopping: '🟠',
      Health: '🟢',
      Other: '⚪'
    };
    return map[category] || '⚪';
  }

  getDueMeta(dueDate, completed) {
    if (!dueDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate + 'T00:00:00');
    const diffDays = Math.round((due - today) / 86400000);

    if (!completed) {
      if (diffDays < 0) return { cls: 'overdue', label: `${this.formatDate(dueDate)} • Overdue` };
      if (diffDays === 0) return { cls: 'due-today', label: 'Today' };
      if (diffDays === 1) return { cls: 'due-soon', label: 'Tomorrow' };
      if (diffDays <= 7) return { cls: 'due-soon', label: this.formatDate(dueDate) };
    } else if (diffDays === 0) {
      return { cls: '', label: 'Today' };
    }

    return { cls: '', label: this.formatDate(dueDate) };
  }

  render() {
    const filteredTasks = this.getFilteredTasks();
    this.taskList.innerHTML = '';

    if (filteredTasks.length === 0) {
      this.emptyState.classList.remove('hidden');
    } else {
      this.emptyState.classList.add('hidden');

      filteredTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        const isEditing = this.editingTaskId === task.id;
        const due = this.getDueMeta(task.dueDate, task.completed);

        if (isEditing) {
          li.innerHTML = `
            <div class="task-left" style="width: 100%;">
              <input
                type="text"
                class="task-edit-input"
                data-edit-id="${task.id}"
                value="${this.escapeHTML(task.text)}"
              />
            </div>
            <div class="task-actions">
              <button class="action-btn save-edit-btn" title="Save">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </div>
          `;

          const input = li.querySelector('.task-edit-input');
          const saveBtn = li.querySelector('.save-edit-btn');

          const submitEdit = () => this.finishEditTask(task.id, input.value);
          saveBtn.addEventListener('click', submitEdit);

          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              submitEdit();
            } else if (e.key === 'Escape') {
              this.cancelEditTask();
            }
          });

          input.addEventListener('blur', () => {
            setTimeout(() => {
              if (this.editingTaskId === task.id) {
                submitEdit();
              }
            }, 150);
          });
        } else {
          li.innerHTML = `
            <div class="task-left">
              <input
                type="checkbox"
                class="custom-checkbox"
                ${task.completed ? 'checked' : ''}
                aria-label="Mark task done"
              />
              <div class="task-content">
                <span class="task-text">${this.escapeHTML(task.text)}</span>
                <div class="task-badges">
                  <span class="badge badge-priority-${task.priority}">${task.priority}</span>
                  ${task.category ? `<span class="badge badge-category cat-${task.category.toLowerCase()}">${this.categoryEmoji(task.category)} ${this.escapeHTML(task.category)}</span>` : ''}
                  ${due ? `
                    <span class="badge badge-due ${due.cls}">
                      📅 ${due.label}
                    </span>
                  ` : ''}
                </div>
              </div>
            </div>
            <div class="task-actions">
              <button class="action-btn edit-btn" title="Edit task" aria-label="Edit task">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </button>
              <button class="action-btn delete-btn" title="Delete task" aria-label="Delete task">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          `;
        }

        this.taskList.appendChild(li);
      });
    }

    this.updateStats();
  }

  updateStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.completed).length;
    const active = total - completed;

    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    this.progressFill.style.width = `${percentage}%`;
    this.progressText.textContent = `${completed}/${total} completed (${percentage}%)`;
    this.itemsLeft.textContent = `${active} ${active === 1 ? 'task' : 'tasks'} remaining`;

    if (this.countAll) this.countAll.textContent = total;
    if (this.countActive) this.countActive.textContent = active;
    if (this.countCompleted) this.countCompleted.textContent = completed;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TodoApp();
});

