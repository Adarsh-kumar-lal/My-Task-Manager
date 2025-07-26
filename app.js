// Select important DOM elements
const addBtn = document.getElementById("addTask");
const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDate");
const priorityInput = document.getElementById("priority");
const taskList = document.getElementById("taskList");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter");
const darkModeBtn = document.getElementById("toggleDarkMode");

// Function to create a new task list item (li)
function createTaskElement(text, dueDate, priority, isCompleted = false) {
    const li = document.createElement("li");
    li.classList.add(priority); // Add class for priority color (low/medium/high)
    if (isCompleted) {
        li.classList.add("completed");
    }

    const taskDetails = document.createElement("div");
    taskDetails.classList.add("task-details");
    taskDetails.innerHTML = `
        <strong>${text}</strong>
        <div class="task-meta">${dueDate ? "Due: " + dueDate : "No due date"}</div>
    `;

    const actions = document.createElement("div");
    actions.classList.add("actions");

    const editBtn = document.createElement("button");
    editBtn.innerText = "Edit";
    editBtn.classList.add("edit");

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.classList.add("delete");

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(taskDetails);
    li.appendChild(actions);

    return li;
}

// Function to save tasks to Local Storage
function saveTasks() {
    const tasks = [];
    document.querySelectorAll("#taskList li").forEach(li => {
        const text = li.querySelector("strong").innerText;
        const dueDate = li.querySelector(".task-meta").innerText.replace("Due: ", "").replace("No due date", "");
        const priority = li.classList.contains("low") ? "low" :
                         li.classList.contains("medium") ? "medium" : "high";
        const isCompleted = li.classList.contains("completed");
        tasks.push({ text, dueDate, priority, isCompleted });
    });
    localStorage.setItem("todos", JSON.stringify(tasks));
}

// Function to load tasks from Local Storage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("todos") || "[]");
    tasks.forEach(task => {
        const li = createTaskElement(task.text, task.dueDate, task.priority, task.isCompleted);
        taskList.appendChild(li);
    });
}

// Event listener to add a new task
addBtn.addEventListener("click", () => {
    const text = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    const priority = priorityInput.value;

    if (text === "") {
        alert("Task cannot be empty!");
        return;
    }

    const li = createTaskElement(text, dueDate, priority);
    taskList.appendChild(li);

    taskInput.value = "";
    dueDateInput.value = "";
    priorityInput.value = "medium";

    saveTasks(); // Save tasks after adding
});

// Event listener for actions inside the task list (delegation)
taskList.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return; // If click wasn't inside an <li>, do nothing

    // Handle Delete
    if (e.target.classList.contains("delete")) {
        li.remove();
        saveTasks(); // Save tasks after deleting
        return; // Exit to prevent further action on this click
    }

    // Handle Edit
    if (e.target.classList.contains("edit")) {
        const strongElement = li.querySelector("strong");
        const currentText = strongElement.innerText;

        // Replace strong with input field for editing
        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.value = currentText;
        editInput.classList.add("edit-input-field"); // Add a class for potential styling
        strongElement.replaceWith(editInput);
        editInput.focus(); // Focus the input field

        const saveEdit = () => {
            const newText = editInput.value.trim();
            if (newText === "") {
                alert("Task cannot be empty!");
                // Revert to original text if empty
                editInput.replaceWith(strongElement);
                strongElement.innerText = currentText;
            } else {
                strongElement.innerText = newText;
                editInput.replaceWith(strongElement);
                saveTasks(); // Save after editing
            }
        };

        // Save on 'Enter' key press
        editInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                saveEdit();
            }
        });

        // Save when focus is lost (blur)
        editInput.addEventListener("blur", saveEdit);

        return; // Exit to prevent toggle completed
    }

    // Handle marking task as completed (by clicking on the task text area, but not when editing)
    // The check `!li.querySelector('input[type="text"]')` ensures we don't toggle if an edit input is active
    if (e.target.closest(".task-details") && !li.querySelector('input[type="text"]')) {
        li.classList.toggle("completed");
        saveTasks(); // Save tasks after toggling completion
    }
});

// Clear all completed tasks
clearCompletedBtn.addEventListener("click", () => {
    document.querySelectorAll("li.completed").forEach((li) => li.remove());
    saveTasks(); // Save tasks after clearing completed
});

// Filter tasks: All / Active / Completed
filterButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
        // Remove 'active' class from all filter buttons
        filterButtons.forEach(b => b.classList.remove("active"));
        // Add 'active' class to the clicked button
        btn.classList.add("active");

        const filter = btn.dataset.filter;

        document.querySelectorAll("li").forEach((li) => {
            if (filter === "all") {
                li.style.display = "flex";
            } else if (filter === "active") {
                li.style.display = li.classList.contains("completed") ? "none" : "flex";
            } else if (filter === "completed") {
                li.style.display = li.classList.contains("completed") ? "flex" : "none";
            }
        });
    })
);

// Toggle dark mode theme
darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    // Save dark mode preference
    if (document.body.classList.contains("dark")) {
        localStorage.setItem("darkMode", "enabled");
    } else {
        localStorage.setItem("darkMode", "disabled");
    }
});

// On page load
document.addEventListener("DOMContentLoaded", () => {
    loadTasks(); // Load tasks from local storage

    // Apply dark mode preference on load
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark");
    }

    // Set "All" filter button as active by default on load
    document.querySelector('.filter[data-filter="all"]').classList.add('active');
});