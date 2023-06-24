/**
  You need to create an express HTTP server in Node.js which will handle the logic of a todo list app.
  - Don't use any database, just store all the data in an array to store the todo list data (in-memory)
  - Hard todo: Try to save responses in files, so that even if u exit the app and run it again, the data remains (similar to databases)

  Each todo has a title and a description. The title is a string and the description is a string.
  Each todo should also get an unique autogenerated id every time it is created
  The expected API endpoints are defined below,
  1.GET /todos - Retrieve all todo items
	Description: Returns a list of all todo items.
	Response: 200 OK with an array of todo items in JSON format.
	Example: GET http://localhost:3000/todos
    
  2.GET /todos/:id - Retrieve a specific todo item by ID
	Description: Returns a specific todo item identified by its ID.
	Response: 200 OK with the todo item in JSON format if found, or 404 Not Found if not found.
	Example: GET http://localhost:3000/todos/123
    
  3. POST /todos - Create a new todo item
	Description: Creates a new todo item.
	Request Body: JSON object representing the todo item.
	Response: 201 Created with the ID of the created todo item in JSON format. eg: {id: 1}
	Example: POST http://localhost:3000/todos
	Request Body: { "title": "Buy groceries", "completed": false, description: "I should buy groceries" }
    
  4. PUT /todos/:id - Update an existing todo item by ID
	Description: Updates an existing todo item identified by its ID.
	Request Body: JSON object representing the updated todo item.
	Response: 200 OK if the todo item was found and updated, or 404 Not Found if not found.
	Example: PUT http://localhost:3000/todos/123
	Request Body: { "title": "Buy groceries", "completed": true }
    
  5. DELETE /todos/:id - Delete a todo item by ID
	Description: Deletes a todo item identified by its ID.
	Response: 200 OK if the todo item was found and deleted, or 404 Not Found if not found.
	Example: DELETE http://localhost:3000/todos/123

	- For any other route not defined in the server return 404

  Testing the server - run `npm run test-todoServer` command in terminal
 */
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

app.use(bodyParser.json());

// Array to store the todo list data
let todos = [];


function saveTodosToFile() {
	fs.writeFile('todos.json', JSON.stringify(todos), (err) => {
		if (err) {
			console.error('Error saving todos to file:', err);
		} else {
			console.log('Todos saved to file.');
		}
	});
}

// Helper function to load todos from file
function loadTodosFromFile() {
	try {
		const data = fs.readFileSync('todos.json', 'utf8');
		todos = JSON.parse(data);
		console.log('Todos loaded from file.');
	} catch (err) {
		console.error('Error loading todos from file:', err);
	}
}

// Load todos from file on server startup
loadTodosFromFile();

// Middleware to handle saving todos to file after each request
app.use((req, res, next) => {
	res.on('finish', () => {
		saveTodosToFile();
	});
	next();
});

// GET /todos - Retrieve all todo items
app.get('/todos', (req, res) => {
	res.json(todos);
});

// GET /todos/:id - Retrieve a specific todo item by ID
app.get('/todos/:id', (req, res) => {
	const todoId = req.params.id;
	const todo = todos.find((todo) => todo.id === parseInt(todoId));
	if (todo) {
		res.json(todo);
	} else {
		res.status(404).json({ error: 'Todo not found' });
	}
});

// POST /todos - Create a new todo item
app.post('/todos', (req, res) => {
	const { title, description } = req.body;
	const id = todos.length + 1;
	const todo = { id, title, description };
	todos.push(todo);
	res.status(201).json({ id });
});

// PUT /todos/:id - Update an existing todo item by ID
app.put('/todos/:id', (req, res) => {
	const todoId = req.params.id;
	const { title, description } = req.body;
	const todo = todos.find((todo) => todo.id === parseInt(todoId));
	if (todo) {
		todo.title = title || todo.title;
		todo.description = description || todo.description;
		res.json(todo);
	} else {
		res.status(404).json({ error: 'Todo not found' });
	}
});

// DELETE /todos/:id - Delete a todo item by ID
app.delete('/todos/:id', (req, res) => {
	const todoId = req.params.id;
	const index = todos.findIndex((todo) => todo.id === parseInt(todoId));
	if (index !== -1) {
		const deletedTodo = todos.splice(index, 1);
		res.json(deletedTodo[0]);
	} else {
		res.status(404).json({ error: 'Todo not found' });
	}
});

// Handle 404 - Route not found
app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

module.exports = app;

