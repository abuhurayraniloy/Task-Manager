const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Read tasks from JSON file
const readTasks = () => {
    const tasksData = fs.readFileSync('todo.json', 'utf8');
    return JSON.parse(tasksData);
};

// Write tasks to JSON file
const writeTasks = (tasks) => {
    fs.writeFileSync('todo.json', JSON.stringify(tasks, null, 2));
};

// Create a new task
app.post('/tasks', (req, res) => {
    const { title, description } = req.body;

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

    const validStatus = ['Pending', 'In Progress', 'Completed'];

    if (!validStatus.includes(status)) {
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

// Delete a task by ID
app.delete('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);

    const tasks = readTasks();
    const updatedTasks = tasks.filter((task) => task.id !== taskId);

    if (updatedTasks.length !== tasks.length) {
        writeTasks(updatedTasks);
        res.json({ message: 'Task deleted successfully' });
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
});

// List all tasks
app.get('/tasks', (req, res) => {
    const tasks = readTasks();
    res.json(tasks);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});