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

// --- Controle ---
const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

// --- Plataformas ---
let platforms = [];
function generatePlatform(x, y, width, height){
    platforms.push({x, y, width, height});
}

// Plataforma inicial
generatePlatform(0, 360, 800, 40);

// --- Moedas ---
let coins = [];
function generateCoin(x, y){
    coins.push({x, y, width:20, height:20, collected:false});
}

// --- Sistema de scroll ---
let cameraX = 0;
let speed = 3; // velocidade de movimento para frente
let score = 0;

// --- Função para gerar plataformas e moedas à frente ---
function spawnPlatformsAndCoins(){
    // Só gerar se não houver plataforma suficiente à frente
    let lastPlatformX = platforms.length > 0 ? platforms[platforms.length-1].x : 0;
    while(lastPlatformX < cameraX + canvasWidth + 200){
        let width = 80 + Math.random()*100;
        let x = lastPlatformX + 50 + Math.random()*50;
        let y = 200 + Math.random()*150;
        generatePlatform(x, y, width, 20);

        // gerar moedas sobre a plataforma
        let coinsCount = Math.floor(Math.random()*3)+1;
        for(let i=0; i<coinsCount; i++){
            generateCoin(x + 20 + i*25, y - 30);
        }

        lastPlatformX = x + width;
    }
}

// --- Função de atualização ---
function update(){
    // Movimento horizontal
    if(keys['ArrowRight']){
        player.x += speed;
    }

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
    coins.forEach(coin => {
        if(!coin.collected &&
           player.x < coin.x + coin.width &&
           player.x + player.width > coin.x &&
           player.y < coin.y + coin.height &&
           player.y + player.height > coin.y){
               coin.collected = true;
               score++;
        }
    });

    // Atualizar câmera
    cameraX = player.x - 100;

    // Gerar novas plataformas e moedas
    spawnPlatformsAndCoins();

    // Remover plataformas e moedas fora da tela
    platforms = platforms.filter(p => p.x + p.width > cameraX - 100);
    coins = coins.filter(c => c.x + c.width > cameraX - 100);
}

// --- Função de desenho ---
function draw(){
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    ctx.translate(-cameraX, 0); // aplicar scroll

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
