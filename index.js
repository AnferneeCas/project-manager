//Require
const express = require('express'),
    app = express(),
    mysql = require('mysql'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    connection = mysql.createConnection({
        host: 'anfer2325.cpqgjl5d66m6.us-east-2.rds.amazonaws.com',
        user: 'admin',
        password: 'anfer2325',
        port: '3306',
        database: 'ebdb'
    }),
    util = require('util')

const jwt = require('jsonwebtoken')

// ALTER SESSION SET "_ORACLE_SCRIPT" = true;

// CREATE USER cuenta IDENTIFIED BY cuenta;
// DEFAULT TABLESAPCE "USERS"
// temporary tablesapce "TMP"

// alter user cuenta quota unlimited on USERS

// grant create table to cuenta;
// grant create session to cuenta;

// alter session set current_schema = cuenta;

//Configuration and declaration
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.json())
const private_key = 'arturoyanfer'
const payload = {
    username: 'r2rendon',
    userType: 'E'
}

const token = jwt.sign(payload, private_key, { expiresIn: '1d' })
console.log(token)

var v = jwt.verify(token, private_key)
console.log(v)


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

    var c = req.cookies.userData,
        log = isLogged(c)

    if (log) {
        var userLogged = jwt.decode(c)

        if (userLogged.userType == 'E') {

            var empID = await connection.query(`SELECT u.Employee_ID FROM ebdb.Users u WHERE u.Username = '${userLogged.username}'`)
            var pPage = await connection.query(`SELECT p.Project_Name AS title, p.Project_Description AS description, p.Project_Image AS projectimage, p.Project_ID AS projectid FROM ebdb.Project p INNER JOIN ebdb.Project_x_Employee pe ON p.Project_ID = pe.P_ID WHERE pe.E_ID = '${empID[0].Employee_ID}';`)
            var pCount = await connection.query(`SELECT COUNT(p.Project_ID) AS pc FROM ebdb.Project p INNER JOIN ebdb.Project_x_Employee pe ON p.Project_ID = pe.P_ID WHERE pe.E_ID = '${empID[0].Employee_ID}';`)
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
            var pPage = await connection.query("SELECT p.Project_Image AS projectimage, p.Project_ID as projectid, p.Project_Name as title, p.Project_Description as description,count(t.Project_ID) as QtyTasks, count(tb.Bug_Name) as Bugs FROM ebdb.Project p left join ebdb.Tasks t on p.Project_ID = t.Project_ID left join ebdb.Task_x_Bug tb on t.Task_ID = tb.Task_ID WHERE p.IsApproved = 'Y' group by  p.Project_Image, p.Project_ID, p.Project_Name, p.Project_Description")
            var obj = {
                projects_count: pCount[0].pc,
                employees_count: eCount[0].ec,
                projects: pPage
            }

            res.render('dashboard_manager', { obj: obj })

        }
        else if (userLogged.userType == 'C') {

            var clientProjects = await connection.query(`SELECT p.Project_Image AS projectimage, p.Project_Name AS title, p.Project_ID AS projectid, p.Project_Description AS description FROM ebdb.Project p 
            INNER JOIN ebdb.Client c ON p.Client_ID = c.Client_ID  WHERE p.Client_ID = ${userLogged.typeID};`)

            var obj = {
                projects: clientProjects
            }

            res.render('dashboard_client', { obj: obj });

        }
    }
    else
        res.render('login')

})

app.post('/newProject', async function (req, res) {

    var client = jwt.decode(req.cookies.userData)

    console.log(req.body.p.price)

    parseFloat(req.body.p.price)

    var q = await connection.query(`INSERT INTO ebdb.Project(Project_Name, Due_Date, Order_Price, Client_ID, Project_Description, Project_Image, IsApproved)
    VALUES ('${req.body.p.name}', '${req.body.p.dDate}', ${req.body.p.price}, ${client.typeID}, '${req.body.p.description}', '${req.body.p.image}','P')`)

    res.redirect('/')

})

app.get('/account-settings', async function (req, res) {

    var client = jwt.decode(req.cookies.userData)

    var cInfo = await connection.query(`SELECT c.Client_Name AS name, u.Email AS email, u.Username AS username, u.Password AS password, c.Client_Address AS address, c.Client_IDNumber AS nID FROM ebdb.Client c INNER JOIN ebdb.Users u ON u.Client_ID = c.Client_ID WHERE c.Client_ID = ${client.typeID}`)

    var obj = {
        name: cInfo[0].name,
        email: cInfo[0].email,
        username: cInfo[0].username,
        pass: cInfo[0].password,
        address: cInfo[0].address,
        nID: cInfo[0].nID
    }

    res.render('account_settings', { obj: obj });
})

app.post('/account-settings', async function (req, res) {

    var u = jwt.decode(req.cookies.userData)

    var updateC = await connection.query(`UPDATE ebdb.Client
    SET Client_Name = '${req.body.acc.name}', Client_Address = '${req.body.acc.address}',Client_IDNumber = '${req.body.acc.nID}'
    WHERE Client_ID = ${u.typeID};`)

    var updateU = await connection.query(`UPDATE Users
    SET Username = '${req.body.acc.username}', Password = '${req.body.acc.pass}', Email = '${req.body.acc.email}'
    WHERE Client_ID = ${u.typeID};`)

    res.redirect('/account-settings')

})

app.get('/project-page/:projectid', async function (req, res) {
    //NOTA MOSTRAR PAGINA SIEMPRE Y CUANDO EXISTA UN USUARIO LOGGED y el usuarios sea miembre del proyecto

    //el id del user logged tiene que ser miembro del projecto que se este solicitando (projectid) 
    //(el id del user logged debe guardarse en los cookies al momento de iniciar sesion y
    //el projectid viene de parametro en la request al servidor)

    //object segun id

    var c = req.cookies.userData,
        log = isLogged(c)

    if (log) {
        var userLogged = jwt.decode(c)




        var members = await connection.query('SELECT e.Employee_Name AS name, e.Employee_ID AS id FROM ebdb.Employees e INNER JOIN ebdb.Project_x_Employee pe ON pe.E_ID = e.Employee_ID INNER JOIN ebdb.Project p ON pe.P_ID = p.Project_ID WHERE p.Project_ID = ' + req.params.projectid + ';')
        var pImage = await connection.query('SELECT p.Project_Image AS image FROM ebdb.Project p WHERE p.Project_ID = ' + req.params.projectid + ';')
        var pTitle = await connection.query('SELECT p.Project_Name AS title FROM ebdb.Project p WHERE p.Project_ID = ' + req.params.projectid + ';')
        var tasksNumber = await connection.query('SELECT COUNT(t.Task_ID) AS number FROM ebdb.Tasks t INNER JOIN ebdb.Project p ON p.Project_ID = t.Project_ID WHERE p.Project_ID = ' + req.params.projectid + ';')
        var tasksDone = await connection.query("SELECT COUNT(t.Task_ID) AS tDone FROM ebdb.Tasks t WHERE t.Task_Status = 'Done' AND t.Project_ID = " + req.params.projectid + ";")
        var bugs = await connection.query('SELECT COUNT(b.Bug_Name) AS bNumber FROM ebdb.Bugs b INNER JOIN ebdb.Task_x_Bug tb ON tb.Bug_Name = b.Bug_Name INNER JOIN ebdb.Tasks t ON t.Task_ID = tb.Task_ID WHERE t.Project_ID = ' + req.params.projectid + ';')
        var bugsFixed = await connection.query("SELECT COUNT(b.Bug_Name) AS unsolved FROM ebdb.Bugs b INNER JOIN ebdb.Task_x_Bug tb ON tb.Bug_Name = b.Bug_Name INNER JOIN ebdb.Tasks t on t.Task_ID = tb.Task_ID WHERE t.Task_ID = " + req.params.projectid + " AND b.Bug_Status = 'Solved';")
        //var tHistory = await connection.query('');

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
            userType: userLogged.userType,
            taskhistory: [{ id: 1, owner: "Anfernee castillo", title: "Create login", status: "warning" }, { id: 1, owner: "Anfernee castillo", title: "Create login", status: "done" }]

        }

        // var userQuery = await connection.query(`SELECT u.Username, u.Employee_ID, u.Client_ID, u.Manager FROM ebdb.Users u WHERE u.Username = '${'r2chinchilla'}' AND u.Password = '${'Hola'}';`)

        // console.log(userQuery)


        //fix progress bar
        obj.progressbar = 81 - ((((obj.tasksnumber - obj.tasksdone) / 0.81) + ((obj.bugsnumber - obj.bugsfixed) / 0.81)));
        obj.taskbar = 91 - (91 - ((obj.tasksnumber - obj.tasksdone) / 0.91));
        obj.bugbar = 92 - (92 - ((obj.bugsnumber - obj.bugsfixed) / 0.92));

        res.render('project_page', { obj: obj });



    } else {
        res.redirect('/');
    }

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

    var aTasks = await connection.query('');

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

app.get('/logout', async (req, res) => {
    res.clearCookie('userData')
    res.redirect('/')
})

app.get('/employees', async (req, res) => {

    var emps = await connection.query('SELECT Employee_Name AS name, Employee_Position AS position, Hire_Date AS hiredate, Employee_ID AS id FROM ebdb.Employees')
    var obj = {
        employees: emps
    }

    res.render('employees_page', { obj, obj });
})

app.post('/newEmployee', async (req, res) => {

    var today = new Date();
    var date = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate()

    var iEmployee = await connection.query(`INSERT INTO ebdb.Employees(Employee_Name, Employee_Position, Hire_Date)
    VALUES('${req.body.employee.name}', '${req.body.employee.position}', '${date}');`)

    var iUser = await connection.query(`INSERT INTO ebdb.Users(Username, Password, Email, Employee_ID)
    VALUES('${req.body.employee.user}', '${req.body.employee.pass}', '${req.body.employee.email}', (
        SELECT e.Employee_ID FROM ebdb.Employees e WHERE e.Employee_Name = '${req.body.employee.name}'
    ));`)

    res.redirect('employees')

})

app.post('/deleteemployee', async (req, res) => {

    console.log(req.body)

    var q = await connection.query(`DELETE FROM ebdb.Employees WHERE Employee_ID = ${req.body.fEmployee}`)
    res.redirect('/employees')

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

    var aEmployees = await connection.query('SELECT e.Employee_Name AS name, e.Employee_ID AS id FROM ebdb.Employees e;')
    var pProjects = await connection.query("SELECT p.Project_ID AS projectid, p.Project_Image AS image, p.Project_Name AS title, p.Due_Date AS duedate, p.Project_Description AS description, p.Order_Price AS price FROM ebdb.Project p WHERE p.IsApproved = 'P';")

    var obj = {
        employees: aEmployees,
        projects: pProjects
    }

    res.render('manager_pending_projects', { obj: obj });
});

app.post('/acceptProject', async (req, res) => {

    console.log(req.body)

    await connection.query(`UPDATE ebdb.Project
    SET IsApproved = 'Y'
    WHERE Project_ID = ${req.body.pID};`)

    for (var i = 0; i < req.body.pMembers.length; i++)
        await connection.query(`INSERT INTO ebdb.Project_x_Employee(P_ID, E_ID)
        VALUES (${req.body.pID}, ${req.body.pMembers[i]})`)

    res.redirect('/')

})

app.post('/rejectProject', async (req, res) => {
    await connection.query(`UPDATE ebdb.Project
    SET IsApproved = 'R'
    WHERE Project_ID = ${req.body.rProject};`)

    res.redirect('/pending-projects')

})

app.get('/register', async function (req, res) {
    res.render('register_client')
})

app.post('/register', async function (req, res) {
    // {
    //     email: 'hola@unitec.edu',
    //     user: 'hellow',
    //     password: 'Password',
    //     address: 'No se',
    //     idNUm: '0801melapela'
    // }
    connection.query(`INSERT INTO ebdb.Client (Client_Name, Client_Address, Client_IDNumber) VALUES ('${req.body.client.name}', '${req.body.client.address}', '${req.body.client.idNum}');`)
    connection.query("INSERT INTO `ebdb`.`Users` (`Username`, `Password`, `Email`, `Client_ID`) VALUES ('" + req.body.client.user + "', '" + req.body.client.password + "', '" + req.body.client.email + "',(SELECT c.Client_ID FROM ebdb.Client c WHERE c.Client_Name = '" + req.body.client.name + "'));")

    res.redirect('/')
})






app.listen(3000)





function isLogged(x) {
    if (x === undefined)
        return false
    else
        return true
}




{/* <div class="col-md-4" style=" border: 2px black solid;">

<span> <img src="../images/tasks_icon.png" style=" max-width:40px; " alt=""></span>
<span style="padding-left:0.7em ;"><%= project.QtyTasks %></span>
</div>

<div class="col-md-4" style=" border: 2px black solid;">

<span> <img src="../images/error_icon.png" style=" max-width:40px; " alt=""></span>
<span style="padding-left:0.7em ;"><%= project.Bugs %></span>
</div> */}
