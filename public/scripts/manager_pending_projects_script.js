var botones = document.querySelectorAll(".accept-button");
console.log(botones);
var projectid;

botones.forEach(function (btn) {
    btn.addEventListener('click', function (ev) {
        console.log('click');
        projectid = btn.attributes.projectid.value
        console.log(projectid)
        ev.preventDefault();
    })
})



var botones2 = document.querySelectorAll(".reject-button");
console.log(botones);

botones.forEach(function (btn) {
    btn.addEventListener('click', function (ev) {
        console.log('click');
        ev.preventDefault();
    })
})


var botones_descriptions = document.querySelectorAll(".description-button");
botones_descriptions.forEach(function (btn) {
    btn.addEventListener('click', function (ev) {
        ev.preventDefault();
    })

});



var team_members = document.querySelectorAll(".team-checkbox");

var btnChanges = document.querySelector('.btn-change');

btnChanges.addEventListener('click', function (ev) {
    var emps = [];
    team_members.forEach(function (member) {
        console.log(member)
        if (member.checked)
            emps.push(member.value)
    })

    var bObj = {
        pMembers: emps,
        pID: projectid
    }

    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bObj)
    }

    fetch('/acceptProject', options)
})
