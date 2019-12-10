var botones=document.querySelectorAll(".accept-button");
console.log(botones);

botones.forEach(function (btn) {
btn.addEventListener('click',function (ev) {
    console.log('click');
    ev.preventDefault();
})
})


var botones_descriptions = document.querySelectorAll(".description-button");
botones_descriptions.forEach(function (btn) {
    btn.addEventListener('click',function (ev) {
        ev.preventDefault();
    })
    
});



var team_members = document.querySelectorAll(".team-checkbox");

var btnChanges = document.querySelector('.btn-change');
btnChanges.addEventListener('click',function (ev) {
    team_members.forEach(function (member) {
        if(member.checked)
        console.log(member.value);
    })
    
    ev.preventDefault();
    
})


var btn