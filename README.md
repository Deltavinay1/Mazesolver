Maze Solver
This project is a web-based, interactive application that generates a random maze and visualizes different pathfinding algorithms as they solve it. It's a direct translation of an original C++ console application into a dynamic and visual experience using HTML, CSS, and JavaScript.

🚀 View the Live Demo Here! 🚀
(Remember to replace the link above with your actual GitHub Pages URL after you set it up!)

## Features
Random Maze Generation: Creates a new, unique maze every time using a depth-first search (recursive backtracking) algorithm.

Three Solving Algorithms: Watch and compare three classic pathfinding algorithms in action:

Dijkstra's Algorithm: The foundational algorithm for finding the shortest path.

A* Search: A smarter, faster version of Dijkstra's that uses heuristics to guide its search.

Wall Follower: A simple but effective method for solving mazes by always keeping one hand on a wall.

Animated Visualization: See the algorithms explore the maze in real-time, highlighting visited cells and the final path.

Responsive Design: The layout adapts to different screen sizes, making it usable on both desktop and mobile devices.

## Screenshots
Here's a glimpse of the maze solver in action:

1. A Freshly Generated Maze

2. A* Algorithm in the Process of Solving

3. The Final Solved Path

## How to Use
Generate a Maze: Click the Generate New Maze button to create a new challenge.

Choose an Algorithm: Click on Dijkstra's, A* Search, or Wall Follower to start the solving animation.

Clear the Path: To try a different algorithm on the same maze, click the Clear Path button.

## Technologies Used
This project was built using standard web technologies:

HTML: Provides the basic structure and content of the application.

CSS: Handles all the styling, layout, and responsive design.

JavaScript (ES6): Powers all the logic, including maze generation, pathfinding algorithms, and DOM manipulation for the visualization.

## Project Structure
The code is organized into three separate files for clarity and maintainability:

index.html: The main HTML file containing the user interface elements.

style.css: The stylesheet for all visual aspects of the application.

script.js: Contains all the functional logic for the maze and the solving algorithms.
