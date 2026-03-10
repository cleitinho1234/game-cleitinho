const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Configuração do jogador ---
const player = {
    x: 50,
    y: 300,
    width: 40,
    height: 40,
    color: 'red',
    dy: 0,
    gravity: 0.8,
    jumpForce: -15,
    onGround: false
};

// --- Plataformas ---
const platforms = [
    {x:0, y:360, width:800, height:40},   // chão
    {x:200, y:280, width:100, height:20}, // plataforma 1
    {x:400, y:220, width:100, height:20}, // plataforma 2
];

// --- Moedas ---
const coins = [
    {x:220, y:240, width:20, height:20, collected:false},
    {x:420, y:180, width:20, height:20, collected:false},
];

let score = 0;

// --- Controles ---
const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

// --- Função de atualização ---
function update() {
    // Movimento horizontal
    if(keys['ArrowLeft']) player.x -= 5;
    if(keys['ArrowRight']) player.x += 5;

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
            // Colisão de cima
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
}

// --- Função de desenho ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar jogador
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Desenhar plataformas
    ctx.fillStyle = 'green';
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

    // Desenhar moedas
    coins.forEach(coin => {
        if(!coin.collected){
            ctx.fillStyle = 'gold';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Pontuação
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Moedas: ' + score, 10, 30);
}

// --- Loop principal ---
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
