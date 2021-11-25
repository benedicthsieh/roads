var OFFSET = 50;
var WIDTH = 100;
var HEIGHT = 100;
var SPACING = 5;

var roads = [
  {x1: 10, y1: 20, x2:20, y2:30, level: 2.5, recentTravelers: 0 },
];

var travelers = [
  {
    location: {x: 10, y:10},
    goal: {x: 50, y: 0},
    lastPoint: {x: 10, y: 10},
    nextPoint: {x: 20, y: 0}
  },
];

function t(coordinate) {
  return OFFSET + coordinate * SPACING;
}

function findNextPoint(location, goal) {
  // TODO: replace this with road-based pathfinding
  var nextX = location.x;
  var nextY = location.y;

  if (goal.x > location.x) {
    nextX = location.x + 10;
  } else if (goal.x < location.x) {
    nextX = location.x - 10;
  }

  if (goal.y > location.y) {
    nextY = location.y + 10;
  } else if (goal.y < location.y) {
    nextY = location.y - 10;
  }

  // console.log("fnp", nextX, nextY);
  return {x: nextX, y: nextY};
}

function nextLocation(location, nextPoint) {
  var nextX = location.x;
  var nextY = location.y;

  if (nextPoint.x > location.x) {
    nextX = location.x + 1;
  } else if (nextPoint.x < location.x) {
    nextX = location.x - 1;
  }

  if (nextPoint.y > location.y) {
    nextY = location.y + 1;
  } else if (nextPoint.y < location.y) {
    nextY = location.y - 1;
  }

  // console.log("nl", location, nextPoint, nextX, nextY);
  return {x: nextX, y: nextY};
}

function updateTravelersAndRoads() {
  for (var i = 0; i < travelers.length; i++) {
    var traveler = travelers[i];
    var location = traveler.location;
    // Traveler at point
    if (Number.isInteger(location.x) && Number.isInteger(location.y)) {
      // TODO: improve last road
      // TODO: do some real pathfinding.
      traveler.lastPoint = location;
      traveler.nextPoint = findNextPoint(location, traveler.goal);
    }
    traveler.location = nextLocation(location, traveler.nextPoint);
  }
}

function setup() {
  createCanvas(1200, 1200);
  // point(t(0), t(0));
  frameRate(20);
}

function draw() {
  background(50);

  stroke(255);
  strokeWeight(10);

  for (var i = 0; i < WIDTH; i+= 10) {
    for (var j = 0; j < HEIGHT; j+= 10) {
      point(t(i), t(j));
    }
  }
  updateTravelersAndRoads();

  stroke("green");
  for (var i = 0; i < travelers.length; i++) {
    var location = travelers[i].location;
    point(t(location.x), t(location.y));
  }


  // for (var i = 0; i < roads.length; i++) {
  //   road = roads[i];
  //   strokeWeight(1 * road.level);
  //   line(t(road.x1), t(road.y1), t(road.x2), t(road.y2));
  // }
  // stroke("red");
  // strokeWeight(20);
}
