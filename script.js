document.addEventListener("DOMContentLoaded", () => {

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const successScreen = document.getElementById("successScreen");
const mainUI = document.getElementById("mainUI");

let width, height;
let particles = [];
let isCelebrated = false;

const PARTICLE_COUNT = window.innerWidth < 768 ? 1000 : 1800;
const HEART_SCALE = 15;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* ---------------- PARTICLE SYSTEM ---------------- */

class Particle {
    constructor() { this.reset(); }

    reset() {
        const t = Math.random() * Math.PI * 2;

        this.tx = 16 * Math.pow(Math.sin(t),3) * HEART_SCALE;
        this.ty = -(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t)) * HEART_SCALE;
        this.tz = (Math.random()-0.5)*20;

        this.x = this.tx;
        this.y = this.ty;
        this.z = this.tz;

        this.size = Math.random()*2;
        this.color = `hsl(${340 + Math.random()*20},100%,60%)`;
    }

    update(time) {
        if(!isCelebrated){
            const pulse = 1 + Math.sin(time*3)*0.05;
            this.x += (this.tx*pulse - this.x)*0.1;
            this.y += (this.ty*pulse - this.y)*0.1;
        } else {
            this.x += (Math.random()-0.5)*8;
            this.y += (Math.random()-0.5)*8;
            this.z += (Math.random()-0.5)*8;
        }
    }

    draw(rx, ry){
        let y1 = this.y*Math.cos(rx)-this.z*Math.sin(rx);
        let z1 = this.z*Math.cos(rx)+this.y*Math.sin(rx);
        let x1 = this.x*Math.cos(ry)-z1*Math.sin(ry);
        let z2 = z1*Math.cos(ry)+this.x*Math.sin(ry);

        const perspective = 600;
        const scale = perspective/(perspective+z2);

        if(scale <= 0) return;

        const x2d = width/2 + x1*scale;
        const y2d = height/2 + y1*scale;

        ctx.beginPath();
        ctx.arc(x2d, y2d, this.size * scale,0, Math.PI *2);
     
        ctx.fillStyle = this.color;
        ctx.fill();

        
    }
}

function initParticles(){
    
    particles = [];
    for(let i=0;i<PARTICLE_COUNT;i++){
        particles.push(new Particle());
    }
}
initParticles();

const floatingHearts = [];

for (let i = 0; i < 45; i++) {
    floatingHearts.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 20 + 8,
        speed: Math.random() * 0.4 + 0.2,
        alpha: Math.random() * 0.5 + 0.2
    });
}

function drawHeart(x, y, size, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 20, size / 20);

    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(-10, -8, -25, 5, 0, 22);
    ctx.bezierCurveTo(25, 5, 10, -8, 0, 6);

    ctx.strokeStyle = `rgba(255,100,180,${alpha})`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ff5ca8";
    ctx.stroke();

    ctx.restore();
}



/* ---------------- ANIMATION ---------------- */

let rotX=0, rotY=0;
let mouse = {x:0,y:0};
let time=0;

document.addEventListener("mousemove", e=>{
    mouse.x=(e.clientX-width/2)*0.001;
    mouse.y=(e.clientY-height/2)*0.001;
});

document.addEventListener("touchmove", e=>{
    const touch=e.touches[0];
    mouse.x=(touch.clientX-width/2)*0.001;
    mouse.y=(touch.clientY-height/2)*0.001;
});

function animate(){
    requestAnimationFrame(animate);

    ctx.fillStyle="#0f0205";
    ctx.fillRect(0,0,width,height);

   for(let i=0;i<5;i++){
    ctx.beginPath();
    ctx.arc(
        Math.random()*width,
        Math.random()*height,
        1.5,
        0,
        Math.PI*2
    );
    ctx.fillStyle="rgba(255,255,255,0.8)";
    ctx.fill();
}

    time+=0.02;
    rotY+=0.003;
    rotY+=(mouse.x-rotY)*0.05;
    rotX+=(mouse.y-rotX)*0.05;

    ctx.globalCompositeOperation="lighter";

    floatingHearts.forEach(h => {
    h.y -= h.speed;

    if (h.y < -50) {
        h.y = height + 50;
        h.x = Math.random() * width;
    }

    drawHeart(h.x, h.y, h.size, h.alpha);
});

    particles.forEach(p=>{
        p.update(time);
        p.draw(rotX,rotY);
    });

    

    ctx.globalCompositeOperation="source-over";
}


animate();

/* ---------------- BUTTON LOGIC ---------------- */

const phrases = [
"No","Are you sure?","Really?","Think again!",
"Last chance!","Please?","I have snacks!"
];
let phraseIndex=0;
let yesScale=1;

function moveNo(){
    if(isCelebrated) return;

    phraseIndex=(phraseIndex+1)%phrases.length;
    noBtn.innerText=phrases[phraseIndex];

    yesScale+=0.1;
    yesBtn.style.transform=`scale(${yesScale})`;
    yesBtn.style.boxShadow =
    "0 0 20px #ff4da6, 0 0 40px #ff4da6";

    const padding=20;
    const maxX=window.innerWidth-noBtn.offsetWidth-padding;
    const maxY=window.innerHeight-noBtn.offsetHeight-padding;

    const x=Math.random()*maxX;
    const y=Math.random()*maxY;

    noBtn.style.position="fixed";
    noBtn.style.left=x+"px";
    noBtn.style.top=y+"px";
}

noBtn.addEventListener("mouseenter", moveNo);
noBtn.addEventListener("click", moveNo);
noBtn.addEventListener("touchstart", e=>{
    e.preventDefault();
    moveNo();
});


yesBtn.addEventListener("click", ()=>{
    if(isCelebrated) return;
    isCelebrated=true;

    mainUI.style.opacity="0";
    successScreen.style.opacity="1";
});
});
