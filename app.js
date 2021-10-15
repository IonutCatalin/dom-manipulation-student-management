import * as Utils from './utils.js';
import * as Api from './api.js';

let studentsList = [];
let coursesList = [];
let selectedCourse;

document.addEventListener("DOMContentLoaded", async function () {
    bindFormEvents();
    await buildCourseList();
    await buildStudentDropdown();
});

function bindFormEvents() {
    document.querySelector('#student-details-form').addEventListener('submit', function (event) {
        onStudentCreate(event);
    });
    document.querySelector('#course-details-form').addEventListener('submit', function (event) {
        onCourseCreate(event);
    });
}

async function buildCourseList() {
    coursesList = await Api.getCourses();

    for (let course of coursesList) {
        const container = document.querySelector(".header-courses");
        const courseElement = document.createElement("div");

        courseElement.setAttribute("id", course.id);
        courseElement.className = "header-course";
        courseElement.innerHTML = course.name;
        container.appendChild(courseElement);

        courseElement.addEventListener("click", function (event) {
            onCourseChange(event);
        });
    }
    autoSelectCourse(coursesList[0]);
}

function buildStudentRow(student) {
    const tbody = document.querySelector("table.students-table tbody");
    const tr = document.createElement("tr");

    const avatarColumn = document.createElement("td");
    const avatarDiv = document.createElement("div");
    const avatarImg = document.createElement("img");
    const randomAvatar = student.avatar ? student.avatar : getRandomAvatar();

    const nameColumn = document.createElement("td");
    const nameDiv = document.createElement("div");
    const nameGenderDiv = document.createElement("div");
    const nameGenderSpan = document.createElement("span");

    const addressColumn = document.createElement("td");
    const hobbiesColumn = document.createElement("td");
    const actionsColumn = document.createElement("td");
    const actionsIcon = document.createElement("i");

    avatarDiv.className = "student-icon";
    avatarImg.setAttribute("src", `avatars/${randomAvatar}`);
    avatarDiv.appendChild(avatarImg);
    avatarColumn.appendChild(avatarDiv);

    nameDiv.innerHTML = `${student.firstName} ${student.lastName} (${student.id})`;
    nameGenderSpan.innerHTML = student.gender;
    nameGenderDiv.appendChild(nameGenderSpan);
    nameColumn.appendChild(nameDiv);
    nameColumn.appendChild(nameGenderDiv);

    addressColumn.innerHTML = student.address ? student.address : "no address";
    hobbiesColumn.innerHTML = student.hobbies ? student.hobbies : "no hobbies";

    actionsIcon.className = "fas fa-trash";
    actionsColumn.appendChild(actionsIcon);

    tr.setAttribute("id", `student-${student.id}`);
    tr.className = "student-row";

    tr.appendChild(avatarColumn);
    tr.appendChild(nameColumn);
    tr.appendChild(addressColumn);
    tr.appendChild(hobbiesColumn);
    tr.appendChild(actionsColumn);
    tbody.appendChild(tr);

    actionsIcon.addEventListener("click", function () {
        removeStudentFromCourse(student.id);
    });
}

async function buildStudentDropdown() {
    studentsList = await Api.getStudents();

    for (let student of studentsList) {
        buildStudentDropdownItem(student);
    }

    buildDisabledStudents();
}

function buildDisabledStudents() {
    const currentCourseStudentsIds = selectedCourse.studentList.map((std) => std.id);
    const students = document.querySelectorAll('.add-student-list-item');

    for (const student of students) {
        const studentId = +student.dataset.id;

        student.classList.remove('disabled');

        if (currentCourseStudentsIds.includes(studentId)) {
            student.classList.add('disabled');
        }
    }
}

function buildStudentDropdownItem(student) {
    const list = document.querySelector(".add-student-list");
    const item = document.createElement("div");
    const itemName = document.createElement("span");
    const itemButton = document.createElement("i");

    item.classList.add("add-student-list-item");
    item.setAttribute('data-id', student.id);
    itemName.innerHTML = `${student.firstName} ${student.lastName} (${student.id})`;
    itemButton.classList.add("fas", "fa-user-plus");
    item.appendChild(itemName);
    item.appendChild(itemButton);
    list.appendChild(item);

    itemButton.addEventListener("click", function () {
        onAddStudentToCourse(student);
    });
}

function onCourseChange(event) {
    const selectedCourseId = event.target.id;
    const selectedCourseFound = coursesList.find(
        (course) => course.id === +selectedCourseId
    );

    autoSelectCourse(selectedCourseFound);
}

function autoSelectCourse(course) {
    const tbody = document.querySelector("table.students-table tbody");
    const courses = document.querySelectorAll(".header-course");
    const activeCourseDiv = document.querySelector(
        `.header-course[id="${course.id}"]`
    );
    const noResultsDiv = document.querySelector(".students-no-results");
    const courseTeacher = document.querySelector(".header-details span");

    courseTeacher.innerHTML = course.assignedTeacher;
    tbody.innerHTML = "";
    selectedCourse = {...course};

    for (let courseDiv of courses) {
        courseDiv.classList.remove("active");
    }

    activeCourseDiv.classList.add("active");

    if (!course.studentList.length) {
        noResultsDiv.classList.add("visible");
    } else {
        noResultsDiv.classList.remove("visible");
    }

    for (let student of course.studentList) {
        buildStudentRow(student);
    }

    buildDisabledStudents();
}

async function onStudentCreate(event) {
    event.preventDefault();

    let gender;

    const id = getMaxStudentIdAvailable() + 1;
    const avatarElem = document.querySelector(".students-form-container .new-academic-info-image img");
    const avatarAttr = avatarElem.getAttribute("src");
    const avatar = avatarAttr.split("/")[1];

    const {firstName, lastName, gender: genderRadios, address, hobbies: hobbiesCheckboxes} = event.target.elements;
    const hobbiesSelected = Array.from(hobbiesCheckboxes).filter(hobby => hobby.checked).map(hobby => hobby.value);
    const hobbies = hobbiesSelected.join(", ");

    const foundStudent = selectedCourse.studentList.find(
        (student) => student.id === +id
    );

    for (let genderRadio of genderRadios) {
        if (genderRadio.checked) {
            gender = genderRadio.value;
        }
    }

    if (foundStudent) {
        Utils.notyf.error("Student is already registered");
        return;
    }

    if (!firstName || !lastName || !gender) {
        Utils.notyf.error("You must fill out the first three fields");
        return;
    }

    const student = {
        id,
        avatar,
        firstName: firstName.value,
        lastName: lastName.value,
        gender,
        address: address.value,
        hobbies
    };

    await Api.createStudent(student);

    studentsList.push(student);

    buildStudentDropdownItem(student);
    clearStudentForm();

    Utils.notyf.success("Student was added to 'Add student' dropdown.");
}


async function onAddStudentToCourse(student) {
    const foundStudent = selectedCourse.studentList.find(
        (std) => std.id === student.id
    );
    const noResultsDiv = document.querySelector(".students-no-results");
    const studentDropdownItem = document.querySelector(`.add-student-list-item[data-id="${student.id}"]`);

    if (foundStudent) {
        Utils.notyf.error("Student is already enrolled in this course");
        return;
    }

    selectedCourse.studentList.push(student);

    await Api.addStudentToCourse(selectedCourse);

    studentDropdownItem.classList.add('disabled');
    buildStudentRow(student);
    noResultsDiv.classList.remove("visible");

    Utils.notyf.success("Student was added to the course.");
}

async function removeStudentFromCourse(studentId) {
    const studentToBeRemoved = document.querySelector(`#student-${studentId}`);
    const studentToBeRemovedIndex = selectedCourse.studentList.findIndex(
        (student) => studentId === student.id
    );
    const noResultsDiv = document.querySelector(".students-no-results");
    const studentDropdownItem = document.querySelector(`.add-student-list-item[data-id="${studentId}"]`);

    selectedCourse.studentList.splice(studentToBeRemovedIndex, 1);
    studentToBeRemoved.remove();

    await Api.removeStudentFromCourse(selectedCourse);

    studentDropdownItem.classList.remove('disabled');

    if (!selectedCourse.studentList.length) {
        noResultsDiv.classList.add("visible");
    }

    Utils.notyf.success("Student was removed from the course.");
}

function clearStudentForm() {
    document.querySelector("#student-details-form").reset();
}

function getRandomAvatar() {
    return Utils.studentAvatars[Math.floor(Math.random() * Utils.studentAvatars.length)];
}

function getMaxStudentIdAvailable() {
    return Math.max(...studentsList.map((student) => student.id));
}

function getMaxCourseIdAvailable() {
    return Math.max(...coursesList.map((course) => course.id));
}

async function onCourseCreate(event) {
    event.preventDefault();

    const {courseNameInput, courseTeacherInput} = event.target.elements;
    const courseName = courseNameInput.value;
    const courseTeacher = courseTeacherInput.value;
    const courseId = getMaxCourseIdAvailable() + 1;

    if (!courseName || !courseTeacher) {
        Utils.notyf.error("You must fill out the required properties");
        return;
    }

    const course = {id: courseId, name: courseName, assignedTeacher: courseTeacher, studentList: []};

    await Api.createCourse(course);

    coursesList.push(course);

    const container = document.querySelector(".header-courses");
    const courseElement = document.createElement("div");

    courseElement.setAttribute("id", String(courseId));
    courseElement.className = "header-course";
    courseElement.innerHTML = courseName;
    container.appendChild(courseElement);

    courseElement.addEventListener("click", function (event) {
        onCourseChange(event);
    });

    event.target.reset();

    Utils.notyf.success("Course was successfully created.");
}
