// Make an instance of two and place it on the page.

//circle x = particle.circle.position.x
//circle y = particle.circle.position.y


/*var elem = document.body;
var two = new Two({fullscreen: true}).appendTo(elem);*/

window.addEventListener("resize", function() {
    document.getElementById("life").height = innerHeight
    document.getElementById("life").width = innerWidth
})

document.getElementById("life").height = innerHeight
document.getElementById("life").width = innerWidth
let canvas = document.getElementById("life")
m = canvas.getContext("2d")

let draw = (x, y, r, colour, v) => {
    m.fillStyle = "white"
    m.strokeStyle = "white"
    m.fillStyle = colour
    m.beginPath();
    m.arc(x, y, r, 0, 2 * Math.PI, false);
    m.fill();
    /*m.moveTo(x, y)
    m.lineTo((x+20*(v.x)), (y+20*(v.y)))*/
}


//buttons code

// Function to get the mouse position
function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }
  
  // Function to check whether a point is inside a rectangle
  function isInside(pos, rect) {
    return pos.x > rect.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.height && pos.y > rect.y
  }
  
  // Binding the click event on the canvas
  canvas.addEventListener('click', function(evt) {
    var mousePos = getMousePos(canvas, evt);

    for (let j = 0; j<buttons.length; j++) {
        if (isInside(mousePos, buttons[j])) {
            btnFunc(buttons[j])
        }
    }

  }, false);
  
  // Question code
  function Playbutton(rect) {
    m.beginPath();
    m.rect(rect.x, rect.y, rect.width, rect.height);
    m.fillStyle = 'rgba(225,225,225,0.5)';
    m.fill();
    m.lineWidth = 2;
    m.closePath();
    m.font = `${rect.height}px Kremlin Pro Web`;
    m.fillStyle = 'white';
    if (rect.vals[rect.state] != undefined) {m.fillText(rect.vals[rect.state], rect.x + rect.width / 7, rect.y + rect.height/1.3)};
  }

  let boolToBinaryConverter = (bool) => {
    if (bool == false) {
        return 0
    }
    else {
        return 1
    }
}

//variables

let reactionForce = false //controls whether reactions create a repulsion force
let reactions = false //controls whether reactions can happen

let forces = []
let minDistances = []
let radii = []
let colDistances = []

let ruleType = "symmetric" //type of rule that is used
let constantGravity = true // whether settings are constant for all colours

  
let buttons = [
    {
        type: "boolean",
        name: "reactions", //variable that the button controls
        x: 3,
        y: 160,
        width: 50,
        height: 20,
        vals: [false, true],
        state: boolToBinaryConverter(reactions),
    },
    {
        type: "boolean",
        name: "reactionForce",
        x: 3,
        y: 200,
        width: 50,
        height: 20,
        vals: [false, true],
        state: boolToBinaryConverter(reactionForce),
    },
    {
        type: "boolean",
        name: "constantGravity",
        x: 3,
        y: 240,
        width: 50,
        height: 20,
        vals: [false, true],
        state: boolToBinaryConverter(constantGravity),
    },
    {
        type: "scroll",
        name: "ruleType",
        x: 3,
        y: 280,
        width: 50,
        height: 20,
        vals: ["random", "symmetric"],
        state: boolToBinaryConverter(constantGravity),
    },
]

let btnFunc = (btn) => {
    if (btn.type == "boolean") {
        btn.state = (btn.state+1)%2
        console.log(btn.state, btn.name)
        eval(btn.name + ' = !' + btn.name);
        if (["constantGravity"].includes(btn.name)) {
            setParameters()
            console.log(eval(`${btn.name}`))
            console.log(radii)
        }
    }
}

let particles = []

let particle = (x, y, c) => {
    let size = 1
    return {"x": x, "y": y, "v":{"x":0, "y":0}, "m":size, "r":5, "colour":c}
}

let randomSign = () => {
    if (Math.random() >= 0.5) {
        return -1
    }
    else {
        return 1
    }
}

let generateStripes = (colour, sections, totalSections) => {
    let sectionX = innerHeight/numColours/2
    let sectionY = innerHeight/numColours/2

    if (randomSign() > 0) {
        if (randomSign() > 0) { //left edge
            return [randomNum(sectionX*(cols[colour]), sectionX*(cols[colour]+1)), //x
            randomNum(sectionY*(cols[colour])+sectionY, innerHeight-(sectionY*(cols[colour])))] //y
        }
        else { //right edge
            return [innerWidth-randomNum(sectionX*(cols[colour]), sectionX*(cols[colour]+1)), //x
            randomNum(sectionY*(cols[colour]), innerHeight-(sectionY*(cols[colour]))-sectionY)] //y
        }
        
    }
    else {
        if (randomSign() > 0) { //top (?) edge
            return [randomNum(sectionX*(cols[colour]), innerWidth-(sectionX*(cols[colour]))), //x
            randomNum(sectionY*(cols[colour]), sectionY*(cols[colour]+1))] //y
        }
        else { //bottom (?) edge
            return [randomNum(sectionX*(cols[colour]), innerWidth-(sectionX*(cols[colour]))), //x
            innerHeight-randomNum(sectionY*(cols[colour]), sectionY*(cols[colour]+1))] //y
        }
    }

}

let randomCoords = (colour, type) => {
    if (type == "random"){
        return [Math.random()*innerWidth, Math.random()*innerHeight]
    }
    if (type == "middle") {
        return [(innerWidth/2)+randomNum(-1, 1), (innerHeight/2)+randomNum(-1, 1)]
    }
    if (type == "colours") {
        return generateStripes(colour)
    }
    if (type = "fourmiddles") {
        if (randomSign() > 0) {
            if (randomSign() > 0) {
                return [innerWidth*0.25+randomNum(-1, 1), innerHeight*0.25+randomNum(-1, 1)]
            }
            else {
                return [innerWidth*0.25+randomNum(-1, 1), innerHeight*0.75+randomNum(-1, 1)]
            }
        }
        else {
            if (randomSign() > 0) {
                return [innerWidth*0.75+randomNum(-1, 1), innerHeight*0.75+randomNum(-1, 1)]
            }
            else {
                return [innerWidth*0.75+randomNum(-1, 1), innerHeight*0.25+randomNum(-1, 1)]
            }
        }
    }
}

//function for random force

let randomVal = function() {
    if (Math.random >= 0.5) {
        return (Math.random()*0.7)+0.3
    }
    else {
        return -(Math.random()*0.7)+0.3
    }
}

let randomNum = function(min, max) {
    return Math.random() * (max - min) + min
}

let create = (number, colour, type) => {
    groups.push([colour, number])
    group = []
    for (let i = 0; i<number; i++) {
        let coords = randomCoords(colour, type)
        group.push(particle(coords[0], coords[1], colour))
        particles.
        push(group[i])
    }
}

let numColours = 3
let maxNumColours = 7

let cols = {
    "red":0,
    "orange":1,
    "yellow":2,
    "green":3,
    "blue":4,
    "purple":5,
    "white":6
}

let num = Math.floor(400/numColours)
let distribution = "random" //middle, random, colours, fourmiddles

let groups = []

let red = create(num, "red", distribution)
let orange = create(num, "orange", distribution)
let yellow = create(num, "yellow", distribution)
/*let green = create(num, "green", distribution)
let blue = create(0, "blue", distribution)
let purple = create(num, "purple", distribution)
let white = create(num, "white", distribution)*/

numColours = groups.length

let colsCount = []

for (let a = 0; a<maxNumColours; a++) {
    colsCount.push(groups[a] == undefined ? 0 : groups[a][1])
}

function scale (number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

let minDist = 10
let factor = 1

let k = 0.05
let timeFactor = 25

let friction = 0.85

let rule = () => {
    for (let i = 0; i<particles.length; i++) {

        let a = particles[i]

        let acol = cols[a.colour] // int of colour

        let dir = {"x": 0, "y": 0}
        let totalForce = {"x": 0, "y": 0}
        let acceleration = {"x": 0, "y": 0}
        let dist

        for (let o = 0; o<particles.length; o++) {

            if (i == o){continue}

            let b = particles[o]

            let bcol = cols[b.colour] // int of colour

            //dir = CHANGE IN Y AND CHANGE IN X

            dir = {"x": a.x-b.x, "y": a.y-b.y}

            if (dir.x > 0.5*innerWidth){
                dir.x -= innerWidth
            }
            if (dir.x < -0.5 * innerWidth){
                dir.x += innerWidth
            }
            if (dir.y > 0.5*innerHeight) {
                dir.y -= innerHeight
            }
            if (dir.y < -0.5*innerHeight) {
                dir.y += innerHeight
            }

            dist = Math.sqrt(dir.x*dir.x + dir.y*dir.y)

            if (dist == 0){dist += randomNum(-0.0000001, 0.0000001)} // avoids division by 0

            dir.x /= dist
            dir.y /= dist

            if (dist <= minDistances[acol][bcol] /*&& dist >=colDistances*/) {
                let f = {...dir}
                f.x *= forces[acol][bcol]*-3
                f.y *= forces[acol][bcol]*-3

                //console.log("HERE", f)
                //console.log(i, o, "DIR:", dir, "DIST:", dist)

                //f.x = scale(f.x, 0, minDistances[acol][bcol], 0, 1) *timeFactor*k
                //f.y = scale(f.y, 0, minDistances[acol][bcol], 0, 1) *timeFactor*k

                totalForce.x += f.x
                totalForce.y += f.y
            }
            if (dist < radii[acol][bcol] && dist >= minDistances[acol][bcol]){

                let f = {...dir}
                f.x *= forces[acol][bcol]
                f.y *= forces[acol][bcol]

                f.x = scale(f.x, 0, minDistances[acol][bcol], 0, 1)  *timeFactor*k
                f.y = scale(f.y, 0, minDistances[acol][bcol], 0, 1)  *timeFactor*k

                totalForce.x += f.x
                totalForce.y += f.y
            }
            if (dist < colDistances[acol][bcol] && reactions) {

                let cola = a["colour"]
                let colb = b["colour"]

                if (cola != undefined && colTables[cola] != undefined) {

                    if (colTables[cola][colb] != "none") {
                        colsCount[acol] -= 1
                        colsCount[bcol] -= 1
                    }

                    a.colour = colTables[cola][colb] == "none" ? a.colour : colTables[cola][colb][0]
                    b.colour = colTables[cola][colb] == "none" ? b.colour : colTables[cola][colb][1]

                    if (colTables[cola][colb] != "none") {
                        colsCount[cols[a.colour]] += 1
                        colsCount[cols[b.colour]] += 1
                    }

                    if (colTables[cola][colb] != "none" && reactionForce == true) {
                        totalForce.x += randomNum(0, 20) * Math.sign(randomNum(-1, 1))
                        totalForce.y += randomNum(0, 20) * Math.sign(randomNum(-1, 1))
                    }
                    
                }
            }

        }
        acceleration.x += totalForce.x/a.m
        acceleration.y += totalForce.y/a.m

        a.v.x += acceleration.x
        a.v.y += acceleration.y

        a.x += a.v.x
        a.y += a.v.y

        a.x = (a.x+innerWidth)%innerWidth
        a.y = (a.y+innerHeight)%innerHeight

        a.v.x *= friction
        a.v.y *= friction

        //console.log(totalForce, acceleration, a.v, a.x, a.y)

    }

}

//yellow and red
//purple and green

colTables = {
    "yellow": {
        "yellow":["red", "red"], "red":"none", "blue":"none", "green":"none", "purple":"none", "orange":"none", "white": "none"
    },

    "red": {
        "yellow":"none", "red":"none", "blue":"none", "green":"none", "purple":"none", "orange":"none", "white": "none"
    },

    "blue": {
        "yellow":"none", "red":"none", "blue":"none", "green":"none", "purple":"none", "orange":"none", "white": "none"
    },

    "green": {
        "yellow":"none", "red":"none", "blue":"none", "green":"none", "purple":"none", "orange":"none", "white": "none"
    },

    "purple": {
        "yellow":"none", "red":"none", "blue":"none", "green":"none", "purple":"none", "orange":"none", "white": "none"
    },

    "orange": {
        "yellow":"none", "red":"none", "blue":"none", "green":"none", "purple":"none", "orange":"none", "white": "none"
    },

    "white": {
        "yellow":"none", "red":"none", "blue":"none", "green":"none", "purple":"none", "orange":"none", "white": "none"
    },


}

//clean tablle:
/*
    "yellow": {
        "yellow":"none", "red":"none", "blue":"none", "green":"none", "purple":"none", "orange":"none", "white": "none"
    },

    "red": {
        "yellow":"none", "red":"none", "blue":"none", "green":"none", "purple":"none", "orange":"none", "white": "none"
    },

    "blue": {
        "yellow":"none", "red":"none", "blue":"none", "green":"none", "purple":"none", "orange":"none", "white": "none"
    },

    "green": {
        "yellow":"none", "red":"none", "blue":"none", "green":"none", "purple":"none", "orange":"none", "white": "none"
    },

    "purple": {
        "yellow":"none", "red":"none", "blue":"none", "green":"none", "purple":"none", "orange":"none", "white": "none"
    },

    "orange": {
        "yellow":"none", "red":"none", "blue":"none", "green":"none", "purple":"none", "orange":"none", "white": "none"
    },

    "white": {
        "yellow":"none", "red":"none", "blue":"none", "green":"none", "purple":"none", "orange":"none", "white": "none"
    },
*/

function setParameters() {

    forces = []
    minDistances = []
    radii = []
    colDistances = []

    for (let i = 0; i<numColours; i++) {
        forces.push([])
        minDistances.push([])
        radii.push([])
        colDistances.push([])
        for (let o = 0; o<numColours; o++) {
            minDistances[i].push(randomNum(10, 60)) // 20 50
            radii[i].push(randomNum(70, 250)) //30 100
            colDistances[i].push(randomNum(10, 50))

            forces[i].push(randomVal())
        }
    }
    /*if (symmetricRules) {
        for (let i = 0; i<numColours/2; i++) {
            for (let o = 0; o<numColours/2; o++) {
                minDistances[i][o] = minDistances[o][i]
                radii[i][o] = radii[o][i]
                colDistances[i][o] = colDistances[o][i]
    
                forces[i][o] = forces[o][i]
            }
        }
    }*/
    if (constantGravity) {
        for (let i = 0; i<numColours; i++) {
            for (let o = 0; o<numColours; o++) {
                minDistances[i][o] = 100
                radii[i][o] = 1000
                colDistances[i][o] = 1
    
                forces[i][o] = -1
            }
        }
    }
}

console.log(forces, minDistances, radii, colDistances)

function displayArray(arr){
    console.log(arr)
    console.log(Object.keys({arr})[0])
    for (let i = 0; i<numColours; i++) {
        let str = ""
        for (let o = 0; o<numColours; o++) {
            str += arr[i][o] + " "
        }
    }
}

let update = () => {

    rule()

    m.clearRect(0, 0, innerWidth, innerHeight)
    m.fillStyle = "black"
    m.fillRect(0, 0, innerWidth, innerHeight)

    for (let i = 0; i<particles.length; i++) {
        draw(particles[i].x, particles[i].y, particles[i].r, particles[i].colour, particles[i].v)
    }

    for (let key in cols) { //prints particle counts
        let fontsize = 15
        m.fillStyle = key
        m.strokeStyle = "white"
        m.font = `${fontsize}px Arial`
        m.fillText(`${key}: ${colsCount[cols[key]]}`, 2, fontsize*cols[key]+fontsize)
        m.strokeText(`${key}: ${colsCount[cols[key]]}`, 2, fontsize*cols[key]+fontsize)
    }

    for (let j = 0; j<buttons.length; j++) {
        m.strokeStyle = "white"
        m.font = `15px Arial`
        m.strokeText(buttons[j].name, 2, buttons[j].y-5)
        Playbutton(buttons[j])
    }

    requestAnimationFrame(update)
}

setParameters()


displayArray(forces)
displayArray(minDistances)
displayArray(radii)

update()

/*/ Bind a function to scale and rotate the group to the animation loop.
two.bind('update', update);
// Finally, start the animation loop
two.play();

function update(frameCount) {
  // This code is called every time two.update() is called.
  rule(yellow, yellow)
}*/