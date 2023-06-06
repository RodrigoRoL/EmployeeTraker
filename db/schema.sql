DROP DATABASE IF EXISTS employeeTracker_db;
CREATE DATABASE employeeTracker_db;
USE employeeTracker_db;

CREATE TABLE departments (
id INT NOT NULL AUTO_INCREMENT,
department_name VARCHAR(30) NOT NULL,
PRIMARY KEY (id)
);

CREATE TABLE roles (
id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
title VARCHAR(50),
department INT,
salary DECIMAL(10),
FOREIGN KEY (department)
REFERENCES departments(id)
ON DELETE SET NULL
);

CREATE TABLE employee (
id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
first_name VARCHAR(50) NOT NULL,
last_name VARCHAR(350) NOT NULL,
role_id INT,
FOREIGN KEY (role_id)
REFERENCES roles(id)
ON DELETE SET NULL,
manager_id INT,
FOREIGN KEY (manager_id)
REFERENCES employee(id)
ON DELETE SET NULL
);