var formEl = document.querySelector("#task-form");
var pageContentEl = document.querySelector("#page-content");
var tasksToDoEl = document.querySelector("#tasks-to-do");
var tasksInProgressEl = document.querySelector("#tasks-in-progress");
var tasksCompletedEl = document.querySelector("#tasks-completed");
var taskIdCounter = 0;
var tasks = [];

// When "Add Task" (submit) button is clicked taskFormHandler is run
// Gets form values, edit task or create new task createTaskEl()
var taskFormHandler = function(event) {

    // get values from text input and drop down selector
    event.preventDefault();
    var taskNameInput = document.querySelector("input[name='task-name']").value;
    var taskTypeInput = document.querySelector("select[name='task-type']").value;
    
    //check if input values are empty strings
    if (!taskNameInput || !taskTypeInput) {
        alert("You need to fill out the task form!");
        return false;
    }
    
    // reset the form after validation
    formEl.reset();

    // check if form has a data-task-id attribute if true is an edit
    var isEdit = formEl.hasAttribute("data-task-id");
    
    // has data attribute, so get task id and call function to complete edit process
    if (isEdit) {
        var taskId = formEl.getAttribute("data-task-id");
        completeEditTask(taskNameInput, taskTypeInput, taskId);
    }
    // no data attribute, so create object as normal and pass to createTaskEl function
    else {
        var taskDataObj = {
            name: taskNameInput,
            type: taskTypeInput, 
            status: "to do"
        };
    
    createTaskEl(taskDataObj);
    }
};

// create a new "Task To Do" using form values
var createTaskEl = function(taskDataObj) {
    // create list item, assign class name
    var listItemEl = document.createElement("li");
    listItemEl.className = 'task-item';

    console.log(taskDataObj);
    console.log(taskDataObj.status);

    // add task id as a custom attribute
    listItemEl.setAttribute("data-task-id", taskIdCounter);
    listItemEl.setAttribute("draggable", "true");

    // create div to hold task info and add to list item
    var taskInfoEl = document.createElement("div");
    // give it a class name
    taskInfoEl.className = "task-info";
    //add HTML content (task name and  type) to div
    taskInfoEl.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";
 
    listItemEl.appendChild(taskInfoEl);

    taskDataObj.id = taskIdCounter;
    tasks.push(taskDataObj);
    // save tasks to localStorage
    saveTasks();

    // Create Task Item buttons and dropdown - calling createTaskActions
    var taskActionsEl = createTaskActions(taskIdCounter);
    listItemEl.appendChild(taskActionsEl);

    tasksToDoEl.appendChild(listItemEl);
    
    //add entire list item to <ul> list
    tasksToDoEl.appendChild(listItemEl);

    // increase task counter for next unique id
    taskIdCounter++;
};

var completeEditTask = function(taskName, taskType, taskId) {
    // find the matching task list item
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
    // ste new values
    taskSelected.querySelector("h3.task-name").textContent = taskName;
    taskSelected.querySelector("span.task-type").textContent = taskType;

    // loop through tasks array and task object with new content
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(taskId)){
            tasks[i].name = taskName;
            tasks[i].type = taskType;
        }
    };

    alert("Task Updated");

    formEl.removeAttribute("data-task-id");
    document.querySelector("#save-task").textContent = "Add Task";

    // save tasks to localStorage
    saveTasks();
};

var createTaskActions = function(taskId) {
    var actionContainerEl = document.createElement("div");
    actionContainerEl.className = "task-actions";

    // create edit button
    var editButtonEl = document.createElement("button");
    editButtonEl.textContent = "Edit";
    editButtonEl.className = "btn edit-btn";
    editButtonEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(editButtonEl);

    // create delete button
    var deleteButtonEl = document.createElement("button");
    deleteButtonEl.textContent = "Delete";
    deleteButtonEl.className = "btn delete-btn";
    deleteButtonEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(deleteButtonEl);
    
    // create select dropdown
    var statusSelectEl = document.createElement("select");
    statusSelectEl.className = "select-status";
    statusSelectEl.setAttribute("name", "status-change");
    statusSelectEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(statusSelectEl);
    
    // dropdown options array
    var statusChoices = ["To Do", "In Progress", "Completed"];
    
    for (let i = 0; i < statusChoices.length; i++) {
        // create option element
        var statusOptionsEl = document.createElement("option");
        statusOptionsEl.textContent = statusChoices[i];
        statusOptionsEl.setAttribute("value",statusChoices[i]);

        // append to select
        statusSelectEl.appendChild(statusOptionsEl);
    }
    return actionContainerEl;
};

var taskButtonHandler = function(event) {
    // get target element from event
    var targetEl = event.target;

    // when edit button was clicked
    if (targetEl.matches(".edit-btn")) {
        var taskId = targetEl.getAttribute("data-task-id");
        // send taskId to editTask function
        editTask(taskId);
    }
    
    //  when delete button is clicked
    else if (targetEl.matches(".delete-btn")) {
       // get the element's task id
       var taskId = targetEl.getAttribute("data-task-id");
       // send taskId to deletetask()
       deleteTask(taskId);
    }
};

var deleteTask = function(taskId) {
    var taskSelected = document.querySelector(".task-item[data-task-id='" +taskId + "']");
    taskSelected.remove();

    // loop through current tasks
    for (var i = 0; i < tasks.length; i++) {
  
        if (tasks[i].id === parseInt(taskId)) {
            tasks.splice(i,1);
        } 
    }
    // save tasks to localStorage
    saveTasks();
};

var editTask = function(taskId) {
    // get task list item element with passed taskId
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    // get content from task name and type
    var taskName = taskSelected.querySelector("h3.task-name").textContent;
    var taskType = taskSelected.querySelector("span.task-type").textContent;

    // transfer taskName and taskType to form inputs
    document.querySelector("input[name='task-name']").value = taskName;
    document.querySelector("select[name='task-type']").value = taskType;
    // Change "Add Task" button to "Save Task"
    document.querySelector("#save-task").textContent = "Save Task";
    // this sets an attribute to the form itself to use later
    formEl.setAttribute("data-task-id", taskId);

};

var taskStatusChangeHandler = function(event) {
    // get the task item's id
    var taskId = event.target.getAttribute("data-task-id");

    // get the currently selected option's value and convert to lowercase
    var statusValue = event.target.value.toLowerCase();

    // find the parent task item element based on the id
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    if (statusValue === "to do") {
        tasksToDoEl.appendChild(taskSelected);
    }
    else if (statusValue === "in progress") {
        tasksInProgressEl.appendChild(taskSelected);
    }
    else if (statusValue === "completed") {
        tasksCompletedEl.appendChild(taskSelected);
    }

    // update task's in tasks array
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(taskId)){
            tasks[i].status = statusValue;
        }
    }
    // save tasks to localStorage
    saveTasks();
};

var dragTaskHandler = function(event) {
    var taskId = event.target.getAttribute("data-task-id");
    event.dataTransfer.setData("text/plain", taskId);
    var getId = event.dataTransfer.getData("text/plain");
    // save tasks to localStorage
    saveTasks();
};

var dropZoneDragHandler = function(event) {
    var taskListEl = event.target.closest(".task-list");
    if (taskListEl) {
        event.preventDefault();
        taskListEl.setAttribute("style", "background: rgba(68, 233, 255, 0.7); border-style: dashed;");
        //console.dir(taskListEl);
    }
};

var dropTaskHandler = function(event) {
    event.preventDefault();
    var id = event.dataTransfer.getData("text/plain");
    var draggableElement = document.querySelector("[data-task-id='" + id + "']");
    var dropZoneEl = event.target.closest(".task-list");
    var statusType = dropZoneEl.id;
    // set status of task based on dropZone id
    var statusSelectEl = draggableElement.querySelector("select[name='status-change']");
    
    if (statusType === "tasks-to-do") {
        statusSelectEl.selectedIndex = 0;
    }
    else if (statusType === "tasks-in-progress") {
        statusSelectEl.selectedIndex = 1;
    }
    else if (statusType === "tasks-completed") {
        statusSelectEl.selectedIndex = 2;
    }
    dropZoneEl.removeAttribute("style");
    dropZoneEl.appendChild(draggableElement);

    // loop through tasks array to find and update the task's status
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(id)) {
            tasks[i].status = statusSelectEl.value.toLowerCase();
        }
    }
    console.log(tasks);
    
};

var dragLeaveHandler = function(event) {
    var taskListEl = event.target.closest(".task-list");
    if (taskListEl) {
        taskListEl.removeAttribute("style");
    }
};

var saveTasks = function(){
    localStorage.setItem("tasks", JSON.stringify(tasks));
};

var loadTasks = function(){
    // get tasks from localStorage
    tasks = localStorage.getItem("tasks");
    console.log(tasks);

    if (!tasks) {
        tasks = [];
        return false;
    }
    
    // convert stringified tasks into array of objects
    tasks = JSON.parse(tasks);
    // console.log(tasks);
    // create task elements from tasks array
    for (i = 0; i < tasks.length; i++) {
        tasks[i].id = taskIdCounter;
        console.log("Task",tasks[i]);
    
        var listItemEl = document.createElement("li");
        listItemEl.className = 'task-item';
        listItemEl.setAttribute("data-task-id", tasks[i].id);
        listItemEl.setAttribute("draggable", true);
        console.log("List Item",listItemEl);
        
        var taskInfoEl = document.createElement("div");
        taskInfoEl.className = "task-info";
        taskInfoEl.innerHTML = "<h3 class='task-name'>" + tasks[i].name + "</h3>";
        listItemEl.appendChild(taskInfoEl);
        console.log("taskInfoEl", taskInfoEl);
        
        var taskActionsEl = createTaskActions(tasks[i].id);
        listItemEl.appendChild(taskActionsEl);
        console.log("listItemEl with actions", listItemEl);

        if (tasks[i].status === "to do") {
            listItemEl.querySelector("select[name='status-change']").selectedIndex = 0;
            // append listItemEl to tasksToDoEl
            tasksToDoEl.appendChild(listItemEl);
        }

        else if (tasks[i].status === "in progress") {
            listItemEl.querySelector("select[name='status-change']").selectedIndex = 1;
            // append listItemEl to tasksInProgressEl
            tasksInProgressEl.appendChild(listItemEl);
        }
        else if (tasks[i].status === "complete") {
            listItemEl.querySelectorAll("select[name='status-change']").selectedIndex = 2;
            // append listItemEl to tasksCompletedEl
            tasksCompletedEl.appendChild(listItemEl);
        }
        taskIdCounter += 1;
        console.log(listItemEl);

    }
};

formEl.addEventListener("submit", taskFormHandler);
pageContentEl.addEventListener("click", taskButtonHandler);
pageContentEl.addEventListener("change", taskStatusChangeHandler);
pageContentEl.addEventListener("dragstart", dragTaskHandler);
pageContentEl.addEventListener("dragover", dropZoneDragHandler);
pageContentEl.addEventListener("drop", dropTaskHandler);
pageContentEl.addEventListener("dragleave", dragLeaveHandler);
// console.dir(window.document);
loadTasks();