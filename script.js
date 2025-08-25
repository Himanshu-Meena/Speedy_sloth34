document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const topicInput = document.getElementById('topic-input');
    const deadlineInput = document.getElementById('deadline-input');
    const addDeadlineBtn = document.getElementById('add-deadline-btn');
    const deadlineList = document.getElementById('deadline-list');
    const addTodayBtn = document.getElementById('add-today-btn');
    const addTomorrowBtn = document.getElementById('add-tomorrow-btn');
    const addWeekBtn = document.getElementById('add-week-btn');
    const addMonthBtn = document.getElementById('add-month-btn');
    const customColorPicker = document.getElementById('custom-color-picker');
    const addSubjectBtn = document.getElementById('add-subject-btn');
    const taskInput = document.getElementById('task-input');
    const subjectSelect = document.getElementById('subject-select');
    const addTaskBtn = document.getElementById('add-task-btn');
    const subjectsContainer = document.getElementById('subjects-container');
    const monthYearDisplay = document.getElementById('month-year-display');
    const calendarDays = document.getElementById('calendar-days');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');

    // --- Predefined Color Palette ---
    const colorPalette = [
        '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', 
        '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff'
    ];

    // --- localStorage Keys ---
    const DEADLINES_KEY = 'studyTracker.deadlines';
    const SUBJECTS_KEY = 'studyTracker.subjects';
    const COMPLETED_DATES_KEY = 'studyTracker.completedDates';

    // --- Data Initialization ---
    let deadlines = JSON.parse(localStorage.getItem(DEADLINES_KEY)) || [];
    let subjects = JSON.parse(localStorage.getItem(SUBJECTS_KEY)) || [{ name: 'General', tasks: [] }];
    let completedDates = JSON.parse(localStorage.getItem(COMPLETED_DATES_KEY)) || [];

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    // --- Save Function ---
    function save() {
        localStorage.setItem(DEADLINES_KEY, JSON.stringify(deadlines));
        localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
        localStorage.setItem(COMPLETED_DATES_KEY, JSON.stringify(completedDates));
    }
    
    // --- Helper Function ---
    function formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // --- Color Picker Functions ---
    function showColorPicker(event, deadlineIndex) {
        customColorPicker.innerHTML = '';
        customColorPicker.style.display = 'grid';
        const rect = event.target.getBoundingClientRect();
        customColorPicker.style.top = `${rect.bottom + window.scrollY + 5}px`;
        customColorPicker.style.left = `${rect.left + window.scrollX}px`;

        colorPalette.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.onclick = () => {
                deadlines[deadlineIndex].color = color;
                save();
                renderAll();
                hideColorPicker();
            };
            customColorPicker.appendChild(swatch);
        });

        // Add a listener to close the picker when clicking outside
        setTimeout(() => {
            document.addEventListener('click', hideColorPicker, { once: true });
        }, 0);
        event.stopPropagation();
    }

    function hideColorPicker(event) {
        if (event && customColorPicker.contains(event.target)) {
            document.addEventListener('click', hideColorPicker, { once: true });
            return;
        }
        customColorPicker.style.display = 'none';
    }
    
    // --- Deadline Functions ---
    function renderDeadlines() {
        deadlineList.innerHTML = '';
        deadlines.forEach((deadline, index) => {
            const li = document.createElement('li');
            const colorCircle = document.createElement('span');
            colorCircle.className = 'deadline-color-circle';
            colorCircle.style.backgroundColor = deadline.color;
            colorCircle.addEventListener('click', (e) => showColorPicker(e, index));
            li.appendChild(colorCircle);

            const textSpan = document.createElement('span');
            textSpan.textContent = `${deadline.topic} - ${deadline.date}`;
            li.appendChild(textSpan);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '✖';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = (e) => { e.stopPropagation(); deleteDeadline(index); };
            li.appendChild(deleteBtn);
            deadlineList.appendChild(li);
        });
    }

    function createAndAddDeadline(topic, dateString) {
        if (topic && dateString) {
            const newColor = colorPalette[deadlines.length % colorPalette.length];
            deadlines.push({ topic, date: dateString, color: newColor });
            deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
            topicInput.value = '';
            deadlineInput.value = '';
            save();
            renderAll();
        } else {
            alert('Please provide a topic and select a date.');
        }
    }

    function addDeadline() {
        createAndAddDeadline(topicInput.value.trim(), deadlineInput.value);
    }
    
    function addQuickDeadline(period) {
        const topic = topicInput.value.trim();
        if (!topic) {
            alert('Please enter a topic first.');
            return;
        }
        const date = new Date();
        if (period === 'tomorrow') date.setDate(date.getDate() + 1);
        else if (period === 'week') date.setDate(date.getDate() + 7);
        else if (period === 'month') date.setMonth(date.getMonth() + 1);
        createAndAddDeadline(topic, formatDate(date));
    }

    function deleteDeadline(index) {
        deadlines.splice(index, 1);
        save();
        renderAll();
    }

    // --- Subject and Task Functions ---
    function renderSubjects() {
        subjectsContainer.innerHTML = '';
        subjectSelect.innerHTML = '';
        if (subjects.length === 0) {
            subjectSelect.innerHTML = '<option disabled>No subjects available</option>';
            return;
        }
        subjects.forEach((subject, subjectIndex) => {
            const option = document.createElement('option');
            option.value = subjectIndex;
            option.textContent = subject.name;
            subjectSelect.appendChild(option);
            const column = document.createElement('div');
            column.className = 'subject-column';
            const header = document.createElement('h3');
            const titleSpan = document.createElement('span');
            titleSpan.textContent = subject.name;
            header.appendChild(titleSpan);
            const deleteSubBtn = document.createElement('button');
            deleteSubBtn.textContent = '🗑️';
            deleteSubBtn.className = 'delete-subject-btn';
            deleteSubBtn.title = `Delete ${subject.name} subject`;
            deleteSubBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${subject.name}"?`)) {
                    deleteSubject(subjectIndex);
                }
            });
            header.appendChild(deleteSubBtn);
            column.appendChild(header);
            const ul = document.createElement('ul');
            subject.tasks.forEach((task, taskIndex) => {
                const li = document.createElement('li');
                if (task.completed) li.classList.add('completed');
                const taskText = document.createElement('span');
                taskText.textContent = task.text;
                li.appendChild(taskText);
                li.addEventListener('click', () => toggleTask(subjectIndex, taskIndex));
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '✖';
                deleteBtn.className = 'delete-btn';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteTask(subjectIndex, taskIndex);
                });
                li.appendChild(deleteBtn);
                ul.appendChild(li);
            });
            column.appendChild(ul);
            subjectsContainer.appendChild(column);
        });
    }

    function addSubject() {
        const name = prompt('Enter the new subject name:');
        if (name && name.trim()) {
            subjects.push({ name: name.trim(), tasks: [] });
            save();
            renderSubjects();
        }
    }
    
    function deleteSubject(subjectIndex) {
        subjects.splice(subjectIndex, 1);
        save();
        renderSubjects();
    }

    function addTask() {
        const text = taskInput.value.trim();
        const subjectIndex = subjectSelect.value;
        if (text && subjectIndex !== null && subjects[subjectIndex]) {
            subjects[subjectIndex].tasks.push({ text, completed: false });
            taskInput.value = '';
            save();
            renderSubjects();
        }
    }

    function deleteTask(subjectIndex, taskIndex) {
        subjects[subjectIndex].tasks.splice(taskIndex, 1);
        save();
        renderSubjects();
    }

    function toggleTask(subjectIndex, taskIndex) {
        const task = subjects[subjectIndex].tasks[taskIndex];
        task.completed = !task.completed;
        const todayString = formatDate(new Date());
        if (task.completed) {
            if (!completedDates.includes(todayString)) completedDates.push(todayString);
        } else {
            const allTasks = subjects.flatMap(s => s.tasks);
            const anyCompletedToday = allTasks.some(t => t.completed && completedDates.includes(todayString));
            if (!anyCompletedToday) {
                const index = completedDates.indexOf(todayString);
                if (index > -1) completedDates.splice(index, 1);
            }
        }
        save();
        renderAll();
    }

    // --- Calendar Functions ---
    function renderCalendar() {
        calendarDays.innerHTML = '';
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        monthYearDisplay.textContent = `${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} ${currentYear}`;

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.appendChild(document.createElement('div')).classList.add('empty-day');
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            const dayNumber = document.createElement('span');
            dayNumber.className = 'date-number';
            dayNumber.textContent = day;
            dayCell.appendChild(dayNumber);

            const cellDate = new Date(currentYear, currentMonth, day);
            cellDate.setHours(0,0,0,0);
            const today = new Date();
            today.setHours(0,0,0,0);

            // --- Border Color Logic ---
            const cellDateString = formatDate(cellDate);
            const hasCompletedTasks = completedDates.includes(cellDateString);

            if (cellDate.getTime() === today.getTime()) {
                dayCell.classList.add('current-day');
                if (hasCompletedTasks) dayCell.classList.add('completed-border');
            } else if (cellDate < today) {
                if (hasCompletedTasks) dayCell.classList.add('completed-border');
                else dayCell.classList.add('missed-border');
            } else { // Future days
                if (hasCompletedTasks) dayCell.classList.add('completed-border');
            }
            if (hasCompletedTasks) dayCell.classList.add('has-completed-tasks');


            // --- Task Line/Dot Logic ---
            const activeTasks = deadlines.filter(d => {
                const deadlineDate = new Date(d.date);
                deadlineDate.setHours(23, 59, 59, 999); 
                return cellDate >= today && cellDate <= deadlineDate;
            });

            if (activeTasks.length > 0) {
                if (activeTasks.length <= 4) {
                    const indicators = document.createElement('div');
                    indicators.className = 'task-indicators';
                    activeTasks.forEach(task => {
                        const line = document.createElement('div');
                        line.className = 'task-line';
                        line.style.backgroundColor = task.color;
                        indicators.appendChild(line);
                    });
                    dayCell.appendChild(indicators);
                } else {
                    const dotContainer = document.createElement('div');
                    dotContainer.className = 'task-dot-container';
                    activeTasks.slice(0, 8).forEach(task => { // Show up to 8 dots
                        const dot = document.createElement('div');
                        dot.className = 'task-dot';
                        dot.style.backgroundColor = task.color;
                        dotContainer.appendChild(dot);
                    });
                    dayCell.appendChild(dotContainer);
                }
            }
            calendarDays.appendChild(dayCell);
        }
    }

    function changeMonth(offset) {
        currentMonth += offset;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; } 
        else if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar();
    }

    function renderAll() {
        renderDeadlines();
        renderSubjects();
        renderCalendar();
    }

    // --- Event Listeners ---
    addDeadlineBtn.addEventListener('click', addDeadline);
    addTodayBtn.addEventListener('click', () => addQuickDeadline('today'));
    addTomorrowBtn.addEventListener('click', () => addQuickDeadline('tomorrow'));
    addWeekBtn.addEventListener('click', () => addQuickDeadline('week'));
    addMonthBtn.addEventListener('click', () => addQuickDeadline('month'));
    addSubjectBtn.addEventListener('click', addSubject);
    addTaskBtn.addEventListener('click', addTask);
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));

    // --- Initial Render ---
    renderAll();
});
