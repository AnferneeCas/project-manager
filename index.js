const express = require('express'),
    app = express(),
    mysql = require('mysql'),
    connection = mysql.createConnection({
        host: 'anfer2325.cpqgjl5d66m6.us-east-2.rds.amazonaws.com',
        user: 'admin',
        password: 'anfer2325',
        port: '3306',
        database: 'edbd'
    })

connection.connect((err) => {
    if (err)
        console.log('Connection failed')
    else
        console.log('Connected')
})

//ejs
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.set('views', './public/views')

app.get('/', function (req, res) {
    //NOTA MOSTRAR PAGINA SIEMPRE Y CUANDO EXISTA UN USUARIO LOGGED 
    //buscar obj en la base de datos, segun el id del user logged 
    //(el id del user logged debe guardarse en los cookies al momento de iniciar sesion)
    var obj = {
<<<<<<< HEAD
        projects_count:5,
        tasks_count:10,
        bugs_count:12,
        projects:[{title:"Proyecto1",description:"El proyecto dqu",projectimage:"logo1.png",projectid:"projecto1"},
        {title:"Hector",description:"HECTOR PRESI",projectimage:"logo1.png",projectid:"hector"}],
        test:"fsdfa"
=======
        projects_count: 5,
        tasks_count: 10,
        bugs_count: 12,
        projects: [{ title: "Proyecto1", description: "El proyecto dqu", projectimage: "logo1.png", projectid: "projecto1" },
        { title: "Hector", description: "HECTOR PRESI", projectimage: "logo1.png", projectid: "hector" },
        { title: "Arturo", description: "SOY GUAPO", projectimage: "logo1.png", projectid: "arturo_esta_bueno" }]
>>>>>>> 6fd2d0ea255451b28b5422ebae2ac24852f55908
    }

    res.render('dashboard', { obj: obj })
})

app.get('/project-page/:projectid', function (req, res) {
    //NOTA MOSTRAR PAGINA SIEMPRE Y CUANDO EXISTA UN USUARIO LOGGED y el usuarios sea miembre del proyecto

    //el id del user logged tiene que ser miembro del projecto que se este solicitando (projectid) 
    //(el id del user logged debe guardarse en los cookies al momento de iniciar sesion y
    //el projectid viene de parametro en la request al servidor)

    //object segun id
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
        teammembers: [{ name: "Anfernee Castillo", id: "123" }, { name: "Arturo Rendon", id: "456" }],
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


app.get("/tasks", function (req, res) {

    var obj = {
        tasks: [
            {
                projectid: "1",
                projecttitle: "The project name",
                taskid: "2",
                tasktitle: "This is a task",
                taskdescription: "This is a description",
                currentstatus: "process"
            },
            {
                projectid: "1",
                projecttitle: "The project name",
                taskid: "2",
                tasktitle: "This is a task",
                taskdescription: "This is a description",
                currentstatus: "process"
            },
            {
                projectid: "1",
                projecttitle: "The project name",
                taskid: "2",
                tasktitle: "This is a task",
                taskdescription: "This is a description",
                currentstatus: "process"
            },
            {
                projectid: "1",
                projecttitle: "The project name",
                taskid: "2",
                tasktitle: "This is a task",
                taskdescription: "This is a description",
                currentstatus: "process"
            },
            {
                projectid: "1",
                projecttitle: "The project name",
                taskid: "2",
                tasktitle: "This is a task",
                taskdescription: "This is a description",
                currentstatus: "process"
            },
            {
                projectid: "1",
                projecttitle: "The project name",
                taskid: "2",
                tasktitle: "This is a task",
                taskdescription: "This is a description",
                currentstatus: "process"
            },
            {
                projectid: "1",
                projecttitle: "The project name",
                taskid: "2",
                tasktitle: "This is a task",
                taskdescription: "This is a description",
                currentstatus: "process"
            }
        ]
    }
    res.render('tasks', { obj: obj })
})


app.listen(3000)