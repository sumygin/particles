// ============================================================================
// Canvas + Context Setup
// ============================================================================

const canvas = document.getElementById("life");
const m = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ============================================================================
// Utility / Drawing
// ============================================================================

let drawTree = false

const draw = (x, y, r, colour, v) => {
    m.fillStyle = colour;
    m.beginPath();
    m.arc(x, y, r, 0, 2 * Math.PI);
    m.fill();
};

function drawBox(x1, y1, x2, y2) {
    const width  = x2 - x1;
    const height = y2 - y1;

    m.strokeStyle = "white"

    m.beginPath();
    m.rect(x1, y1, width, height);
    m.stroke();
}

function drawQuadtree(node) {
    // draw this node's bounding box
    drawBox(node.x1, node.y1, node.x2, node.y2);

    // recursively draw children if they exist
    if (!node.children) return;

    for (let i = 0; i < node.children.length; i++) {
        drawQuadtree(node.children[i]);
    }
}

function drawParticlesBatch(particles, colour) {
    m.fillStyle = colour;
    m.beginPath();
    for (let i = 0; i < particles.length; i++) {
        m.moveTo(particles[i].x + particles[i].r, particles[i].y);
        m.arc(particles[i].x, particles[i].y, particles[i].r, 0, 2 * Math.PI);
    }
    m.fill();
}

const scale = (number, inMin, inMax, outMin, outMax) =>
    (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

const randomNum = (min, max) => Math.random() * (max - min) + min;

const randomSign = () => (Math.random() >= 0.5 ? -1 : 1);

const randomVal = () => {
    if (Math.random() >= 0.5) {
        return Math.random() * 0.7 + 0.3;
    } else {
        return -(Math.random() * 0.7 + 0.3);
    }
};

const boolToBinaryConverter = bool => (bool === false ? 0 : 1);

// ============================================================================
// Mouse / Button Handling
// ============================================================================

function getMousePos(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function isInside(pos, rect) {
    return (
        pos.x > rect.x &&
        pos.x < rect.x + rect.width &&
        pos.y > rect.y &&
        pos.y < rect.y + rect.height
    );
}

canvas.addEventListener("click", evt => {
    const mousePos = getMousePos(canvas, evt);
    for (let j = 0; j < buttons.length; j++) {
        if (isInside(mousePos, buttons[j])) {
            btnFunc(buttons[j]);
        }
    }
});

function Playbutton(rect) {
    m.beginPath();
    m.rect(rect.x, rect.y, rect.width, rect.height);
    m.fillStyle = "rgba(225,225,225,0.5)";
    m.fill();
    m.closePath();

    m.font = `${rect.height}px Kremlin Pro Web`;
    m.fillStyle = "white";

    if (rect.vals[rect.state] !== undefined) {
        m.fillText(
            rect.vals[rect.state],
            rect.x + rect.width / 7,
            rect.y + rect.height / 1.3
        );
    }
}

// ============================================================================
// Global Flags / Parameters
// ============================================================================

let reactionForce = true;
let reactions = true;
let ruleType = "symmetric";

let forces = [];
let minDistances = [];
let radii = [];
let colDistances = [];
let wrap = true

// ============================================================================
// Buttons
// ============================================================================

let buttons = [
    {
        type: "boolean",
        name: "reactions",
        x: 3,
        y: 160,
        width: 50,
        height: 20,
        vals: [false, true],
        state: boolToBinaryConverter(reactions)
    },
    {
        type: "boolean",
        name: "reactionForce",
        x: 3,
        y: 200,
        width: 50,
        height: 20,
        vals: [false, true],
        state: boolToBinaryConverter(reactionForce)
    },
    /*{
        type: "scroll",
        name: "ruleType",
        x: 3,
        y: 280,
        width: 50,
        height: 20,
        vals: ["random", "symmetric"],
        state: "HELLO"
    },*/
    {
        type: "boolean",
        name: "drawTree",
        x: 3,
        y: 320,
        width: 50,
        height: 20,
        vals: [false, true],
        state: boolToBinaryConverter(drawTree)
    },
    {
        type: "boolean",
        name: "wrap",
        x: 3,
        y: 360,
        width: 50,
        height: 20,
        vals: [false, true],
        state: boolToBinaryConverter(wrap)
    },
];

const btnFunc = btn => {
    if (btn.type === "boolean") {
        btn.state = (btn.state + 1) % 2;
        eval(`${btn.name} = !${btn.name}`);

    }
};

// ============================================================================
// Particle System
// ============================================================================

let particles = [];

let particleRadius = 2

const particle = (x, y, c, m) => ({
    x,
    y,
    v: { x: 0, y: 0 },
    m: 1,
    r: particleRadius,
    colour: c
});

const generateStripes = colour => {
    const sectionX = innerHeight / numColours / 2;
    const sectionY = innerHeight / numColours / 2;

    if (randomSign() > 0) {
        if (randomSign() > 0) {
            return [
                randomNum(sectionX * cols[colour], sectionX * (cols[colour] + 1)),
                randomNum(sectionY * cols[colour] + sectionY, innerHeight - sectionY * cols[colour])
            ];
        } else {
            return [
                innerWidth - randomNum(sectionX * cols[colour], sectionX * (cols[colour] + 1)),
                randomNum(sectionY * cols[colour], innerHeight - sectionY * cols[colour] - sectionY)
            ];
        }
    } else {
        if (randomSign() > 0) {
            return [
                randomNum(sectionX * cols[colour], innerWidth - sectionX * cols[colour]),
                randomNum(sectionY * cols[colour], sectionY * (cols[colour] + 1))
            ];
        } else {
            return [
                randomNum(sectionX * cols[colour], innerWidth - sectionX * cols[colour]),
                innerHeight - randomNum(sectionY * cols[colour], sectionY * (cols[colour] + 1))
            ];
        }
    }
};

const randomCoords = (colour, type) => {
    if (type === "random") return [Math.random() * innerWidth, Math.random() * innerHeight];
    if (type === "middle") return [innerWidth / 2 + randomNum(-1, 1), innerHeight / 2 + randomNum(-1, 1)];
    if (type === "colours") return generateStripes(colour);

    if (type = "fourmiddles") {
        if (randomSign() > 0) {
            return randomSign() > 0
                ? [innerWidth * 0.25 + randomNum(-1, 1), innerHeight * 0.25 + randomNum(-1, 1)]
                : [innerWidth * 0.25 + randomNum(-1, 1), innerHeight * 0.75 + randomNum(-1, 1)];
        } else {
            return randomSign() > 0
                ? [innerWidth * 0.75 + randomNum(-1, 1), innerHeight * 0.75 + randomNum(-1, 1)]
                : [innerWidth * 0.75 + randomNum(-1, 1), innerHeight * 0.25 + randomNum(-1, 1)];
        }
    }
};

// ============================================================================
// Physics Rules
// ============================================================================

let k = 0.05;
let timeFactor = 1;
let globalFriction = 0.8
let friction = globalFriction

const numParticles = 5000;

let spacing = Math.sqrt((canvas.width*canvas.height) / numParticles)

let radiusScale = randomNum(4, 10)

function setParameters() {
    forces = [];
    minDistances = [];
    radii = [];
    colDistances = [];

    const minDistMin = particleRadius
    const minDistMax = particleRadius

    const radiusMin = particleRadius*2  +spacing * 0.5;
    const radiusMax = particleRadius*2  +spacing * radiusScale;

    const colDistMin = spacing * 0.2;
    const colDistMax = spacing * 0.6;

    for (let i = 0; i < numColours; i++) {
        forces.push([]);
        minDistances.push([]);
        radii.push([]);
        colDistances.push([]);
        for (let o = 0; o < numColours; o++) {
            minDistances[i].push(randomNum(minDistMin, minDistMax)) 
            radii[i].push(randomNum(radiusMin, radiusMax))
            colDistances[i].push(randomNum(colDistMin, colDistMax));
            forces[i].push(randomVal());
        }

    }
}

// ============================================================================
// Quadtree
// ============================================================================

let maxDepth = 5

class Quadtree{
    constructor(x1, x2, y1, y2, d) {
        [this.x1, this.x2, this.y1, this.y2] = [x1, x2, y1, y2]
        this.particles = []
        this.leaf = false
        this.depth = d
        this.avgx = (this.x2 + this.x1)/2
        this.avgy = (this.y1 + this.y2)/2

        if (this.depth == maxDepth) {
            this.leaf = true
        }
    }

    insert(particle) {
        if (this.leaf) {
            this.particles.push(particle)
        }
        else {
            if (!this.children || this.children.length == 0) {
                this.divide()
            }
            if (particle.x > this.avgx) {
                if (particle.y > this.avgy) {
                    this.children[3].insert(particle)
                }
                else {
                    this.children[1].insert(particle)
                }
            }
            else {
                if (particle.y > this.avgy) {
                    this.children[2].insert(particle)
                }
                else {
                    this.children[0].insert(particle)
                }
            }
        }
    }

    query(box, list) {
        if (this.leaf) {
            for (const a of this.particles) {
                list.push(a)
            }
        }
        if (this.children) {
            for (let child of this.children) {
                if (squaresCollide(child, box)) {
                    child.query(box, list)
                }
            }
        }
    }

    divide() {
        this.children = [
            new Quadtree(this.x1, this.avgx, this.y1, this.avgy, this.depth+1), //1     1 | 2
            new Quadtree(this.avgx, this.x2, this.y1, this.avgy, this.depth+1), //2     --+--
            new Quadtree(this.x1, this.avgx, this.avgy, this.y2, this.depth+1), //3     3 | 4 
            new Quadtree(this.avgx, this.x2, this.avgy, this.y2, this.depth+1), //4
        ]
    }
}

let ghostRadius = 20

function buildTree() {
    mainTree = new Quadtree(0, canvas.width, 0, canvas.height, 0)
    for (const p of particles) {
        // insert real particle
        mainTree.insert(p);

        // LEFT / RIGHT
        if (p.x < ghostRadius) {
            mainTree.insert({ ...p, x: p.x + innerWidth });
        }
        if (p.x > innerWidth - ghostRadius) {
            mainTree.insert({ ...p, x: p.x - innerWidth });
        }

        // TOP / BOTTOM
        if (p.y < ghostRadius) {
            mainTree.insert({ ...p, y: p.y + innerHeight });
        }
        if (p.y > innerHeight - ghostRadius) {
            mainTree.insert({ ...p, y: p.y - innerHeight });
        }

        // CORNERS
        if (p.x < ghostRadius && p.y < ghostRadius) {
            mainTree.insert({ ...p, x: p.x + innerWidth, y: p.y + innerHeight });
        }
        if (p.x < ghostRadius && p.y > innerHeight - ghostRadius) {
            mainTree.insert({ ...p, x: p.x + innerWidth, y: p.y - innerHeight });
        }
        if (p.x > innerWidth - ghostRadius && p.y < ghostRadius) {
            mainTree.insert({ ...p, x: p.x - innerWidth, y: p.y + innerHeight });
        }
        if (p.x > innerWidth - ghostRadius && p.y > innerHeight - ghostRadius) {
            mainTree.insert({ ...p, x: p.x - innerWidth, y: p.y - innerHeight });
        }
    }
}

function squaresCollide(a, b) {
    // a and b have {x1, x2, y1, y2}
    return !(
        a.x2 < b.x1 ||  // a is left of b
        a.x1 > b.x2 ||  // a is right of b
        a.y2 < b.y1 ||  // a is above b
        a.y1 > b.y2     // a is below b
    );
}


let mainTree = new Quadtree(0, canvas.width, 0, canvas.height, 0)

// ============================================================================
// Colours / Groups
// ============================================================================

let numColours = 5;
let maxNumColours = 7;

let cols = {
    red: 0,
    orange: 1,
    yellow: 2,
    green: 3,
    blue: 4,
    purple: 5,
    white: 6
};

let groups = [];
let particlesColours = []

const create = (number, colour, type) => {
    groups.push([colour, number]);
    particlesColours[colour] = []
    let group = [];

    for (let i = 0; i < number; i++) {
        const coords = randomCoords(colour, type);
        let newParticle = particle(coords[0], coords[1], colour, cols[colour])
        group.push(newParticle);
        particles.push(newParticle)
        particlesColours[colour].push(newParticle)
    }
};

buildTree(mainTree, particles)

let num = Math.floor(numParticles / numColours);
let distribution = "random"; //random, middle, fourmiddles, colours 

create(num, "red", distribution);
create(num, "orange", distribution);
create(num, "yellow", distribution);
create(num, "green", distribution);
create(num, "blue", distribution);
//create(num, "purple", distribution);
//create(num, "pink", distribution);

numColours = groups.length;

let colsCount = [];
for (let a = 0; a < maxNumColours; a++) {
    colsCount.push(groups[a] === undefined ? 0 : groups[a][1]);
}

// ============================================================================
// Main Rule Loop
// ============================================================================


const rule = () => {
    let totalRangeQuery = 0
    let totalNumRangeQueries = particles.length

    for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        const acol = cols[a.colour];

        let totalForce = { x: 0, y: 0 }

        const maxForceRadius = Math.max(...radii[acol])

        let boundingSquare = {
            x1: a.x - maxForceRadius,
            y1: a.y - maxForceRadius,
            x2: a.x + maxForceRadius,
            y2: a.y + maxForceRadius
        }

        let checkList = []
        mainTree.query(boundingSquare, checkList)

        totalRangeQuery += checkList.length

        for (let o = 0; o < checkList.length; o++) {
            const b = checkList[o];
            if (a === b) continue;

            // displacement vector
            let dir = { x: b.x - a.x, y: b.y - a.y };
            let distsquare = dir.x * dir.x + dir.y * dir.y;

            if (distsquare > maxForceRadius * maxForceRadius) continue;

            const bcol = cols[b.colour];

            


            let dist = Math.sqrt(distsquare);
            if (dist === 0) dist += randomNum(-1e-7, 1e-7);

            // normalize direction
            dir.x /= dist;
            dir.y /= dist;


            // original colour/type-dependent interaction
            if (dist <= minDistances[acol][bcol]) {
                totalForce.x += dir.x * forces[acol][bcol];
                totalForce.y += dir.y * forces[acol][bcol];
            } else if (dist < radii[acol][bcol]) {
                totalForce.x += scale(dir.x * forces[acol][bcol], 0, minDistances[acol][bcol], 0, 1) * timeFactor * k; 
                totalForce.y += scale(dir.y * forces[acol][bcol], 0, minDistances[acol][bcol], 0, 1) * timeFactor * k;
            }
        }

        // update velocity
        a.v.x += totalForce.x / a.m;
        a.v.y += totalForce.y / a.m;

        // update position
        if (wrap) {
            a.x = (a.x + a.v.x + innerWidth) % innerWidth;
            a.y = (a.y + a.v.y + innerHeight) % innerHeight;
        } else {
            a.x = Math.max(0, Math.min(a.x + a.v.x, innerWidth));
            a.y = Math.max(0, Math.min(a.y + a.v.y, innerHeight));
        }

        // optional damping
        a.v.x *= friction;
        a.v.y *= friction;

    }

    //console.log("AVERAGE", totalRangeQuery/totalNumRangeQueries)
};

// ============================================================================
// Render Loop
// ============================================================================

const update = () => {
    buildTree()
    rule()

    m.fillStyle = "black";
    m.fillRect(0, 0, innerWidth, innerHeight);

    for (let key in particlesColours) {
        drawParticlesBatch(particlesColours[key], key)
    }

    if (drawTree){drawQuadtree(mainTree)}

    for (let key in cols) {
        const fontsize = 15;
        m.fillStyle = key;
        m.font = `${fontsize}px Arial`;
        m.fillText(`${key}: ${colsCount[cols[key]]}`, 2, fontsize * cols[key] + fontsize);
    }

    for (let j = 0; j < buttons.length; j++) {
        m.strokeStyle = "white";
        m.font = "15px Arial";
        m.strokeText(buttons[j].name, 2, buttons[j].y - 5);
        Playbutton(buttons[j]);
    }

    requestAnimationFrame(update);
};

setParameters();
update();
