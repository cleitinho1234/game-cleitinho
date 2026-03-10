const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// --- Jogador ---
const player = {
    x: 100,
    y: 300,
    width: 40,
    height: 40,
    color: 'red',
    dy: 0,
    gravity: 0.8,
    jumpForce: -15,
    onGround: false
};

// --- Controles ---
const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

// --- Plataformas ---
let platforms = [];
function generatePlatform(x, y, width, height){
    platforms.push({x, y, width, height});
}

// Plataforma inicial
generatePlatform(0, 360, 800, 40); // chão inicial

// --- Moedas ---
let coins = [];
function generateCoinsForPlatform(p){
    const maxCoins = 2;
    const coinCount = Math.random() < 0.6 ? Math.floor(Math.random() * (maxCoins + 1)) : 0; 
    for(let i=0; i<coinCount; i++){
        const x = p.x + 20 + i*25;
        const y = p.y - 30;
        coins.push({x, y, width:20, height:20, collected:false});
    }
}

// --- Sistema de scroll ---
let cameraX = 0;
let speed = 3;
let score = 0;

// --- Gerar plataformas e moedas à frente ---
function spawnPlatformsAndCoins(){
    let lastPlatformX = platforms.length > 0 ? platforms[platforms.length-1].x + platforms[platforms.length-1].width : 0;

    while(lastPlatformX < cameraX + canvasWidth + 200){
        // --- Chão contínuo ---
        generatePlatform(lastPlatformX, 360, 200, 40); // chão infinito

        // --- Plataforma aleatória acima do chão ---
        const width = 80 + Math.random()*100;
        const gap = 50 + Math.random()*100;
        const x = lastPlatformX + gap;
        const y = 200 + Math.random()*100;
        generatePlatform(x, y, width, 20);

        // Gerar moedas na plataforma aleatória
        generateCoinsForPlatform({x, y, width, height:20});

        lastPlatformX = x + width;
    }
}

// --- Atualização ---
function update(){
    // Movimento horizontal
    if(keys['ArrowRight']) player.x += speed;
    if(keys['ArrowLeft'] && player.x > 0) player.x -= speed;

    // Pulo
    if(keys['Space'] && player.onGround){
        player.dy = player.jumpForce;
        player.onGround = false;
    }

    // Gravidade
    player.dy += player.gravity;
    player.y += player.dy;

    // Colisão com plataformas
    player.onGround = false;
    platforms.forEach(p => {
        if(player.x < p.x + p.width &&
           player.x + player.width > p.x &&
           player.y < p.y + p.height &&
           player.y + player.height > p.y){
               if(player.dy > 0 && player.y + player.height - player.dy <= p.y){
                   player.y = p.y - player.height;
                   player.dy = 0;
                   player.onGround = true;
               }
        }
    });

    // Colisão com moedas
    coins.forEach(c => {
        if(!c.collected &&
           player.x < c.x + c.width &&
           player.x + player.width > c.x &&
           player.y < c.y + c.height &&
           player.y + player.height > c.y){
               c.collected = true;
               score++;
        }
    });

    // Atualizar câmera
    cameraX = player.x - 100;
    if(cameraX < 0) cameraX = 0;

    // Gerar novas plataformas e moedas
    spawnPlatformsAndCoins();

    // Limpar plataformas/moedas fora da tela
    platforms = platforms.filter(p => p.x + p.width > cameraX - 200);
    coins = coins.filter(c => c.x + c.width > cameraX - 200);
}

// --- Desenhar ---
function draw(){
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    ctx.translate(-cameraX, 0);

    // Jogador
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Plataformas
    ctx.fillStyle = 'green';
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

    // Moedas
    coins.forEach(c => {
        if(!c.collected){
            ctx.fillStyle = 'gold';
            ctx.beginPath();
            ctx.arc(c.x + c.width/2, c.y + c.height/2, c.width/2, 0, Math.PI*2);
            ctx.fill();
        }
    });

    ctx.restore();

    // Pontuação
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Moedas: ' + score, 10, 30);
}

// --- Loop principal ---
function gameLoop(){
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
