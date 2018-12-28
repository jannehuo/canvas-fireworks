import { times, sample, random } from "lodash"
import { TAU } from "./utils"
import SimplexNoise from "simplex-noise"
const amount = 2000
const particles = []
const simplex = new SimplexNoise()
let context, c, screen

function start() {
	initCanvas()
	createParticles()
	animate()
}

function initCanvas() {
	c = document.getElementById("canvas")
	context = c.getContext("2d")
	screen = {
		w: window.innerWidth,
		h: window.innerHeight,
	}
	c.width = screen.w
	c.height = screen.h
}

function animate() {
	requestAnimationFrame(animate)
	context.clearRect(0, 0, screen.w, screen.h)
	draw()
}

function draw() {
	particles.forEach(p => p.update())
}

function createParticles() {
	times(amount, v => {
		particles.push(new Particle(v, random(0, screen.w), screen.h + 10))
	})
}

class Particle {
	constructor(id, x, y) {
		this.x0 = x
		this.y0 = y
		this.x = x
		this.y = y
		this.vx = 0
		this.vy = 0
		this.id = id
		this.colors = ["#07162d", "#517e87", "#295159", "#308799"]
		this.color = sample(this.colors)
		this.radius = random(1, 3)
    this.moving = false
    this.target = this.randomPointFromCircle()
    this.life = 0
    this.ttlLimit = random(10, 15)
	}
	draw() {
		context.beginPath()
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
		context.fillStyle = this.color
		context.fill()
	}
	update() {
    this.y += this.vy
    this.x += this.vx

		if (this.y < screen.h / 2) {
      this.spread()
      this.life++
    }
    if(this.life > this.ttlLimit) {
      this.x = this.x0
      this.y = this.y0
      this.vx = 0
      this.vy = 0
      this.moving = false
      this.life = 0
    }
		this.draw()
	}
	spread() {
    const endPos = {
      x: this.x + this.target.x,
      y: this.y + this.target.y
    }
    const relativeTo = this.relativeTo(endPos, this)
    const distance = this.getDistance(relativeTo)
    const direction = this.getDirection(relativeTo, distance)
    const force = this.getForce(distance)
    this.vx += direction.x * force / 10
    this.vy += direction.y * force / 10
    this.color = sample(["#c2d8fc", "#d4e2f9", "#b5c0d1", "#07162d", "#517e87", "#295159", "#308799"])
	}
	relativeTo(v1, v2) {
		const relativeToTarget = {
			x: v1.x - v2.x,
			y: v1.y - v2.y,
		}
		return relativeToTarget
	}
	getDistance(relative) {
		const distance = Math.sqrt(
			relative.x * relative.x + relative.y * relative.y,
		)
		return distance
	}
	getDirection(relativeToTarget, distance) {
    if(distance === 0) {
      return {
        x: 0,
        y: 0
      };
    }
    return {
      x: relativeToTarget.x / distance,
      y: relativeToTarget.y / distance
    };
  }
  getForce(distance) {
    let force = distance * (1 / 10);
    return force;
  }
	randomPointFromCircle() {
		const radius = 200
		const angle = Math.random() * 2 * Math.PI
		const radius_sq = Math.random() * radius * radius
		const x = Math.sqrt(radius_sq) * Math.cos(angle)
		const y = Math.sqrt(radius_sq) * Math.sin(angle)
		return {
			x: x,
			y: y,
		}
	}
}

class Explosion {
	constructor(x, y) {
		this.x = x
		this.y = y
		this.radius = 200
		this.update()
	}
	draw() {
		const explosion = this.getParticles(this.x)
		this.explode(explosion)
	}
	getParticles(x) {
		return particles.filter(p => p.x > x - 50 && p.x < x + 50 && !p.moving)
	}
	explode(particles) {
		particles.forEach(p => {
      p.vy = random(-10, -5)
      p.x = this.x
      p.moving = true
      p.color = sample(["#c2d8fc", "#d4e2f9", "#b5c0d1"])
		})
	}
	update() {
		this.draw()
	}
}

window.addEventListener(
	"click",
	function(e) {
		new Explosion(e.clientX, e.clientY)
	},
	false,
)

start()
