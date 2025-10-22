// Wait for the DOM to fully load before running the script
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const taskList = document.getElementById('task-list');
    const noDateList = document.getElementById('no-date-list');
    const noDateSection = document.getElementById('no-date-tasks');
    const filteredList = document.getElementById('filtered-list');
    const filteredTitle = document.getElementById('filtered-title');
    const showAllBtn = document.getElementById('show-all-btn');
    const newTaskInput = document.getElementById('new-task-input');
    const newTaskDate = document.getElementById('new-task-date');
    const addTaskBtn = document.getElementById('add-task-btn');
    const listViewBtn = document.getElementById('list-view-btn');
    const calendarViewBtn = document.getElementById('calendar-view-btn');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const currentMonthEl = document.getElementById('current-month');
    const calendarGrid = document.querySelector('.calendar-grid');
    const listView = document.getElementById('list-view');
    const calendarView = document.getElementById('calendar-view');

    // Initial sample tasks with example due dates (for demo; will be overridden by localStorage if present)
    let tasks = [
        { text: 'Buy groceries', completed: false, dueDate: null },
        { text: 'Finish work report', completed: true, dueDate: '2023-10-15' }, // Past (overdue example)
        { text: 'Exercise for 30 minutes', completed: false, dueDate: new Date().toISOString().split('T')[0] }, // Today
        { text: 'Call a friend', completed: false, dueDate: null },
        { text: 'Read a book chapter', completed: false, dueDate: '2023-10-20' } // Future
    ];

    // Load tasks from localStorage if available
    const savedTasks = localStorage.getItem('todoTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }

    let currentDate = new Date(); // For calendar: current month/year
    let selectedDate = null; // For filtering in calendar view
    let isCalendarFiltered = false;

    // Utility Functions
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function isOverdue(task) {
        if (!task.dueDate || task.completed) return false;
        const due = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day
        return due < today;
    }

    function getTasksForDate(dateStr) {
        if (!dateStr) return [];
        return tasks.filter(task => task.dueDate === dateStr && !task.completed);
    }

    function saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
    }

    // Render List View
    function renderListView() {
        // Clear lists
        taskList.innerHTML = '';
        noDateList.innerHTML = '';

        // Separate dated and no-date tasks
        const datedTasks = tasks.filter(task => task.dueDate !== null);
        const noDateTasks = tasks.filter(task => task.dueDate === null);

        // Render dated tasks
        datedTasks.forEach((task, index) => {
            const globalIndex = tasks.indexOf(task); // Get original index for updates
            const li = document.createElement('li');
            if (task.completed) li.classList.add('completed');
            if (isOverdue(task)) li.classList.add('overdue');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => {
                tasks[globalIndex].completed = checkbox.checked;
                li.classList.toggle('completed', checkbox.checked);
                li.classList.toggle('overdue', isOverdue(tasks[globalIndex]));
                saveTasks();
                renderListView(); // Re-render to update sections
            });

            const taskText = document.createElement('span');
            taskText.classList.add('task-text');
            taskText.textContent = task.text;

            const dueDateSpan = document.createElement('span');
            dueDateSpan.classList.add('due-date');
            dueDateSpan.textContent = formatDate(task.dueDate);

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = '×';
            deleteBtn.addEventListener('click', () => {
                tasks.splice(globalIndex, 1);
                saveTasks();
                renderListView();
            });

            li.appendChild(checkbox);
            li.appendChild(taskText);
            li.appendChild(dueDateSpan);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });

        // Render no-date tasks
        noDateTasks.forEach((task, index) => {
            const globalIndex = tasks.indexOf(task);
            const li = document.createElement('li');
            if (task.completed) li.classList.add('completed');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => {
                tasks[globalIndex].completed = checkbox.checked;
                li.classList.toggle('completed', checkbox.checked);
                saveTasks();
                renderListView();
            });

            const taskText = document.createElement('span');
            taskText.classList.add('task-text');
            taskText.textContent = task.text;

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = '×';
            deleteBtn.addEventListener('click', () => {
                tasks.splice(globalIndex, 1);
                saveTasks();
                renderListView();
            });

            li.appendChild(checkbox);
            li.appendChild(taskText);
            li.appendChild(deleteBtn);
            noDateList.appendChild(li);
        });

        // Show/hide no-date section
        noDateSection.style.display = noDateTasks.length > 0 ? 'block' : 'none';
    }

    // Render Calendar View
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        currentMonthEl.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        // Clear existing days
        const existingDays = calendarGrid.querySelectorAll('.calendar-day');
        existingDays.forEach(day => day.remove());

        // Get first day of month and days in month
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Padding days (previous month)
        for (let i = 0; i < firstDay; i++) {
            const day = document.createElement('div');
            day.classList.add('calendar-day', 'other-month');
            day.textContent = '';
            calendarGrid.appendChild(day);
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEl = document.createElement('div');
            dayEl.classList.add('calendar-day');

            const dayNum = document.createElement('div');
            dayNum.classList.add('day-number');
            dayNum.textContent = day;
            dayEl.appendChild(dayNum);

            // Check for tasks on this day
            const dayTasks = getTasksForDate(dateStr);
            if (dayTasks.length > 0) {
                dayEl.classList.add('has-tasks');
                if (isOverdue(dayTasks[0])) { // Use first task's overdue status as indicator
                    dayEl.classList.add('overdue');
                }

                const taskCount = document.createElement('div');
                taskCount.classList.add('task-count');
                taskCount.textContent = dayTasks.length;
                dayEl.appendChild(taskCount);
            }

            // Highlight today
            if (dateStr === todayStr) {
                dayEl.classList.add('today');
            }

            // Click to filter
            dayEl.addEventListener('click', () => {
                if (dayTasks.length === 0) return;
                selectedDate = dateStr;
                isCalendarFiltered = true;
                showAllBtn.style.display = 'inline-block';
                filteredTitle.textContent = `Tasks for ${formatDate(dateStr)}`;
                renderFilteredTasks(dateStr);
            });

            calendarGrid.appendChild(dayEl);
        }

        // Padding days (next month) to fill grid (up to 42 cells total for 6 weeks)
        const totalCells = firstDay + daysInMonth;
        for (let i = totalCells; i < 42; i++) {
            const day = document.createElement('div');
            day.classList.add('calendar-day', 'other-month');
            day.textContent = '';
            calendarGrid.appendChild(day);
        }

        // Render all or filtered tasks
        if (isCalendarFiltered) {
            renderFilteredTasks(selectedDate);
        } else {
            renderFilteredTasks(); // Show all
            filteredTitle.textContent = 'All Tasks';
            showAllBtn.style.display = 'none';
        }
    }

    function renderFilteredTasks(dateStr = null) {
        filteredList.innerHTML = '';
        let filteredTasks = tasks;

        if (dateStr) {
            filteredTasks = getTasksForDate(dateStr);
        }

        filteredTasks.forEach((task, index) => {
            const globalIndex = tasks.indexOf(task);
            const li = document.createElement('li');
            if (task.completed) li.classList.add('completed');
            if (isOverdue(task)) li.classList.add('overdue');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => {
                tasks[globalIndex].completed = checkbox.checked;
                li.classList.toggle('completed', checkbox.checked);
                li.classList.toggle('overdue', isOverdue(tasks[globalIndex]));
                saveTasks();
                renderFilteredTasks(dateStr);
                renderCalendar(); // Update calendar highlights
            });

            const taskText = document.createElement('span');
            taskText.classList.add('task-text');
            taskText.textContent = task.text;

            const dueDateSpan = document.createElement('span');
            dueDateSpan.classList.add('due-date');
            dueDateSpan.textContent = formatDate(task.dueDate);

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = '×';
            deleteBtn.addEventListener('click', () => {
                tasks.splice(globalIndex, 1);
                saveTasks();
                renderFilteredTasks(dateStr);
                renderCalendar();
                renderListView();
            });

            li.appendChild(checkbox);
            li.appendChild(taskText);
            li.appendChild(dueDateSpan);
            li.appendChild(deleteBtn);
            filteredList.appendChild(li);
        });
    }

    // Add New Task
    function addTask() {
        const text = newTaskInput.value.trim();
        if (text === '') {
            alert('Please enter a task!');
            return;
        }

        const dueDate = newTaskDate.value || null;
        tasks.push({ text, completed: false, dueDate });

        newTaskInput.value = '';
        newTaskDate.value = '';

        saveTasks();
        renderListView();
        renderCalendar();
    }

    // View Toggle
    function switchToListView() {
        listView.classList.add('active');
        calendarView.classList.remove('active');
        listViewBtn.classList.add('active');
        calendarViewBtn.classList.remove('active');
        isCalendarFiltered = false;
        renderListView();
    }

    function switchToCalendarView() {
        calendarView.classList.add('active');
        listView.classList.remove('active');
        calendarViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        renderCalendar();
    }

    // Month Navigation
    function prevMonth() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    }

    function nextMonth() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    }

    function showAllTasks() {
        isCalendarFiltered = false;
        selectedDate = null;
        showAllBtn.style.display = 'none';
        filteredTitle.textContent = 'All Tasks';
        renderFilteredTasks();
    }

    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    newTaskDate.addEventListener('change', () => {}); // Optional: Auto-add on date select, but keep manual

    listViewBtn.addEventListener('click', switchToListView);
    calendarViewBtn.addEventListener('click', switchToCalendarView);

    prevMonthBtn.addEventListener('click', prevMonth);
    nextMonthBtn.addEventListener('click', nextMonth);
    showAllBtn.addEventListener('click', showAllTasks);

    // Initial Render (starts in List View)
    renderListView();

});
