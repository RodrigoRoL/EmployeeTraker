const inquirer = require("inquirer");
const mysql = require("mysql2");
//Creates the connection between SQL
const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'micha1996',
      database: 'employeeTracker_db'
    },
    console.log(`Connected to the employee_db database.`)
    );
// Shows the menu when the user runs the app
const promptUser = () => {
    return inquirer.prompt([
        {
            type: 'list',
            message: "What do you want to do?",
            name: 'selection',
            choices: [
                "View all departments",
                "View all roles",
                "View all employees",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Update an employee role"
            ]
        }
    ])
    .then((data) => {
        switch (data.selection) {
            case "View all departments":
                viewAllDepartments();
                break;

            case "View all roles":
                viewAllRoles();
                break;
                
            case "View all employees":
                viewAllEmployees();
                break;
            
            case "Add a department":
                addDepartment();
                break;
        
            case "Add a role":
                addRole();
                break;
            
            case "Add an employee":
                addEmployee();
                break;
                
            case "Update an employee role":
                updateEmployeeRole();
                break;
        }
    })
};

promptUser();
// Shows the user the departments
const viewAllDepartments = () => {
    db.query(`SELECT * FROM departments`, function (err, results) {
        console.log(`\n`);
        console.table(results);
        promptUser();
    })
}
// Shows the user the roles
const viewAllRoles = () => {
    db.query(`SELECT *
    FROM roles as r
    JOIN departments as d ON r.department = d.id;`, function (err, results) {
        console.log(`\n`);
        console.table(results);
        promptUser();
    })
}
// Shows the user the employees
const viewAllEmployees = () => {
    db.query(`SELECT *
    FROM employee as e
    JOIN roles as r ON e.role_id = r.id
    JOIN departments as d ON r.department = d.id
    JOIN employee as em ON e.manager_id = em.id;`, function (err, results) {
        console.log(`\n`);
        console.table(results);
        promptUser();
    })
}
// Gives the customer the option to create a new department
const addDepartment = () => {
    return inquirer.prompt([
        {
            type: 'input',
            message: "Name of the new department you want to add?",
            name: 'name'
        }
    ])
    .then((data) => {
        db.query(`INSERT INTO departments (department_name) VALUES (?)`, data.name, (err, results) => {
            console.log("\nNew department added. See departments:");
            viewAllDepartments();
        })
    })
}
// Gives the customer the option to create a new role
const addRole = () => {
    let departmentsArray = [];
    db.query(`SELECT * FROM departments`, function (err, results) {
        for (let i = 0; i < results.length; i++) {
            departmentsArray.push(results[i].department_name);
        }
        return inquirer.prompt([
            {
                type: 'input',
                message: "What is the name of the new role?",
                name: 'title',
            },
            {
                type: 'input',
                message: "What is the salary of the new role?",
                name: 'salary',
            },
            {
                type: 'list',
                message: "Which department the role belongs to?",
                name: 'department_name',
                choices: departmentsArray
            }
        ])
        .then((data) => {
            db.query(`SELECT id FROM departments WHERE departments.department_name = ?`, data.department_name, (err, results) => {
                let department = results[0].id;
            db.query(`INSERT INTO roles (title, salary, department)
            VALUES (?,?,?)`, [data.title, data.salary, department], (err, results) => {
                console.log("\nNew role added. See below:");
                viewAllRoles();
            })
            });
        })
    })
}
// Gives the customer the option to add a new employee
const addEmployee = () => {
    const rolesArray= [];
    const employeeArray= [];
    // populates roles array with all roles
    db.query(`SELECT * FROM roles`, function (err, results) {
        for (let i = 0; i < results.length; i++) {
            rolesArray.push(results[i].title);
        }
    // populates employee array with all employees
    db.query(`SELECT * FROM employee`, function (err, results) {
        for (let i = 0; i < results.length; i++) {
            let employeeName = `${results[i].first_name} ${results[i].last_name}`
            employeeArray.push(employeeName);
        }
        return inquirer.prompt([
            {
                type: 'input',
                message: "What is the employee's first name?",
                name: 'first_name',
            },
            {
                type: 'input',
                message: "What is the employee's last name?",
                name: 'last_name',
            },
            {
                type: 'list',
                message: "What is the employee's role?",
                name: 'title',
                choices: rolesArray
            },
            {
                type: 'list',
                message: "Manager?",
                name: 'managers',
                choices: ["Yes", "No"]
            }
        ]).then((data) => {
            let roleName = data.title;
            let first_name = data.first_name;
            let last_name = data.last_name;
            let role_id = '';
            let manager = '';

            db.query(`SELECT id FROM roles WHERE roles.title = ?`, data.title, (err, results) => {
                role_id = results[0].id;
            });
            if (data.managers === "Yes") {
                return inquirer.prompt([
                    {
                    type: 'list',
                    message: "Who is their manager?",
                    name: 'manager',
                    choices: employeeArray
                    }   
                ]).then((data) => {
                
                    db.query(`SELECT id FROM roles WHERE roles.title = ?`, roleName, (err, results) => {
                        role_id = results[0].id;
                    })
                    db.query(`SELECT id FROM employee WHERE employee.first_name = ? AND employee.last_name = ?;`, data.manager.split(" "), (err, results) => {
                        manager = results[0].id;
                        db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                        VALUES (?,?,?,?)`, [first_name, last_name, role_id, manager], (err, results) => {
                            console.log("\nNew employee added. See below:");
                            viewAllEmployees();
                        })
                    })
                })
            } else {
            
                manager = null;
                // get role id
                db.query(`SELECT id FROM roles WHERE roles.title = ?`, roleName, (err, results) => {
                    role_id = results[0].id;
            
                    db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                    VALUES (?,?,?,?)`, [data.first_name, data.last_name, role_id, manager], (err, results) => {
                        console.log("\nNew employee added. See below:");
                        viewAllEmployees();
                    })
                })
            }
        })
    })
})
}


const updateEmployeeRole = () => {
    const rolesArray= [];
    const employeeArray= [];
    db.query(`SELECT * FROM roles`, function (err, results) {
        for (let i = 0; i < results.length; i++) {
            rolesArray.push(results[i].title);
        }
    db.query(`SELECT * FROM employee`, function (err, results) {
        for (let i = 0; i < results.length; i++) {
            let employeeName = `${results[i].first_name} ${results[i].last_name}`
            employeeArray.push(employeeName);
        }
        return inquirer.prompt([
            {
                type: 'list',
                message: "Employee you want to update?",
                name: 'employee',
                choices: employeeArray
            },
            {
                type: 'list',
                message: "What is the employee's new role?",
                name: 'role',
                choices: rolesArray
            },
        ]).then((data) => {
            db.query(`SELECT id FROM roles WHERE roles.title = ?;`, data.role, (err, results) => {
                role_id = results[0].id;
                db.query(`SELECT id FROM employee WHERE employee.first_name = ? AND employee.last_name = ?;`, data.employee.split(" "), (err, results) => {
                    db.query(`UPDATE employee SET role_id = ? WHERE id = ?;`, [role_id, results[0].id], (err, results) => {
                        console.log("\nEmployee role updated. See below:");
                        viewAllEmployees();
                    })
                })

            })
        })
    })
})
}