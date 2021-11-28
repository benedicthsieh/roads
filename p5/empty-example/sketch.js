var OFFSET = 50;
var WIDTH = 100;
var HEIGHT = WIDTH;
var SPACING = 5;

function roadKey(x, y, dx, dy) {
  return `${x},${y},${dx},${dy}`
}

function Road(x1, y1, x2, y2) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.level = 0;
  this.recentTravelers = 0;
}

function roadCost(road) {
  if (road.x1 == road.x2 || road.y1 == road.y2) {
    return Math.max(5 - road.level, 0);
  } else {
    return Math.max(5.4 - road.level, 0);
  }
}

// Populate a map of roads.
// Roads are the same going both ways, so there will be multiple references
// to the same object in this map.
var roads = {};
for (var x = 0; x < WIDTH; x += 10) {
  for (var y = 0; y < HEIGHT; y += 10) {
    for (var dx = -10; dx <= 10; dx += 10) {
      for (var dy = -10; dy <=10; dy += 10) {
        if (dx == 0 && dy == 0) {
          continue;
        }
        otherX = x + dx;
        otherY = y + dy;
        if (otherX < 0 || otherY < 0 || otherX >= WIDTH || otherY >= HEIGHT) {
          continue;
        }
        var road = roads[roadKey(otherX, otherY, dx * -1, dy * -1)];
        if (!road) {
          road = new Road(x, y, otherX, otherY);
        }
        roads[roadKey(x, y, dx, dy)] = road;
      }
    }
  }
}

function Traveler(startX, startY, goalX, goalY) {
  this.location = {x: startX, y: startY};
  this.goal = {x: goalX, y: goalY};
  this.lastPoint = null;
  this.nextPoint = findNextPoint(this.location, this.goal);
  this.active = true;
}

var travelers = [
  // {
  //   location: {x: 0, y:10},
  //   goal: {x: 50, y: 0},
  //   lastPoint: {x: 0, y: 10},
  //   nextPoint: {x: 20, y: 0}
  // },
  // new Traveler(0, 10, 50, 0),
  // new Traveler(20, 0, 30, HEIGHT - 10),
  // new Traveler(0, 30, 50, 0),
  // new Traveler(40, 0, 60, HEIGHT - 10),
];

function t(coordinate) {
  return OFFSET + coordinate * SPACING;
}

function findNextPointDijkstra(location, goal) {
  function pointKey(i, j) {
    return `${i},${j}`;
  }
  var costs = {};
  var backtrace = {};
  var pq = new PriorityQueue({comparator: function(a,b) {return a[1] - b[1];}});

  for (var i = 0; i < WIDTH; i+= 10) {
    for (var j = 0; j < HEIGHT; j+= 10) {
      if (location.x == i && location.y == j) {
        costs[pointKey(i,j)] = 0;
        pq.queue([[i,j], 0]);
      } else {
        costs[pointKey(i,j)] = Number.MAX_SAFE_INTEGER;
      }
    }
  }
  while (pq.length > 0) {
    var shortestStep = pq.dequeue();
    var currentPoint = shortestStep[0];
    var currX = currentPoint[0];
    var currY = currentPoint[1];
    if (currX == goal.x && currY == goal.y) {
      break;
    }

    for (var dx = -10; dx <= 10; dx += 10) {
      for (var dy = -10; dy <=10; dy += 10) {
        var neighborX = currentPoint[0] + dx;
        var neighborY = currentPoint[1] + dy;
        if (dx == 0 && dy == 0
          || neighborX < 0 || neighborX >= WIDTH
          || neighborY < 0 || neighborY >= HEIGHT
        ) {
          continue;
        }
        var nKey = pointKey(neighborX, neighborY);
        var cKey = pointKey(currentPoint[0], currentPoint[1]);
        var road = roads[roadKey(currX, currY, dx, dy)];
        var cost = costs[cKey] + roadCost(road);

        if (cost < costs[nKey]) {
          costs[nKey] = cost;
          backtrace[nKey] = currentPoint;
          pq.queue([[neighborX, neighborY], cost]);
        }
      }
    }
  }
  let path = [[goal.x, goal.y]];
  let lastStep = [goal.x, goal.y];

  let i2 = 0;
  while(lastStep[0] != location.x || lastStep[1] != location.y) {
    path.unshift(backtrace[lastStep]);
    lastStep = backtrace[lastStep];
  }
  nextStep = path[1];
  // console.log(`Path is ${path}, Next step is ${nextStep}`);
  return {x: nextStep[0], y: nextStep[1]};
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
  for (var j = travelers.length - 1; j >= 0; j--) {
    if (!travelers[j].active) {
      travelers.splice(j, 1);
    }
  }

  for (var i = 0; i < travelers.length; i++) {
    var traveler = travelers[i];
    if (!traveler.active) {
      continue;
    }
    var location = traveler.location;
    // Traveler at point
    if (location.x % 10 == 0 && location.y % 10 == 0) {
      // Improve last road
      lp = traveler.lastPoint;
      np = traveler.nextPoint;
      if (lp) {
        var traveledRoad = roads[roadKey(lp.x, lp.y, np.x - lp.x, np.y - lp.y)];
        traveledRoad.level += 1;
      }
      if (location.x == traveler.goal.x && location.y == traveler.goal.y) {
        // Traveler has arrived.
        traveler.active = false;
        continue;
      }
      traveler.lastPoint = location;
      // traveler.nextPoint = findNextPoint(location, traveler.goal);
      traveler.nextPoint = findNextPointDijkstra(location, traveler.goal);
    }
    traveler.location = nextLocation(location, traveler.nextPoint);
  }
}

function setup() {
  createCanvas(1200, 1200);
  // point(t(0), t(0));
  frameRate(20);
}

function randomEdgeTraveler() {
  let edgeZeroRandom = Math.random() * 4;
  let edgeOffsetRandom = Math.floor(Math.random() * WIDTH / 10) * 10;
  let startX, startY, endX, endY;

  if (edgeZeroRandom > 3) {
    startX = 0;
    startY = edgeOffsetRandom;
  } else if (edgeZeroRandom > 2) {
    startX = WIDTH - 10;
    startY = edgeOffsetRandom;
  } else if (edgeZeroRandom > 1) {
    startY = 0;
    startX = edgeOffsetRandom;
  } else {
    startY = HEIGHT - 10;
    startX = edgeOffsetRandom;
  }

  edgeZeroRandom = Math.random() * 4;
  edgeOffsetRandom = Math.floor(Math.random() * WIDTH / 10) * 10;
  if (edgeZeroRandom > 3) {
    endX = 0;
    endY = edgeOffsetRandom;
  } else if (edgeZeroRandom > 2) {
    endX = WIDTH - 10;
    endY = edgeOffsetRandom;
  } else if (edgeZeroRandom > 1) {
    endY = 0;
    endX = edgeOffsetRandom;
  } else {
    endY = HEIGHT - 10;
    endX = edgeOffsetRandom;
  }
  console.log(startX, startY, endX, endY);
  return new Traveler(startX, startY, endX, endY);
}

function degradeRoads(){
  for (const [key, road] of Object.entries(roads)) {
    if (Math.random() > 0.8) {
      road.level = Math.floor(road.level * 0.5);
    }
  }
}

var tick = 0;
function draw() {
  background(50);

  stroke(100);
  if (tick % 300 == 0) {
    degradeRoads();
  }
  for (const [key, road] of Object.entries(roads)) {
    strokeWeight(2 * road.level);
    line(t(road.x1), t(road.y1), t(road.x2), t(road.y2));
  }

  stroke(255);
  strokeWeight(10);
  for (var i = 0; i < WIDTH; i+= 10) {
    for (var j = 0; j < HEIGHT; j+= 10) {
      point(t(i), t(j));
    }
  }

  if (tick % 30 == 0) {
    travelers.push(randomEdgeTraveler());
  }
  updateTravelersAndRoads();
  stroke(255);
  stroke("green");
  strokeWeight(10);
  for (var i = 0; i < travelers.length; i++) {
    var location = travelers[i].location;
    point(t(location.x), t(location.y));
  }
  tick++;
}
