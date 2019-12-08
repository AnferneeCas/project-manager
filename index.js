const express = require('express'),
    app = express(),
    mysql = require('mysql'),
    connection = mysql.createConnection({
        host: 'anfer2325.cpqgjl5d66m6.us-east-2.rds.amazonaws.com',
        user: 'admin',
        password: 'anfer2325',
        port: '3306',
        database: 'ebdb'
    }),
    util = require('util')

connection.connect(async (err) => {
    if (err)
        console.log(err)
    else
        console.log('Connected')
})

connection.query = util.promisify(connection.query);






// This is an insert template for the Project table
// INSERT INTO ebdb.Project (Project_State, Project_DataBase, FrontEnd_Tech, BackEnd_Tech, 
//     Project_Name, Start_Date, Deliver_Date, Order_ID, Order_Price, Client_ID)
//     VALUES ('In Process', 'MySQL', 'HTML, Bootstrap', 'NodeJS, Express',
//     'HECTOR PRESI', '26-11-19', '26-11-20', '1200', 20000.99, 
//     (SELECT c.Client_ID FROM ebdb.Client c WHERE c.Client_Name = 'Arturo Rendon'));

var Employees
connection.query('SELECT * FROM ebdb.Employees;', (err, results, fields) => {
    if (err) throw err
    Employees = results
})

var Projects
connection.query('SELECT * FROM ebdb.Project;', (err, results, fields) => {
    if (err) throw err
    Projects = results
})

var Tasks
connection.query('SELECT * FROM ebdb.Tasks;', (err, results, fields) => {
    if (err) throw err
    Tasks = results
})


//ejs
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.set('views', './public/views')

app.get('/', async function (req, res) {
    //NOTA MOSTRAR PAGINA SIEMPRE Y CUANDO EXISTA UN USUARIO LOGGED 
    //buscar obj en la base de datos, segun el id del user logged 
    //(el id del user logged debe guardarse en los cookies al momento de iniciar sesion)

    var c = req.cookies.userData,
        log = isLogged(c)

    if (log) {
        var userLogged = jwt.decode(c)

        if (userLogged.userType == 'E') {

            var empID = await connection.query(`SELECT u.Employee_ID FROM ebdb.Users u WHERE u.Username = '${userLogged.username}'`)
            var pPage = await connection.query(`SELECT p.Project_Name AS title, p.Project_Description AS description, p.Project_Image AS projectimage, p.Project_ID AS projectid FROM ebdb.Project p INNER JOIN ebdb.Project_x_Employee pe ON p.Project_ID = pe.Project_ID WHERE pe.Employee_ID = '${empID[0].Employee_ID}';`)
            var pCount = await connection.query(`SELECT COUNT(p.Project_ID) AS pc FROM ebdb.Project p INNER JOIN ebdb.Project_x_Employee pe ON p.Project_ID = pe.Project_ID WHERE pe.Employee_ID = '${empID[0].Employee_ID}';`)
            var tCount = await connection.query(`SELECT COUNT(t.Task_ID) AS tc FROM ebdb.Tasks t INNER JOIN ebdb.Task_x_Employee te ON te.Task_ID = t.Task_ID WHERE te.Employee_ID = ${empID[0].Employee_ID};`)
            var bugs = await connection.query(`SELECT COUNT(b.Bug_Name) AS bCount FROM ebdb.Bugs b INNER JOIN ebdb.Task_x_Bug tb ON b.Bug_Name = tb.Bug_Name INNER JOIN ebdb.Tasks t ON tb.Task_ID = t.Task_ID INNER JOIN ebdb.Task_x_Employee te ON te.Task_ID = t.Task_ID WHERE te.Employee_ID = '${empID[0].Employee_ID}';`)

            var obj = {
                projects_count: pCount[0].pc,
                tasks_count: tCount[0].tc,
                bugs_count: bugs[0].bCount,
                projects: pPage
            }

            res.render('dashboard', { obj: obj })

        } else if (userLogged.userType == 'M') {

            var pCount = await connection.query('SELECT COUNT(p.Project_ID) AS pc FROM ebdb.Project p;')
            var eCount = await connection.query('SELECT COUNT(t.Employee_ID) as ec FROM ebdb.Employees t;')
            var pPage = await connection.query("SELECT p.Project_Image AS projectimage, p.Project_ID as projectid, p.Project_Name as title, p.Project_Description as descriptiom ,count(t.Project_ID) as QtyTasks, count(tb.Bug_Name) as Bugs FROM ebdb.Project p left join ebdb.Tasks t on p.Project_ID = t.Project_ID left join ebdb.Task_x_Bug tb on t.Task_ID = tb.Task_ID WHERE p.IsApproved = 'Y' group by  p.Project_Image, p.Project_ID, p.Project_Name, p.Project_Description;")

            var obj = {
                projects_count: pCount[0].pc,
                employees_count: eCount[0].ec,
                projects: pPage
            }

            res.render('dashboard_manager', { obj: obj })

        }
    }
    else
        res.render('login')

})

app.get('/project-page/:projectid', function (req, res) {
    //NOTA MOSTRAR PAGINA SIEMPRE Y CUANDO EXISTA UN USUARIO LOGGED y el usuarios sea miembre del proyecto

    //el id del user logged tiene que ser miembro del projecto que se este solicitando (projectid) 
    //(el id del user logged debe guardarse en los cookies al momento de iniciar sesion y
    //el projectid viene de parametro en la request al servidor)

    //object segun id

    var members = [];
    for (var i = 0; i < Employees.length; i++) {
        members.push({
            name: Employees[i].Employee_Name,
            id: Employees[i].Employee_ID
        })
    }

    var obj = {
        projectimage: "logo1.png",
        projecttitle: "Titulo",
        tasksnumber: 10,
        tasksdone: 1,
        bugsnumber: 5,
        bugsfixed: 0,
        progressbar: 0,
        taskbar: 0,
        bugbar: 0,
        teammembers: members,
        taskhistory: [{ id: 1, owner: "Anfernee castillo", title: "Create login", status: "warning" }, { id: 1, owner: "Anfernee castillo", title: "Create login", status: "done" }]
    }


    //fix progress bar
    obj.progressbar = 81 - (81 - (((obj.tasksnumber - obj.tasksdone) / 0.81 + (obj.bugsnumber - obj.bugsfixed) / 0.81)));
    obj.taskbar = 91 - (91 - ((obj.tasksnumber - obj.tasksdone) / 0.91));
    obj.bugbar = 92 - (92 - ((obj.bugsnumber - obj.bugsfixed) / 0.92));
    res.render('project_page', { obj: obj });

})

app.get("/task-page/:taskid", function (req, res) {

    var obj = {
        projectid: "1",
        id: "1",
        title: "Title",
        description: "This is a description",
        activityhistory: [{ id: 1, author: "autor", subject: "subject", status: "error", date: "12/11/19", timelapsed: "23:00 - 24:00", description: "this is a big description" }]
    }
    res.render('task_page', { obj: obj })
})

app.get("/tasks", async function (req, res) {

    var tasks = await connection.query('SELECT t.Project_ID AS projectid, p.Project_Name AS projecttitle, t.Task_ID AS taskid, t.Task_Name AS taskttitle, t.Task_Instructions AS taskdescription, t.Task_Status AS currentstatus FROM ebdb.Tasks t INNER JOIN ebdb.Project p ON t.Project_ID = p.Project_ID')

    // var TasksForTaskList = [];
    // for (var i = 0; i < Tasks.length; i++) {
    //     TasksForTaskList.push({
    //         projectid: Tasks[i].Project_ID,
    //         projecttitle: await getProjectNameByID(Tasks[i].Project_ID),
    //         taskid: Tasks[i].Task_ID,
    //         tasktitle: Tasks[i].Task_Name,
    //         tasksdescription: Tasks[i].Task_Instructions,
    //         currentstatus: 'In Process'
    //     })
    // }
    res.render('tasks', { obj: tasks })
})

app.get('/logout', async (req, res) => {
    res.clearCookie('userData')
    res.redirect('/')
})

app.post('/', async function (req, res) {
    //console.log(req.body)
    var u = req.body.user
    var pl

    var userQuery = await connection.query(`SELECT u.Username, u.Employee_ID, u.Client_ID, u.Manager FROM ebdb.Users u WHERE u.Username = '${u.user}' AND u.Password = '${u.password}';`)

    try {
        userQuery[0].Employee_ID
    } catch (e) {

        res.redirect('/')
    }

    if (userQuery[0].Employee_ID != null) {

        pl = {
            username: userQuery[0].Username,
            userType: 'E',
            typeID: userQuery[0].Employee_ID
        }

    }
    else if (userQuery[0].Client_ID != null) {
        pl = {
            username: userQuery[0].User,
            userType: 'C',
            typeID: userQuery[0].Client_ID
        }
    }
    else if (userQuery[0].Manager != null) {
        pl = {
            username: userQuery[0].User,
            userType: 'M',
            typeID: userQuery[0].Manager
        }

    }

    const uToken = jwt.sign(pl, private_key, { expiresIn: '1h' })
    res.cookie('userData', uToken)
    res.redirect('/')

})


app.get('/pending-projects', async function (req, res) {


    var allEmployees = await connection.query('SELECT e.Employee_Name AS name, e.Employee_ID AS id FROM ebdb.Employees e;')
    var allProjects = await connection.query("SELECT p.Project_ID AS projectid, p.Project_Image AS image, p.Project_Name AS title, p.Order_Price AS price, p.Deliver_Date AS duedate, p.Project_Description AS description FROM Project p WHERE p.IsApproved = 'N';")

    var obj = {
        employees: allEmployees,
        projects: allProjects
    }
    res.render('manager_pending_projects', { obj: obj });
});


app.listen(3577)


function isLogged(x) {
    if (x === undefined)
        return false
    else
        return true
}
