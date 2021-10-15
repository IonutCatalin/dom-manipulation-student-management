import * as Utils from './utils.js';

function onCourseCreateShow() {
    const container = document.querySelector(".course-form-container");

    container.classList.add("visible");
}
document.querySelector('.create-course').addEventListener('click', onCourseCreateShow);

function onCourseCancel() {
    const container = document.querySelector(".course-form-container");

    container.classList.remove("visible");
    document.querySelector("#course-details-form").reset();
}
document.querySelector('.cancel-course').addEventListener('click', onCourseCancel);

function onStudentCreateShow() {
    const container = document.querySelector(".students-form-container");

    container.classList.add("visible");
}
document.querySelector('.create-student').addEventListener('click', onStudentCreateShow);


function onStudentDropdownToggle() {
    const list = document.querySelector(".add-student-list");

    list.classList.toggle("open");
}
document.querySelector('.add-student').addEventListener('click', onStudentDropdownToggle);

function onStudentDropdownClose() {
    const list = document.querySelector(".add-student-list");

    list.classList.remove("open");
}
document.querySelector('.add-student-list-header i').addEventListener('click', onStudentDropdownClose);

function onStudentCancel() {
    const container = document.querySelector(".students-form-container");

    container.classList.remove("visible");
    document.querySelector("#student-details-form").reset();
}
document.querySelector('#student-details-form .cancel-student-button').addEventListener('click', onStudentCancel);

function getRandomAvatar() {
    return Utils.studentAvatars[Math.floor(Math.random() * Utils.studentAvatars.length)];
}

function onGenerateNewAvatar() {
    const avatar = getRandomAvatar();
    const image = document.querySelector(".students-form-container .new-academic-info-image img");

    image.setAttribute("src", `avatars/${avatar}`);
}
document.querySelector('.new-academic-info-image button').addEventListener('click', onGenerateNewAvatar);
