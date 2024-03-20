let currentCourseId = null;
let courseList = [];
let courseDetails = {};
let teeBoxIndex = 0;

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  getAvailableGolfCourses().then((courses) => {
    courseList = courses;
    populateCourseSelect(courses);
  });

  document.getElementById("course-select").addEventListener("change", handleCourseSelection);
  document.getElementById("tee-box-select").addEventListener("change", handleTeeSelection);
}

function getAvailableGolfCourses() {
  return fetch("https://exquisite-pastelito-9d4dd1.netlify.app/golfapi/courses.json")
    .then((response) => response.json());
}

async function getGolfCourseDetails(golfCourseId) {
  let details = courseDetails[golfCourseId];
  if (!details) {
    details = await fetch(`https://exquisite-pastelito-9d4dd1.netlify.app/golfapi/course${golfCourseId}.json`)
      .then((response) => response.json());
    courseDetails[golfCourseId] = details;
  }
  return details;
}

function populateCourseSelect(courses) {
  const courseSelect = document.getElementById("course-select");
  const storedCourseId = localStorage.getItem("courseId");

  courses.forEach((course) => {
    const option = document.createElement("option");
    option.value = course.id;
    option.textContent = course.name;
    courseSelect.appendChild(option);
  });

  courseSelect.value = storedCourseId || courses[0].id;
  populateCourseDetails(storedCourseId || courses[0].id);
}

function handleCourseSelection(ev) {
  const courseId = ev.target.value;
  localStorage.setItem("courseId", courseId);
  populateCourseDetails(courseId);
}

