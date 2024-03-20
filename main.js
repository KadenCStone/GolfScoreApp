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

async function populateCourseDetails(courseId) {
    currentCourseId = courseId;
    let details = courseDetails[courseId];
    if (!details) {
      details = await getGolfCourseDetails(courseId);
    }
    populateTeeBoxSelect(details.holes[0].teeBoxes);
  }
  
  function populateTeeBoxSelect(teeBoxes) {
    const teeBoxSelect = document.getElementById("tee-box-select");
    teeBoxSelect.innerHTML = "";
    const storedTeeBoxId = localStorage.getItem("teeBoxId") || 0;
  
    teeBoxes.forEach((teeBox, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = `${teeBox.teeType.toUpperCase()}, ${teeBox.totalYards} yards`;
      teeBoxSelect.appendChild(option);
    });
  
    teeBoxSelect.value = storedTeeBoxId;
    teeBoxIndex = storedTeeBoxId;
    populateScorecard();
  }
  
  function handleTeeSelection(ev) {
    teeBoxIndex = ev.target.value;
    localStorage.setItem("teeBoxId", teeBoxIndex);
    populateScorecard();
  }
  
  async function populateScorecard() {
    const details = await getGolfCourseDetails(currentCourseId);
    const tbody = document.querySelector("#scorecard-container table tbody");
    tbody.innerHTML = "";
  
    details.holes.forEach((hole, index) => {
      const row = tbody.insertRow();
      const teeBox = hole.teeBoxes[teeBoxIndex];
      row.insertCell().textContent = index + 1;
      row.insertCell().textContent = teeBox.yards;
      row.insertCell().textContent = teeBox.hcp;
      row.insertCell().textContent = teeBox.par;
  
      for (let i = 0; i < 4; i++) {
        const cell = row.insertCell();
        const input = document.createElement("input");
        input.type = "number";
        input.classList.add("form-control");
        input.addEventListener("input", updatePlayerTotal);
        cell.appendChild(input);
  
        if (index === 17) { 
          const totalCell = tbody.rows[0].cells[i + 4].cloneNode(true);
          totalCell.textContent = ""; 
          cell.appendChild(totalCell);
        }
      }
    });