SELECT *
FROM roles as r
JOIN departments as d ON r.department = d.id;

SELECT *
FROM employee as e
JOIN roles as r ON e.role_id = r.id
JOIN departments as d ON r.department = d.id
JOIN employee as em ON e.manager_id = em.id;

 /* seleccionar individualmente los parametros (select em.first_name as manager)