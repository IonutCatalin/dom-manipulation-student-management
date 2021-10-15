const studentsApi = "http://localhost:3000/students";
const coursesApi = "http://localhost:3000/courses";

export async function getStudents() {
	const response = await fetch(studentsApi, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	return response.json();
}

export async function createStudent(body) {
	await fetch(studentsApi, {
		method: "POST",
		body: JSON.stringify(body),
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export async function getCourses() {
	const response = await fetch(coursesApi, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	return response.json();
}

export async function addStudentToCourse(course) {
	await fetch(`${coursesApi}/${course.id}`, {
		method: "PUT",
		body: JSON.stringify(course),
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export async function removeStudentFromCourse(course) {
	await fetch(`${coursesApi}/${course.id}`, {
		method: "PUT",
		body: JSON.stringify(course),
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export async function createCourse(course) {
	await fetch(coursesApi, {
		method: "POST",
		body: JSON.stringify(course),
		headers: {
			"Content-Type": "application/json",
		},
	});
}
