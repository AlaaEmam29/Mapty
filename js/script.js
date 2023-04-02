"use script";
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let idxMarker = 0
let timestamp = 0;
let editFlag = false;
let globalIdx;
const workouts = document.querySelector(".workouts")
const workout = document.querySelector(".workout")

const currentTimerDom = document.querySelector(".current__timer");
const mapEl = document.getElementById("map");
const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputSelect = document.querySelector(".form__input--select");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputType = document.querySelector(".form__input--type");
const labelType = document.querySelector(".label--type");
const inputs = [...document.querySelectorAll(".form__input")];
let allData = [];
let markersData = []
let map, mapEvent, coords, date, current_time;
const displayDate = () => `On ${date.getDate()} ${months[date.getMonth()]}`;
function getStorageData() {
  if (localStorage.getItem("data")) {
    allData = JSON.parse(localStorage.getItem("data"));
     markersData = JSON.parse(localStorage.getItem("markers"));
      const fragment = document.createDocumentFragment()
      allData.forEach((item , index) => {
          // displayMarker(map, item.coords)

          fragment.appendChild(createDivWorkout(item , item.id))
        
      });
    workouts.append(fragment)
    

  }

  getMarkStorage()
 

}
function getMarkStorage() {
   const markersString = localStorage.getItem("markers");
  if (markersString !== null) {
    markersData.forEach((data) => {
      const latlang = data["0"]
      const coords = [latlang.lat, latlang.lng]
      const ops = data[1]
      const options = { ...ops }
      const marker = L.marker(coords).addTo(map);
        const popup = L.popup(options);
      marker.bindPopup(popup).openPopup();
    });
  }
  
}
function timer() {
  date = new Date();
  current_time = date.toLocaleTimeString();
  let time = current_time.split(":");
  time[0] = Number.parseInt(time[0]);

  const hours = time[0] % 12 || 12;
  const currTime = `${displayDate()} ${hours}:${time[1].padStart(
    2,
    "0"
  )}:${time[2].padStart(2, "0")}`;
  currentTimerDom.textContent = currTime;
}
async function successCurrentLocation(position) {
  try {
    const { latitude, longitude } = position.coords;
    coords = [latitude, longitude];
    map = L.map("map").setView(coords, 14);
    const MapTilesAPI_OSMEnglish = L.tileLayer(
      "https://maptiles.p.rapidapi.com/en/map/v1/{z}/{x}/{y}.png?rapidapi-key=378e0c371bmsh4d9e2abafdecd1dp1d080djsn833420588ab6",
      {
        attribution:
          '&copy; <a href="http://www.maptilesapi.com/">MapTiles API</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 20,
      }
    );

    MapTilesAPI_OSMEnglish.addTo(map);
    getStorageData()

    map.on("click", (event) => {
      mapEvent = event;
      form.classList.remove("hidden");
      inputDistance.focus();
    });

    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=223dc0963ac24d8ba3f2b3d94bbf40cc`
    );
    const { results } = await response.json();
    const { formatted } = results[0];
    const currLocation = `Your location: ${formatted}`;
    document.querySelector(".location").textContent = currLocation;
  } catch (err) {
    console.log(err)
    document.querySelector(".location").textContent =
      "Error, try again later !";
  }
}

function errorCurrentLocation() {
  document.querySelector(".location").textContent =
    "Could not get your current position , try again later !";
}
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    successCurrentLocation,
    errorCurrentLocation
  );
}
timer();
const CurrentTime = setInterval(timer, 1000);
function handlerSubmitForm(e) {
  e.preventDefault();
  for (let i = 0; i < inputs.length; i++) {
    if (!inputs[i].value) {
      alert("all data are required");
      validation = false;
      return;
    }
  }
  const inputsValidate = inputs.slice(1);
  for (let i = 0; i < inputsValidate.length; i++) {
    if (inputsValidate[i].value < 0) {
      alert("Navigate Number not allowed ");
      return;
    } else if (inputsValidate[i].value == 0) {
      alert("Zero value not allowed ");
      return;
    }
  }
  timestamp = allData.length < 1 ? 0 : Number.parseInt(allData[allData.length - 1].id)  + 1
  
  
  const coords = [mapEvent.latlng.lat, mapEvent.latlng.lng]
  const marker = displayMarker(map, coords)
  const item = {
    id: timestamp,
    type: inputSelect.value,
    duration: +inputDuration.value,
    distance: +inputDistance.value,
    coords,
  };
  item[inputSelect.value === "cycling" ? "elevationGain" : "cadence"] =
  +inputType.value;
  if (editFlag && globalIdx) {
      item.id = +globalIdx
    allData[globalIdx] = item
    const workouts = [...document.querySelectorAll(".workout")]
    const workoutToUpdate = workouts.find(
      (workout) => workout.dataset.id === globalIdx.toString()
      );
      
      const newWorkout = createDivWorkout(allData[globalIdx], globalIdx);
      
      const indexToUpdate = workouts.indexOf(workoutToUpdate);
      workouts.splice(indexToUpdate, 1, newWorkout);
      
      newWorkout.setAttribute("data-id", globalIdx);
      
      workoutToUpdate.replaceWith(newWorkout);
      
      
      
    }
    
    
    
    if (!editFlag) {
      displayWorkouts(item)      
      timestamp += 1
      allData.push(item);
    const options = marker._popup.options
    markersData.push([marker._latlng , options  ]); 
    const markersString = JSON.stringify(markersData);
    localStorage.setItem("markers", markersString);
}

    
  localStorage.setItem("data", JSON.stringify(allData));


  inputs.forEach((input, index) => {
    if (index == 0) {
      input.value = "Choose";
      document.querySelector(".label--type").textContent = "default";
      document.querySelector(".form__input--type").placeholder =
        "depend on your choose";
    } else {
      input.value = "";
    }
  });
  form.classList.add("hidden");
}
function changeSelectType () {
  const cycling = () => {
    labelType.textContent = "Elev Gain";
    inputType.placeholder = "meters";
  };
  const running = () => {
    labelType.textContent = "Cadence";
    inputType.placeholder = "step/min";
  };

  inputSelect.value == "cycling" ? cycling() : running();
}
function createDivWorkout(item , index) {
    date = new Date();

  const div = document.createElement("div")
  div.classList.add('workout', `workout--${item.type}`);
  const attr = document.createAttribute("data-id")
  // index = allData.length < 1 ? 0 : Number.parseInt(allData[allData.length - 1].id)  + 1
  attr.value =  index
  div.setAttributeNode(attr)
  div.innerHTML = `
    <svg class="workouts__btn close-btn" id='closeBtn' viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Interface / Trash_Full"> <path id="Vector" d="M14 10V17M10 10V17M6 6V17.8C6 18.9201 6 19.4798 6.21799 19.9076C6.40973 20.2839 6.71547 20.5905 7.0918 20.7822C7.5192 21 8.07899 21 9.19691 21H14.8031C15.921 21 16.48 21 16.9074 20.7822C17.2837 20.5905 17.5905 20.2839 17.7822 19.9076C18 19.4802 18 18.921 18 17.8031V6M6 6H8M6 6H4M8 6H16M8 6C8 5.06812 8 4.60241 8.15224 4.23486C8.35523 3.74481 8.74432 3.35523 9.23438 3.15224C9.60192 3 10.0681 3 11 3H13C13.9319 3 14.3978 3 14.7654 3.15224C15.2554 3.35523 15.6447 3.74481 15.8477 4.23486C15.9999 4.6024 16 5.06812 16 6M16 6H18M18 6H20"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>
<svg class="workouts__btn edit-btn" id="editBtn" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>edit_fill [#1480]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-59.000000, -400.000000)" fill="#000000"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M3,260 L24,260 L24,258.010742 L3,258.010742 L3,260 Z M13.3341,254.032226 L9.3,254.032226 L9.3,249.950269 L19.63095,240 L24,244.115775 L13.3341,254.032226 Z" id="edit_fill-[#1480]"> </path> </g> </g> </g> </g></svg>

<h4 class="workout__title"> ${item.type.replace(item.type[0], item.type[0].toUpperCase())} on ${displayDate()}</h4>
                    <ul class="workout__list">
                        <li class="workout__item">
          <span class="workout__icon">${isTypeCycling(item.type ,"🚴‍♀️" ,'🏃‍♂️')}</span>
          <span class="workout__value">${item.distance}</span>
          <span class="workout__unit">km</span>
                        </li>
                         <li class="workout__item">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${item.duration}</span>
          <span class="workout__unit">MIN</span>
                        </li>
                         <li class="workout__item">
                            
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${isTypeCycling(item.type , (item.distance / (item.duration / 60)).toFixed(1) , (item.duration / item.distance).toFixed(1)) }</span>
          <span class="workout__unit">${isTypeCycling(item.type ,"KM/H" , 'MIN/KM') }</span>
                        </li>
                         <li class="workout__item">
          <span class="workout__icon"> ${isTypeCycling(item.type ,"⛰" , '🦶🏼') }</span>
          <span class="workout__value">${isTypeCycling(item.type ,item.elevationGain , item.cadence) }</span>
          <span class="workout__unit">${isTypeCycling(item.type ,"M" ,'SPM') }</span>
                        </li>
                    </ul>
                </div>
    `
return div
}
function isTypeCycling(type ,c1, c2) {
   return type == 'cycling' ? c1 : c2
    
}

function displayMarker(map, coords) {
  date = new Date();
  let marker = null;
  if (marker !== null) {
    map.removeLayer(marker);
  }

  const cyclingText = `🚴&zwj;♀️ ${inputSelect.value} ${displayDate()}`;
  const runningText = `🏃&zwj;♂️  ${inputSelect.value} ${displayDate()}`;

  const content = inputSelect.value == "cycling" ? cyclingText : runningText;
  const options = {
    content,
    autoClose: false,
    maxWidth: 300,
    minWidth: 50,
    closeOnClick: false,
    className:
      inputSelect.value == "cycling" ? "cycling-popup" : "running-popup",
  };
  marker = L.marker(coords).addTo(map);
  const popup = L.popup(options);
  marker.bindPopup(popup).openPopup();
  

  return marker

}

function displayWorkouts(item) {
  const fragment = document.createDocumentFragment()
  const div = createDivWorkout(item , timestamp)
  fragment.appendChild(div)
  workouts.append(fragment)
}
form.addEventListener("submit", handlerSubmitForm );

inputSelect.addEventListener("change", changeSelectType);

workouts.addEventListener("click", function (e) {
  const clicked = e.target.closest(".workouts__btn")
  if (!clicked) return
  const btn = clicked.id
  const workout = clicked.closest(".workout")
  const { id } = workout.dataset
  if (btn === 'closeBtn') {
    const data = allData.find(data => data.id == id)
    const index = allData.indexOf(data)
    const marker = markersData.find((item, index) => {
          const latlang = item[0]
      const coords = [latlang.lat, latlang.lng]
     return coords.filter((c, i) => data.coords[i] == c)
      
      
    })
    const indexMark = markersData.indexOf(marker)
   
    allData.splice(index, 1)
    markersData.splice(indexMark , 1)
    localStorage.setItem("data", JSON.stringify(allData))
    localStorage.setItem("markers", JSON.stringify(markersData));

map.eachLayer(function (layer) {
  if (layer instanceof L.Marker) {
    map.removeLayer(layer);
  }
});

    getMarkStorage()
workout.remove()
  }
  else if (btn === 'editBtn') {
    if (mapEvent == undefined) {
      alert("You Can't Edit Now Try add new workout and edit later")
      return
    }
    const formData = allData[+id]
    form.classList.remove("hidden");
    inputDistance.value = formData.distance
    inputDuration.value = formData.duration
    inputSelect.value = formData.type
    inputType.value = formData[inputSelect.value === "cycling" ? "elevationGain" : "cadence"]
    editFlag = true
    globalIdx = id
  }
})
    
