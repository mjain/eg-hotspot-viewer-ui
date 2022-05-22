/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { MarkerClusterer } from "@googlemaps/markerclusterer";

// This import style requires "esModuleInterop", see "side notes"

import indiaJson from "./new_india1.json";
import usaJson from "./usa.json";

var maxCount = 0;
var minCount = 0;
var average = 0;
var counts = [];
var redZoneMinLimit = 20000;

function setTotalCount(locData) {
  for (var i = 0; i < locData.length; i++) {
    let json = locData[i];
    let tCount = getTotalCount(json);
    counts.push(tCount);
    json.totalBookings = tCount;
  }
}

function getTotalCount(json: object) {
  var startDate = (<HTMLInputElement>(
    document.getElementById("reportrangeStartDate")
  )).value;
  var startMonth = (<HTMLInputElement>(
    document.getElementById("reportrangeStartMonth")
  )).value;
  var startYear = (<HTMLInputElement>(
    document.getElementById("reportrangeStartYear")
  )).value;
  var endDate = (<HTMLInputElement>(
    document.getElementById("reportrangeEndDate")
  )).value;
  var endMonth = (<HTMLInputElement>(
    document.getElementById("reportrangeEndMonth")
  )).value;
  var endYear = (<HTMLInputElement>(
    document.getElementById("reportrangeEndYear")
  )).value;

  let bCount = json.bookingCount;
  let tCount = 0;

  if (startDate === undefined || startDate === "") {
    console.log("startDate is undefined");
    for (let x in bCount) {
      for (let y in bCount[x]) {
        tCount += bCount[x][y];
      }
    }
    return tCount;
  }

  console.log("startDate=" + startDate);
  console.log("startMonth=" + startMonth);
  console.log("startYear=" + startYear);
  console.log("endDate=" + endDate);
  console.log("endMonth=" + endMonth);
  console.log("endYear=" + endYear);

  for (let x in bCount) {
    var year = x.split("_")[1];
    var month = x.split("_")[0];
    if (year === startYear) {
      console.log("year === startYear");
      if (year === endYear) {
        console.log("year === endYear");
        if (month === startMonth) {
          if (startMonth === endMonth) {
            for (let y in bCount[x]) {
              if (y >= startDate && y <= endDate) {
                tCount += bCount[x][y];
              }
            }
          } else if (month === endMonth) {
            for (let y in bCount[x]) {
              if (y <= endDate) {
                tCount += bCount[x][y];
              }
            }
          } else if (month < endMonth) {
            for (let y in bCount[x]) {
              if (y >= startDate) {
                tCount += bCount[x][y];
              }
            }
          }
        } else if (month < startMonth) {
          continue;
        } else if (month > startMonth) {
          if (month === endMonth) {
            for (let y in bCount[x]) {
              if (y <= endDate) {
                tCount += bCount[x][y];
              }
            }
          } else if (month < endMonth) {
            for (let y in bCount[x]) {
              tCount += bCount[x][y];
            }
          }
        }
      } else if (year < endYear) {
        if (month === startMonth) {
          for (let y in bCount[x]) {
            if (y >= startDate) {
              tCount += bCount[x][y];
            }
          }
        } else if (month < startMonth) {
          continue;
        } else {
          for (let y in bCount[x]) {
            tCount += bCount[x][y];
          }
        }
      } else if (year > endYear) {
        continue;
      }
    } else if (year < startYear) {
      continue;
    } else if (year > startYear) {
      console.log("year > startYear");
      if (year === endYear) {
        if (month === endMonth) {
          for (let y in bCount[x]) {
            if (y <= endDate) {
              tCount += bCount[x][y];
            }
          }
        } else if (month > endMonth) {
          continue;
        } else if (month < endMonth) {
          for (let y in bCount[x]) {
            tCount += bCount[x][y];
          }
        }
      } else if (year < endYear) {
        console.log("year < endYear");
        for (let y in bCount[x]) {
          tCount += bCount[x][y];
        }
      } else if (year > endYear) {
        continue;
      }
    }
  }
  console.log("Total count=" + tCount);
  return tCount;
}

function sum(array) {
  var total = 0;
  for (var i = 0; i < array.length; i++) {
    total += array[i];
  }
  return total;
}

function mean(array) {
  var arraySum = sum(array);
  return arraySum / array.length;
}

function median(array) {
  array = array.sort();
  if (array.length % 2 === 0) {
    // array with even number elements
    return (array[array.length / 2] + array[array.length / 2 - 1]) / 2;
  } else {
    return array[(array.length - 1) / 2]; // array with odd number elements
  }
}

function getLocations() {
  setTotalCount(locations);
  locations.sort(compare);
  maxCount = locations[0].totalBookings;
  minCount = locations[locations.length - 1].totalBookings;
  average = parseInt((minCount + maxCount) / 2);
  console.log(minCount);
  console.log(maxCount);
  console.log(average);
  return locations;
}

function compare(a, b) {
  if (a.totalBookings < b.totalBookings) {
    return 1;
  }
  if (a.totalBookings > b.totalBookings) {
    return -1;
  }
  return 0;
}

function getFilteredLocations(minBookings: number, maxBookings: number) {
  var filteredLocations = [];
  for (var i = 0; i < locations.length; i++) {
    if (
      locations[i].totalBookings >= minBookings &&
      locations[i].totalBookings <= maxBookings
    ) {
      filteredLocations.push(locations[i]);
    }
  }
  setTotalCount(filteredLocations);
  filteredLocations.sort(compare);
  let max = filteredLocations[0].totalBookings;
  let min = filteredLocations[filteredLocations.length - 1].totalBookings;
  average = parseInt((min + max) / 2);
  console.log(min);
  console.log(max);
  console.log(average);

  redZoneMinLimit = 5000;

  return filteredLocations;
}

function changeRange() {
  $(function () {
    $("#slider-range").slider({
      range: true,
      min: minCount,
      max: maxCount,
      values: [minCount, maxCount],
      slide: function (event, ui) {
        $("#bookingRange").val(ui.values[0] + " - " + ui.values[1]);
        $("#bookingRangeMin").val(ui.values[0]);
        $("#bookingRangeMax").val(ui.values[1]);
      }
    });
    $("#bookingRange").val(
      $("#slider-range").slider("values", 0) +
        " - " +
        $("#slider-range").slider("values", 1)
    );
    $("#bookingRangeMin").val($("#slider-range").slider("values", 0));
    $("#bookingRangeMax").val($("#slider-range").slider("values", 1));
  });
}

const params = new URLSearchParams(window.location.search);
let searchParams = new URLSearchParams(params);
let searchedLocation = searchParams.get("country");

const locations =
  searchedLocation == null ||
  searchedLocation == "" ||
  searchedLocation == "India"
    ? indiaJson
    : usaJson;

const INDIA_BOUNDS = {
  north: 35.513327,
  south: 6.4626999,
  west: 68.1097,
  east: 97.395358699999991
};

var india = { lat: 20.5937, lng: 78.9629 };
var usa = { lat: 39.8097343, lng: -98.5556199 };
var uk = { lat: 51.509865, lng: -0.118092 };
var france = { lat: 46.2276, lng: 2.2137 };

const USA_BOUNDS = {
  north: 49.38,
  south: 25.82,
  west: -124.39,
  east: -66.94
};

var mapCenter =
  searchedLocation == null ||
  searchedLocation == "" ||
  searchedLocation == "India"
    ? india
    : usa;

var mapBounds =
  searchedLocation == null ||
  searchedLocation == "" ||
  searchedLocation == "India"
    ? INDIA_BOUNDS
    : USA_BOUNDS;

function reloadMap(data: object[]): void {
  data.sort(compare);

  const map = new google.maps.Map(
    document.getElementById("map") as HTMLElement,
    {
      zoom: 4,
      center: mapCenter,
      restriction: {
        latLngBounds: mapBounds,
        strictBounds: false
      }
    }
  );

  const infoWindow = new google.maps.InfoWindow({
    content: "test",
    disableAutoPan: true
  });

  // Add some markers to the map.
  const markers = data.map((position, i) => {
    const label = data[i].propertyName;
    const infoLabel = "Bookings: " + data[i].totalBookings;
    const contentString =
      '<div id="content">' +
      '<div id="siteNotice">' +
      "</div>" +
      '<h1 id="firstHeading" class="firstHeading">' +
      label +
      "," +
      infoLabel +
      "</h1>" +
      '<div id="bodyContent">' +
      "<br>City Descripition Comes here " +
      "</div>" +
      "</div>";

    const marker = new google.maps.Marker({
      position
    });

    marker.setTitle(String(data[i].totalBookings));
    marker.addListener("mouseover", function () {
      infoWindow.setContent(contentString);
      infoWindow.open(map, marker);
    });

    marker.addListener("click", function (event) {
      var x = document.getElementById("mySidenav");
      if (x.style.width == "" || x.style.width === "0px") {
        x.style.width = "350px";
        document.getElementById("booking-count").innerHTML =
          data[i].totalBookings;

        document.getElementById("destination-title").innerHTML =
          data[i].propertyName;
      } else {
        x.style.width = "0px";
      }

      fillTopDestinantionTable();

      function fillTopDestinantionTable() {
        const topDestinationTable = document.getElementById("top-destination");
        topDestinationTable.innerHTML = "";
        var header = topDestinationTable.createTHead();
        let row = header.insertRow();
        var tr = topDestinationTable.tHead.children[0],
          th = document.createElement("th");
        th.innerHTML = "Destination";
        tr.appendChild(th);
        th = document.createElement("th");
        th.innerHTML = "Bookings";
        tr.appendChild(th);

        for (let j = 0; j <= 10; j++) {
          let row = topDestinationTable.insertRow();
          let name = row.insertCell(0);
          name.innerHTML = data[j].propertyName;
          let count = row.insertCell(1);
          count.innerHTML = data[j].totalBookings;
        }
      }
    });

    marker.addListener("mouseout", function () {
      infoWindow.close();
    });

    if (data[i].totalBookings > average) {
      marker.setIcon("trending2.png");
    } else {
      marker.setIcon("trend.png");
    }

    return marker;
  });

  const renderer = {
    render: ({ count, position, markers }) => {
      let totalBooking = 0;
      for (let i = 0; i < markers.length; i++) {
        totalBooking += parseInt(markers[i].title);
      }
      const color = totalBooking > redZoneMinLimit ? "#ff0000" : "#0000ff";
      const svg = window.btoa(`
          <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
            <circle cx="120" cy="120" opacity=".6" r="70" />
            <circle cx="120" cy="120" opacity=".3" r="90" />
            <circle cx="120" cy="120" opacity=".2" r="110" />
          </svg>`);

      return new google.maps.Marker({
        icon: {
          url: `data:image/svg+xml;base64,${svg}`,
          scaledSize: new google.maps.Size(45, 45)
        },
        label: {
          text: String(totalBooking),
          color: "rgba(255,255,255,0.9)",
          fontSize: "12px"
        },
        title: `Total No of ${totalBooking} bookings in region.`,

        position,
        // adjust zIndex to be above other markers
        zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count
      });
    }
  };

  // Add a marker clusterer to manage the markers.
  var markerClusterer = new MarkerClusterer({ markers, map, renderer });

  markerClusterer.onClusterClick = function (event, cluster, map) {
    map.setZoom(map.zoom + 4);
    var markers = cluster.markers;

    map.setCenter(markers[0].getPosition());
  };

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      // Typical action to be performed when the document is ready:
      var response = xhttp.responseText;
    }
  };
  xhttp.open(
    "GET",
    "https://eg-context-service-lab.us-west-2.test.gcotechp.expedia.com/entityTypes",
    true
  );

  xhttp.send();

  // Create the DIV to hold the control and call the CenterControl()
  // constructor passing in this DIV.
  const centerControlDiv = document.createElement("div");

  CenterControl(centerControlDiv, map);

  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);
}
function initMap(): void {
  var form = <HTMLInputElement>document.getElementById("input4radio");

  var newRadio = document.createElement("input");
  newRadio.type = "radio";
  newRadio.id = "India";
  newRadio.name = "country";
  newRadio.value = "India";
  var newLabel = document.createElement("label");
  var t = document.createTextNode("India");
  newLabel.setAttribute("for", "India");
  form.appendChild(newRadio);
  form.appendChild(t);
  form.appendChild(document.createElement("br"));

  var newRadio1 = document.createElement("input");
  newRadio1.type = "radio";
  newRadio1.id = "USA";
  newRadio1.name = "country";
  newRadio1.value = "USA";
  var newLabel1 = document.createElement("label");
  var t = document.createTextNode("USA");
  newLabel1.setAttribute("for", "USA");
  form.appendChild(newRadio1);
  form.appendChild(t);
  form.appendChild(document.createElement("br"));

  reloadMap(getLocations());
}

document.getElementById("Submit")!.addEventListener("click", function () {
  $("#myModal").modal("hide");
  var min: number = parseInt(
    (<HTMLInputElement>document.getElementById("bookingRangeMin")).value
  );
  var max: number = parseInt(
    (<HTMLInputElement>document.getElementById("bookingRangeMax")).value
  );
  reloadMap(getFilteredLocations(min, max));
});

/**
 * The CenterControl adds a control to the map
 * This constructor takes the control DIV as an argument.
 * @constructor
 */
function CenterControl(controlDiv: Element, map: google.maps.Map) {
  // Set CSS for the control border.
  const controlUI = document.createElement("div");

  controlUI.style.backgroundColor = "#fff";
  controlUI.style.border = "2px solid #fff";
  controlUI.style.borderRadius = "3px";
  controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  controlUI.style.cursor = "pointer";
  controlUI.style.marginTop = "8px";
  controlUI.style.marginBottom = "22px";
  controlUI.style.textAlign = "center";
  controlUI.title = "Click to recenter the map";
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  const controlText = document.createElement("div");

  controlText.style.color = "rgb(25,25,25)";
  controlText.style.fontFamily = "Roboto,Arial,sans-serif";
  controlText.style.fontSize = "16px";
  controlText.style.lineHeight = "38px";
  controlText.style.paddingLeft = "5px";
  controlText.style.paddingRight = "5px";
  controlText.innerHTML = "Filters";
  controlUI.appendChild(controlText);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener("click", () => {
    $("#myModal").modal("show");
    changeRange();
  });
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;
export {};
