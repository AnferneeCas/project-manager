const express = require('express'),
    app = express(),
    mysql = require('mysql'),
    connection = mysql.createConnection({
        host: 'anfer2325.cpqgjl5d66m6.us-east-2.rds.amazonaws.com',
        user: 'admin',
        password: 'anfer2325',
        port: '3306',
        database: 'ebdb'
    })

connection.connect(async (err) => {
    if (err)
        console.log(err)
    else
        console.log('Connected')
})

async function getProjectNameByID(x) {
    var pName
    await connection.query('SELECT p.Project_Name FROM ebdb.Project p WHERE p.Project_ID = ' + x + ';', (err, results, fields) => {
        if (err) throw err
        pName = results[0].Project_Name
        console.log(pName)
        return pName
    })
}

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

app.get('/', function (req, res) {
    //NOTA MOSTRAR PAGINA SIEMPRE Y CUANDO EXISTA UN USUARIO LOGGED 
    //buscar obj en la base de datos, segun el id del user logged 
    //(el id del user logged debe guardarse en los cookies al momento de iniciar sesion)

    var pPage = [];
    for (var i = 0; i < Projects.length; i++) {
        pPage.push({
            title: Projects[i].Project_Name,
            description: Projects[i].Project_DataBase,
            projectimage: 'logo1.png',
            projectid: Projects[i].Project_ID
        })
    }

    var obj = {
        projects_count: 5,
        tasks_count: 10,
        bugs_count: 12,
        projects: pPage
    }

    res.render('dashboard', { obj: obj })
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

    var TasksForTaskList = [];
    for (var i = 0; i < Tasks.length; i++) {
        TasksForTaskList.push({
            projectid: Tasks[i].Project_ID,
            projecttitle: getProjectNameByID(Tasks[i].Project_ID),
            taskid: Tasks[i].Task_ID,
            tasktitle: Tasks[i].Task_Name,
            tasksdescription: Tasks[i].Task_Instructions,
            currentstatus: 'In Process'
        })
    }

    var obj = {
        tasks: TasksForTaskList
    }
    res.render('tasks', { obj: obj })
})


app.listen(3000);