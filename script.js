/* =========================================================
   TASKFLOW - TO DO LIST
   JAVASCRIPT
========================================================= */


/* ================= ELEMENTS ================= */

const taskForm = document.getElementById("task-form");

const taskTitle = document.getElementById("task-title");
const taskCategory = document.getElementById("task-category");
const taskPriority = document.getElementById("task-priority");
const taskDate = document.getElementById("task-date");

const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");

const searchInput = document.getElementById("search-input");

const statusFilter = document.getElementById("status-filter");
const categoryFilter = document.getElementById("category-filter");

const totalCount = document.getElementById("total-count");
const pendingCount = document.getElementById("pending-count");
const completedCount = document.getElementById("completed-count");

const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");

const formTitle = document.getElementById("form-title");

const titleError = document.getElementById("title-error");

const themeBtn = document.getElementById("theme-btn");


/* ================= DATA ================= */

let tasks = JSON.parse(
    localStorage.getItem("taskflowTasks")
) || [];

let editTaskId = null;


/* ================= INITIAL LOAD ================= */

document.addEventListener("DOMContentLoaded", () => {

    loadTheme();

    renderTasks();

});


/* ================= SAVE TASKS ================= */

function saveTasks() {

    localStorage.setItem(
        "taskflowTasks",
        JSON.stringify(tasks)
    );

}


/* ================= ADD / EDIT TASK ================= */

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();


    /* Validation */

    const title = taskTitle.value.trim();


    if (title === "") {

        titleError.textContent =
            "Please enter a task title.";

        taskTitle.focus();

        return;

    }


    if (title.length < 3) {

        titleError.textContent =
            "Task title must contain at least 3 characters.";

        taskTitle.focus();

        return;

    }


    titleError.textContent = "";


    /* ================= EDIT ================= */

    if (editTaskId !== null) {

        const task = tasks.find(
            task => task.id === editTaskId
        );


        if (task) {

            task.title = title;

            task.category = taskCategory.value;

            task.priority = taskPriority.value;

            task.dueDate = taskDate.value;

        }


        editTaskId = null;

        submitBtn.innerHTML =
            '<i class="fa-solid fa-plus"></i> Add Task';

        formTitle.textContent = "Add New Task";

        cancelBtn.hidden = true;

    }


    /* ================= ADD ================= */

    else {

        const newTask = {

            id: Date.now(),

            title: title,

            category: taskCategory.value,

            priority: taskPriority.value,

            dueDate: taskDate.value,

            completed: false,

            createdAt: new Date().toISOString()

        };


        tasks.unshift(newTask);

    }


    saveTasks();

    renderTasks();

    taskForm.reset();

    taskPriority.value = "Medium";

});


/* ================= VALIDATION CLEAR ================= */

taskTitle.addEventListener("input", () => {

    titleError.textContent = "";

});


/* ================= RENDER TASKS ================= */

function renderTasks() {

    const searchText =
        searchInput.value.toLowerCase().trim();

    const selectedStatus =
        statusFilter.value;

    const selectedCategory =
        categoryFilter.value;


    /* Filter tasks */

    const filteredTasks = tasks.filter(task => {

        const matchesSearch =
            task.title
                .toLowerCase()
                .includes(searchText);


        const matchesStatus =
            selectedStatus === "all" ||
            (selectedStatus === "completed" && task.completed) ||
            (selectedStatus === "pending" && !task.completed);


        const matchesCategory =
            selectedCategory === "all" ||
            task.category === selectedCategory;


        return (
            matchesSearch &&
            matchesStatus &&
            matchesCategory
        );

    });


    /* Clear old list */

    taskList.innerHTML = "";


    /* Empty state */

    if (filteredTasks.length === 0) {

        emptyState.style.display = "block";

    }

    else {

        emptyState.style.display = "none";

    }


    /* Create task cards */

    filteredTasks.forEach(task => {

        const card = createTaskCard(task);

        taskList.appendChild(card);

    });


    updateStatistics();

}


/* ================= CREATE TASK CARD ================= */

function createTaskCard(task) {

    const card = document.createElement("div");

    card.className =
        `task-card ${task.completed ? "completed" : ""}`;


    /* Check button */

    const checkButton =
        document.createElement("button");

    checkButton.className = "task-check";

    checkButton.title =
        task.completed
            ? "Mark as pending"
            : "Mark as completed";

    if (task.completed) {

        checkButton.innerHTML =
            '<i class="fa-solid fa-check"></i>';

    }


    checkButton.addEventListener(
        "click",
        () => toggleTask(task.id)
    );


    /* Content */

    const content =
        document.createElement("div");

    content.className = "task-content";


    const title =
        document.createElement("h3");

    title.textContent = task.title;


    const meta =
        document.createElement("div");

    meta.className = "task-meta";


    /* Category */

    const category =
        document.createElement("span");

    category.className =
        "badge category-badge";

    category.textContent =
        task.category;


    /* Priority */

    const priority =
        document.createElement("span");

    priority.className =
        `badge priority-${task.priority.toLowerCase()}`;

    priority.textContent =
        `${task.priority} Priority`;


    meta.appendChild(category);

    meta.appendChild(priority);


    /* Due date */

    if (task.dueDate) {

        const date =
            document.createElement("span");

        date.className = "due-date";

        date.innerHTML =
            `<i class="fa-regular fa-calendar"></i>
             ${formatDate(task.dueDate)}`;

        meta.appendChild(date);

    }


    content.appendChild(title);

    content.appendChild(meta);


    /* Actions */

    const actions =
        document.createElement("div");

    actions.className = "task-actions";


    /* Edit */

    const editButton =
        document.createElement("button");

    editButton.className =
        "action-btn edit-btn";

    editButton.title = "Edit task";

    editButton.innerHTML =
        '<i class="fa-solid fa-pen"></i>';

    editButton.addEventListener(
        "click",
        () => editTask(task.id)
    );


    /* Delete */

    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "action-btn delete-btn";

    deleteButton.title = "Delete task";

    deleteButton.innerHTML =
        '<i class="fa-solid fa-trash"></i>';

    deleteButton.addEventListener(
        "click",
        () => deleteTask(task.id)
    );


    actions.appendChild(editButton);

    actions.appendChild(deleteButton);


    card.appendChild(checkButton);

    card.appendChild(content);

    card.appendChild(actions);


    return card;

}


/* ================= TOGGLE TASK ================= */

function toggleTask(id) {

    const task =
        tasks.find(task => task.id === id);


    if (!task) return;


    task.completed =
        !task.completed;


    saveTasks();

    renderTasks();

}


/* ================= EDIT TASK ================= */

function editTask(id) {

    const task =
        tasks.find(task => task.id === id);


    if (!task) return;


    editTaskId = id;


    taskTitle.value =
        task.title;

    taskCategory.value =
        task.category;

    taskPriority.value =
        task.priority;

    taskDate.value =
        task.dueDate || "";


    formTitle.textContent =
        "Edit Task";


    submitBtn.innerHTML =
        '<i class="fa-solid fa-save"></i> Update Task';


    cancelBtn.hidden = false;


    document.querySelector(".task-form-card")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    taskTitle.focus();

}


/* ================= CANCEL EDIT ================= */

cancelBtn.addEventListener("click", () => {

    editTaskId = null;

    taskForm.reset();

    taskPriority.value = "Medium";

    formTitle.textContent =
        "Add New Task";

    submitBtn.innerHTML =
        '<i class="fa-solid fa-plus"></i> Add Task';

    cancelBtn.hidden = true;

    titleError.textContent = "";

});


/* ================= DELETE TASK ================= */

function deleteTask(id) {

    const task =
        tasks.find(task => task.id === id);


    if (!task) return;


    const confirmed =
        confirm(
            `Are you sure you want to delete "${task.title}"?`
        );


    if (!confirmed) return;


    tasks =
        tasks.filter(
            task => task.id !== id
        );


    saveTasks();

    renderTasks();

}


/* ================= FORMAT DATE ================= */

function formatDate(dateString) {

    const date =
        new Date(dateString + "T00:00:00");


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* ================= STATISTICS ================= */

function updateStatistics() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const pending =
        total - completed;


    totalCount.textContent =
        total;

    completedCount.textContent =
        completed;

    pendingCount.textContent =
        pending;

}


/* ================= SEARCH ================= */

searchInput.addEventListener(
    "input",
    renderTasks
);


/* ================= FILTERS ================= */

statusFilter.addEventListener(
    "change",
    renderTasks
);


categoryFilter.addEventListener(
    "change",
    renderTasks
);


/* ================= DARK MODE ================= */

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle(
        "dark-mode"
    );


    const darkMode =
        document.body.classList.contains(
            "dark-mode"
        );


    localStorage.setItem(
        "taskflowDarkMode",
        darkMode
    );


    updateThemeIcon();

});


/* ================= LOAD THEME ================= */

function loadTheme() {

    const darkMode =
        localStorage.getItem(
            "taskflowDarkMode"
        );


    if (darkMode === "true") {

        document.body.classList.add(
            "dark-mode"
        );

    }


    updateThemeIcon();

}


/* ================= THEME ICON ================= */

function updateThemeIcon() {

    const isDark =
        document.body.classList.contains(
            "dark-mode"
        );


    themeBtn.innerHTML =
        isDark
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';

}