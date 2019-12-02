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

connection.connect((err) => {
    if (err)
        console.log(err)
    else
        console.log('Connected')
})

connection.query = util.promisify(connection.query);


//ejs
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.set('views', './public/views')

app.get('/', async function (req, res) {
    //NOTA MOSTRAR PAGINA SIEMPRE Y CUANDO EXISTA UN USUARIO LOGGED 
    //buscar obj en la base de datos, segun el id del user logged 
    //(el id del user logged debe guardarse en los cookies al momento de iniciar sesion)

    var pPage = await connection.query('SELECT p.Project_Name AS title, p.Project_Description AS description, p.Project_Image AS projectimage, p.Project_ID AS projectid FROM ebdb.Project p;')
    var pCount = await connection.query('SELECT COUNT(p.Project_ID) AS pc FROM ebdb.Project p;')
    var tCount = await connection.query('SELECT COUNT(t.Task_ID) AS tc FROM ebdb.Tasks t;')

    var obj = {
        projects_count: pCount[0].pc,
        tasks_count: tCount[0].tc,
        bugs_count: 12,
        projects: pPage
    }

    res.render('dashboard', { obj: obj })
})

app.get('/project-page/:projectid', async function (req, res) {
    //NOTA MOSTRAR PAGINA SIEMPRE Y CUANDO EXISTA UN USUARIO LOGGED y el usuarios sea miembre del proyecto

    //el id del user logged tiene que ser miembro del projecto que se este solicitando (projectid) 
    //(el id del user logged debe guardarse en los cookies al momento de iniciar sesion y
    //el projectid viene de parametro en la request al servidor)

    //object segun id

    var members = await connection.query('SELECT e.Employee_Name AS name, e.Employee_ID AS id FROM ebdb.Employees e INNER JOIN ebdb.Project_x_Employee pe ON pe.Employee_ID = e.Employee_ID INNER JOIN ebdb.Project p ON pe.Project_ID = p.Project_ID WHERE p.Project_ID = ' + req.params.projectid + ';')
    var pImage = await connection.query('SELECT p.Project_Image AS image FROM ebdb.Project p WHERE p.Project_ID = ' + req.params.projectid + ';')
    var pTitle = await connection.query('SELECT p.Project_Name AS title FROM ebdb.Project p WHERE p.Project_ID = ' + req.params.projectid + ';')
    var tasksNumber = await connection.query('SELECT COUNT(t.Task_ID) AS number FROM ebdb.Tasks t INNER JOIN ebdb.Project p ON p.Project_ID = t.Project_ID WHERE p.Project_ID = ' + req.params.projectid + ';')
    var tasksDone = await connection.query("SELECT COUNT(t.Task_ID) AS tDone FROM ebdb.Tasks t WHERE t.Task_Status = 'Done' AND t.Project_ID = " + req.params.projectid + ";")
    var bugs = await connection.query('SELECT COUNT(b.Bug_Name) AS bNumber FROM ebdb.Bugs b INNER JOIN ebdb.Task_x_Bug tb ON tb.Bug_Name = b.Bug_Name INNER JOIN ebdb.Tasks t ON t.Task_ID = tb.Task_ID WHERE t.Project_ID = ' + req.params.projectid + ';')
    var bugsFixed = await connection.query("SELECT COUNT(b.Bug_Name) AS unsolved FROM ebdb.Bugs b INNER JOIN ebdb.Task_x_Bug tb ON tb.Bug_Name = b.Bug_Name INNER JOIN ebdb.Tasks t on t.Task_ID = tb.Task_ID WHERE t.Task_ID = " + req.params.projectid + " AND b.Bug_Status = 'Solved';")

    var obj = {
        projectimage: pImage[0].image,
        projecttitle: pTitle[0].title,
        tasksnumber: tasksNumber[0].number,
        tasksdone: tasksDone[0].tDone,
        bugsnumber: bugs[0].bNumber,
        bugsfixed: bugsFixed[0].unsolved,
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


    // var obj = {
    //       projectid: Tasks[i].Project_ID,
    //         projecttitle: await getProjectNameByID(Tasks[i].Project_ID),
    //         taskid: Tasks[i].Task_ID,
    //         tasktitle: Tasks[i].Task_Name,
    //         tasksdescription: Tasks[i].Task_Instructions,
    //         currentstatus: 'In Process'
    // }
    var tmp = await getTasks();
    console.log('test');
    res.render('tasks', { obj: tmp[0] })
})






app.listen(3000)








async function getTasks() {

    var result = await connection.query('select t.Project_ID, t.Task_ID, t.Task_Name, p.Project_Name, t.Task_Instructions,t.Task_Requirements from Tasks t inner join Project p on p.Project_ID = t.Project_ID ;');

    console.log(result);
    return result;
}


