const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Read tasks from JSON file
const readTasks = () => {
    try {
        const tasksData = fs.readFileSync('todo.json', 'utf8');
        return JSON.parse(tasksData);
    } catch (err) {
        console.error('Error reading tasks:', err);
        return [];
    }
};

// Write tasks to JSON file
const writeTasks = (tasks) => {
    try {
        fs.writeFileSync('todo.json', JSON.stringify(tasks, null, 2));
    } catch (err) {
        console.error('Error writing tasks:', err);
    }
};

// Create a new task
app.post('/tasks', (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
    }

    const tasks = readTasks();
    const newTask = {
        id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
        title,
        description,
        status: 'Pending',
    };

    tasks.push(newTask);
    writeTasks(tasks);

    res.json(newTask);
});

// Read a task by ID
app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const tasks = readTasks();

    const task = tasks.find((task) => task.id === taskId);

    if (task) {
        res.json(task);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
});

// Update a task by ID
app.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const { title, description, status } = req.body;

    if (!title && !description && !status) {
        return res.status(400).json({ message: 'At least one field (title, description, status) is required for update' });
    }

    const validStatus = ['Pending', 'In Progress', 'Completed'];

    if (status && !validStatus.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    const tasks = readTasks();
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex !== -1) {
        if (title) tasks[taskIndex].title = title;
        if (description) tasks[taskIndex].description = description;
        if (status) tasks[taskIndex].status = status;

        writeTasks(tasks);
        res.json(tasks[taskIndex]);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
});

// Mark a task as In Progress by ID
app.put('/tasks/:id/inprogress', (req, res) => {
    const taskId = parseInt(req.params.id);

    const tasks = readTasks();
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex !== -1) {
        tasks[taskIndex].status = 'In Progress';
        writeTasks(tasks);
        res.json(tasks[taskIndex]);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
});

// Mark a task as Completed by ID
app.put('/tasks/:id/complete', (req, res) => {
    const taskId = parseInt(req.params.id);

    const tasks = readTasks();
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex !== -1) {
        tasks[taskIndex].status = 'Completed';
        writeTasks(tasks);
        res.json(tasks[taskIndex]);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
});

// List all tasks with optional filtering and sorting
app.get('/tasks', (req, res) => {
    const { status, sort } = req.query;

    let tasks = readTasks();

    // Filter tasks based on status
    if (status) {
        tasks = tasks.filter((task) => task.status === status);
    }

    // Sort tasks
    if (sort === 'asc') {
        tasks.sort((a, b) => a.id - b.id);
    } else if (sort === 'desc') {
        tasks.sort((a, b) => b.id - a.id);
    }

    res.json(tasks);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
