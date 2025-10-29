// ===== CONFIGURAÇÕES GERAIS =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos da UI
const loadingScreen = document.getElementById('loadingScreen');
const loadingProgress = document.getElementById('loadingProgress');
const dialogBox = document.getElementById('dialogBox');
const dialogText = document.getElementById('dialogText');
const dialogName = document.getElementById('dialogName');
const aiAssistant = document.getElementById('aiAssistant');
const aiMessage = document.getElementById('aiMessage');
const challengeBox = document.getElementById('challengeBox');
const challengeQuestion = document.getElementById('challengeQuestion');
const challengeInput = document.getElementById('challengeInput');

// ===== ESTADOS DO JOGO =====
const GAME_STATES = {
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    DIALOG: 'dialog',
    CHALLENGE: 'challenge',
    VICTORY: 'victory'
};

let gameState = GAME_STATES.LOADING;
let currentPhase = 1;
let tutorialStep = 0;

// ===== SISTEMA DE CARREGAMENTO =====
let assetsLoaded = 0;
const totalAssets = 2;

const playerSprites = {
    front: null,
    back: null
};

function loadAssets() {
    console.log("🚀 Iniciando carregamento...");
    
    // Carregar sprite frontal
    const frontImg = new Image();
    frontImg.onload = () => {
        console.log("✅ personagem_frente.png carregada!");
        playerSprites.front = frontImg;
        assetLoaded();
    };
    frontImg.onerror = () => {
        console.log("❌ Erro ao carregar personagem_frente.png");
        playerSprites.front = createFallbackSprite('front');
        assetLoaded();
    };
    frontImg.src = 'assets/sprites/personagem_frente.png';

    // Carregar sprite de costas
    const backImg = new Image();
    backImg.onload = () => {
        console.log("✅ personagem_costas.png carregada!");
        playerSprites.back = backImg;
        assetLoaded();
    };
    backImg.onerror = () => {
        console.log("❌ Erro ao carregar personagem_costas.png");
        playerSprites.back = createFallbackSprite('back');
        assetLoaded();
    };
    backImg.src = 'assets/sprites/personagem_costas.png';
}

function assetLoaded() {
    assetsLoaded++;
    const progress = (assetsLoaded / totalAssets) * 100;
    loadingProgress.style.width = progress + '%';
    
    if (assetsLoaded === totalAssets) {
        console.log("🎮 Todos os assets carregados!");
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            gameState = GAME_STATES.MENU;
            player.sprite = playerSprites.front;
            showAIMessage("👋 Olá! Eu sou a ALICE_IA. Pressione ESPAÇO para começarmos!", 6000);
        }, 1000);
    }
}

function createFallbackSprite(direction) {
    const sprite = document.createElement('canvas');
    sprite.width = 32;
    sprite.height = 48;
    const spriteCtx = sprite.getContext('2d');
    
    if (direction === 'front') {
        // Corpo
        spriteCtx.fillStyle = '#4cc9f0';
        spriteCtx.fillRect(8, 15, 16, 25);
        // Cabeça
        spriteCtx.fillStyle = '#ffdbac';
        spriteCtx.fillRect(8, 5, 16, 12);
        // Olhos
        spriteCtx.fillStyle = '#000';
        spriteCtx.fillRect(12, 9, 2, 2);
        spriteCtx.fillRect(20, 9, 2, 2);
        // Sorriso
        spriteCtx.fillStyle = '#ff6b6b';
        spriteCtx.fillRect(13, 14, 6, 1);
    } else {
        // Costas
        spriteCtx.fillStyle = '#4895ef';
        spriteCtx.fillRect(8, 15, 16, 25);
        // Cabeça
        spriteCtx.fillStyle = '#ffdbac';
        spriteCtx.fillRect(8, 5, 16, 12);
        // Cabelo
        spriteCtx.fillStyle = '#3a0ca3';
        spriteCtx.fillRect(6, 5, 20, 6);
    }
    
    return sprite;
}

// ===== PERSONAGEM DO JOGADOR =====
const player = {
    x: 400,
    y: 300,
    width: 32,
    height: 48,
    speed: 4,
    direction: 'front',
    sprite: null
};

function updatePlayer() {
    if (gameState !== GAME_STATES.PLAYING) return;
    
    if (keys['w'] || keys['ArrowUp']) {
        player.y -= player.speed;
        player.direction = 'back';
        player.sprite = playerSprites.back;
    }
    if (keys['s'] || keys['ArrowDown']) {
        player.y += player.speed;
        player.direction = 'front';
        player.sprite = playerSprites.front;
    }
    if (keys['a'] || keys['ArrowLeft']) {
        player.x -= player.speed;
        player.direction = 'front';
        player.sprite = playerSprites.front;
    }
    if (keys['d'] || keys['ArrowRight']) {
        player.x += player.speed;
        player.direction = 'front';
        player.sprite = playerSprites.front;
    }

    // Limites da tela
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}

// ===== SISTEMA DE INPUT ATUALIZADO =====
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Iniciar jogo
    if (e.key === ' ' && gameState === GAME_STATES.MENU) {
        startGame();
    }
    
    // Interagir
    if ((e.key === 'e' || e.key === 'E') && gameState === GAME_STATES.PLAYING) {
        checkInteraction();
    }
    
    // Submeter desafio
    if (e.key === 'Enter' && gameState === GAME_STATES.CHALLENGE) {
        submitChallenge();
    }
    
    // FECHAR COM ESC - SISTEMA COMPLETO
    if (e.key === 'Escape') {
        console.log("⎋ ESC pressionado - Estado atual:", gameState);
        
        if (gameState === GAME_STATES.CHALLENGE) {
            cancelChallenge();
        } else if (gameState === GAME_STATES.DIALOG) {
            hideDialog();
        } else if (aiAssistant.classList.contains('active')) {
            hideAIMessage();
        } else if (gameState === GAME_STATES.PLAYING) {
            showAIMessage("🎮 Jogo em andamento... Pressione H para ajuda da Alice!", 3000);
        }
    }
    
    // Pedir ajuda da Alice
    if ((e.key === 'h' || e.key === 'H') && gameState === GAME_STATES.PLAYING) {
        askForHelp();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// ===== OBJETOS DO JOGO =====
const gameObjects = [
    // FASE 1 - Cifra de César
    { 
        x: 100, y: 100, type: 'info', phase: 1, 
        text: "💡 Alan Turing desenvolveu a base teórica da computação moderna! Sua Máquina de Turing é o fundamento de todos os computadores atuais." 
    },
    { 
        x: 300, y: 400, type: 'info', phase: 1, 
        text: "🔐 Durante a WWII, Turing quebrou o código Enigma, salvando milhões de vidas! Ele criou a 'Bombe', máquina que decifrava mensagens nazistas." 
    },
    { 
        x: 600, y: 200, type: 'challenge', phase: 1, 
        question: "🎯 DESAFIO 1: Cifra de César\nDecifre 'KDOI' (deslocamento de 3 posições para trás)",
        answer: "half",
        explanation: "Ótimo! Na Cifra de César, cada letra é deslocada 3 posições: K→H, D→A, O→L, I→F. 'HALF' significa 'metade' em inglês!",
        hints: [
            "📚 A Cifra de César é uma das mais antigas! Julius César usava para comunicações militares",
            "🔤 Cada letra do alfabeto é substituída por outra 3 posições à frente (ou atrás para decifrar)",
            "🧮 K (11ª letra) - 3 = H (8ª letra), D (4ª) - 3 = A (1ª), O (15ª) - 3 = L (12ª), I (9ª) - 3 = F (6ª)",
            " Resposta: HALF (K→H, D→A, O→L, I→F)"
        ]
    },
    
    // FASE 2 - Operação XOR
    { 
        x: 200, y: 150, type: 'info', phase: 2, 
        text: "🤖 A Máquina de Turing (1936) definiu matematicamente o que pode ser computado! Ela simula qualquer algoritmo de computador." 
    },
    { 
        x: 500, y: 300, type: 'info', phase: 2, 
        text: "🔍 XOR (OU Exclusivo) é fundamental em criptografia! 0⊕0=0, 1⊕1=0, 0⊕1=1, 1⊕0=1. É reversível: A⊕B⊕B = A!" 
    },
    { 
        x: 650, y: 450, type: 'challenge', phase: 2, 
        question: "🎯 DESAFIO 2: Operação XOR Binária\n0110 ⊕ 1100 = ?",
        answer: "1010",
        explanation: "Excelente! XOR compara bit a bit: iguais=0, diferentes=1. Essa operação é a base de muitos algoritmos criptográficos!",
        hints: [
            "💡 XOR (OU Exclusivo): bits iguais = 0, bits diferentes = 1",
            "🧮 0⊕1=1 (diferentes), 1⊕1=0 (iguais), 1⊕0=1 (diferentes), 0⊕0=0 (iguais)",
            "🔢 Posição a posição: 0⊕1=1, 1⊕1=0, 1⊕0=1, 0⊕0=0 → 1010",
            " Resposta: 1010 (0⊕1=1, 1⊕1=0, 1⊕0=1, 0⊕0=0)"
        ]
    },
    
    // FASE 3 - Base64
    { 
        x: 150, y: 200, type: 'info', phase: 3, 
        text: "🛡️ Criptografia moderna usa algoritmos como RSA (chaves públicas) e AES (padrão atual). Turing fundamentou a segurança computacional!" 
    },
    { 
        x: 400, y: 350, type: 'info', phase: 3, 
        text: "⚖️ Base64 codifica dados binários em texto ASCII (A-Z,a-z,0-9,+,/). Usado em emails, URLs e armazenamento seguro de dados." 
    },
    { 
        x: 650, y: 100, type: 'challenge', phase: 3, 
        question: "🎯 DESAFIO 3: Decodificação Base64\n'VHVyaW5n' = ?",
        answer: "turing",
        explanation: "Perfeito! Base64 converte dados binários em texto. 'VHVyaW5n' decodifica para 'Turing', nosso herói da computação!",
        hints: [
            "📊 Base64 converte cada 3 bytes em 4 caracteres ASCII (6 bits cada)",
            "🔠 'VH' decodifica para 'T', 'Vy' para 'u', 'Jp' para 'r', 'bg' para 'ing'",
            "👨‍🔬 Alan Turing é o pai da computação moderna e inteligência artificial",
            " Resposta: turing (T-u-r-i-n-g)"
        ]
    }
];

// ===== SISTEMA DE AJUDA DA ALICE =====
function askForHelp() {
    const helpMessages = {
        1: [
            "🎓 FASE 1: CIFRA DE CÉSAR",
            "👉 PASSO 1: Encontre os objetos VERDES para aprender sobre Alan Turing",
            "👉 PASSO 2: Vá até o objeto ROXO para o desafio da Cifra de César", 
            "💡 DICA: KDOI → Subtraia 3 de cada letra (K-3=H, D-3=A, etc)",
            "🎯 OBJETIVO: Decifrar 'KDOI' para avançar!"
        ],
        2: [
            "🎓 FASE 2: OPERAÇÃO XOR", 
            "👉 PASSO 1: Aprenda sobre a Máquina de Turing nos objetos verdes",
            "👉 PASSO 2: Complete o desafio XOR no objeto roxo",
            "💡 DICA: XOR: 0⊕0=0, 1⊕1=0, 0⊕1=1, 1⊕0=1",
            "🎯 OBJETIVO: Calcular 0110 ⊕ 1100"
        ],
        3: [
            "🎓 FASE 3: DECODIFICAÇÃO BASE64",
            "👉 PASSO 1: Estude criptografia moderna nos objetos verdes", 
            "👉 PASSO 2: Decodifique 'VHVyaW5n' no desafio final",
            "💡 DICA: Base64 converte binário para texto ASCII",
            "🎯 OBJETIVO: Decodificar para o nome do pai da computação"
        ]
    };
    
    const messages = helpMessages[currentPhase] || ["Continue explorando! Pressione E para interagir com objetos."];
    showAIMessage(messages.join('\n\n'), 8000);
}

// ===== SISTEMA DE DICAS =====
let currentHints = [];
let hintIndex = 0;

function showHint() {
    if (!currentChallenge || !currentChallenge.hints) return;
    
    if (hintIndex < currentChallenge.hints.length) {
        showAIMessage(currentChallenge.hints[hintIndex], 6000);
        hintIndex++;
    } else {
        showAIMessage(" RESPOSTA: " + currentChallenge.answer.toUpperCase() + "\n\n" + currentChallenge.explanation, 7000);
    }
}

// ===== SISTEMA DE DIÁLOGOS =====
const dialogs = {
    intro: [
        { 
            name: "ALICE_IA 🤖", 
            text: "👋 Olá! Eu sou a ALICE, sua assistente IA de criptografia. Preparei uma jornada especial sobre Alan Turing, IA e criptografia!" 
        },
        { 
            name: "ALICE_IA 🤖", 
            text: "📚 Você descobriu que Turing não apenas quebrou códigos nazistas... ele criou os fundamentos teóricos que revolucionaram a computação e IA moderna!"
        },
        { 
            name: "ALICE_IA 🤖", 
            text: "Vou te ensinar criptografia passo a passo. Em cada fase: \n• 💚 Objetos VERDES = Aulas teóricas\n• 💜 Objetos ROXOS = Desafios práticos\n• 🆘 Pressione H para minha ajuda!" 
        },
        { 
            name: "ALICE_IA 🤖", 
            text: "🕹️ CONTROLES:\n• WASD/Setas = Mover\n• E = Interagir\n• H = Ajuda da Alice\n• Enter = Enviar resposta\n• ESC = Cancelar" 
        },
        { 
            name: "ALICE_IA 🤖", 
            text: "Vamos começar nossa primeira aula sobre a CIFRA DE CÉSAR! Explore o ambiente e encontre os pontos de aprendizado. Boa sorte! 🎓" 
        }
    ]
};

let currentDialog = [];
let dialogIndex = 0;

function showDialog(dialogKey) {
    currentDialog = dialogs[dialogKey];
    dialogIndex = 0;
    gameState = GAME_STATES.DIALOG;
    showNextDialog();
}

function showNextDialog() {
    if (dialogIndex < currentDialog.length) {
        const dialog = currentDialog[dialogIndex];
        dialogName.textContent = dialog.name;
        dialogText.textContent = dialog.text;
        dialogBox.classList.add('active');
        dialogIndex++;
    } else {
        hideDialog();
    }
}

// ===== SISTEMA DE FECHAR =====

function hideAIMessage() {
    aiAssistant.classList.remove('active');
    // Remove o botão de dica se existir
    const hintBtn = document.getElementById('hintButton');
    if (hintBtn) {
        hintBtn.remove();
    }
    console.log("🗨️ Mensagem da AI fechada");
}

function hideDialog() {
    dialogBox.classList.remove('active');
    gameState = GAME_STATES.PLAYING;
    console.log("💬 Diálogo fechado");
    
    // Mensagem de continuação apenas se for o diálogo inicial
    if (currentDialog === dialogs.intro) {
        showAIMessage("🎓 FASE 1: CIFRA DE CÉSAR\n\nEncontre os objetos VERDES para aprender e o ROXO para o desafio!\nPressione H se precisar de ajuda!", 7000);
    }
}

function nextDialog() {
    showNextDialog();
}

// ===== SISTEMA DE DESAFIOS =====
let currentChallenge = null;

function startChallenge(obj) {
    currentChallenge = obj;
    currentHints = obj.hints || [];
    hintIndex = 0;
    gameState = GAME_STATES.CHALLENGE;
    challengeQuestion.textContent = obj.question;
    challengeInput.value = '';
    challengeBox.classList.add('active');
    
    // Focar no input após um pequeno delay
    setTimeout(() => {
        challengeInput.focus();
    }, 100);
    
    console.log("🎯 Desafio iniciado:", obj.question.substring(0, 30) + "...");
    
    // Explicação inicial da Alice
    setTimeout(() => {
        showAIMessage("🎓 DESAFIO " + currentPhase + " INICIADO!\n\n• Pressione H para dicas\n• ESC ou X para fechar\n• Enter para enviar resposta", 5000);
    }, 500);
}

function submitChallenge() {
    if (!currentChallenge) return;
    
    const userAnswer = challengeInput.value.toLowerCase().trim();
    if (userAnswer === currentChallenge.answer.toLowerCase()) {
        showAIMessage("🎉 EXCELENTE! " + currentChallenge.explanation + "\n\nPróxima fase desbloqueada! 🚀", 6000);
        challengeBox.classList.remove('active');
        gameState = GAME_STATES.PLAYING;
        advancePhase();
    } else {
        showAIMessage("❌ Quase lá! Tente novamente.\n\n💡 Pressione H para dicas ou clique em 'Pedir Dica'!\nLembre-se: " + getCurrentChallengeTip(), 5000);
        challengeInput.value = '';
        challengeInput.focus();
    }
}

function getCurrentChallengeTip() {
    if (currentPhase === 1) return "Cifra de César: subtraia 3 posições de cada letra!";
    if (currentPhase === 2) return "XOR: bits iguais=0, bits diferentes=1!";
    if (currentPhase === 3) return "Base64: converte binário para texto ASCII!";
    return "Continue tentando!";
}

function cancelChallenge() {
    challengeBox.classList.remove('active');
    gameState = GAME_STATES.PLAYING;
    currentChallenge = null;
    console.log("🎯 Desafio cancelado");
    showAIMessage("⏸️ Desafio pausado. Volte quando quiser! Pressione H para ver o guia.", 4000);
}

function advancePhase() {
    currentPhase++;
    if (currentPhase > 3) {
        gameState = GAME_STATES.VICTORY;
        showAIMessage("🏆 PARABÉNS! Você completou o jogo de criptografia ligada a IA!\n\nAlan Turing ficaria orgulhoso! 🎓", 8000);
    } else {
        const phaseMessages = {
            2: "🎓 FASE 2: OPERAÇÃO XOR\n\nAprenda sobre lógica binária e resolva o desafio XOR!\nPressione H para meu guia completo!",
            3: "🎓 FASE 3: BASE64\n\nÚltima fase! Domine a codificação Base64!\nPressione H para ajuda!"
        };
        showAIMessage(phaseMessages[currentPhase] || "Nova fase desbloqueada! Continue explorando!", 7000);
    }
}

// ===== SISTEMA DE INTERAÇÃO =====
function checkInteraction() {
    const currentObjects = gameObjects.filter(obj => obj.phase === currentPhase);
    const playerCenter = {
        x: player.x + player.width / 2,
        y: player.y + player.height / 2
    };
    
    for (const obj of currentObjects) {
        const distance = Math.sqrt(
            Math.pow(playerCenter.x - obj.x, 2) + Math.pow(playerCenter.y - obj.y, 2)
        );
        
        if (distance < 50) {
            if (obj.type === 'info') {
                showAIMessage("📚 " + obj.text + "\n\n💡 Continue explorando! Próximo: " + getNextObjective(), 7000);
            } else if (obj.type === 'challenge') {
                startChallenge(obj);
            }
            break;
        }
    }
}

function getNextObjective() {
    const currentObjects = gameObjects.filter(obj => obj.phase === currentPhase);
    const infoCount = currentObjects.filter(obj => obj.type === 'info').length;
    const challengeCount = currentObjects.filter(obj => obj.type === 'challenge').length;
    
    const interactedInfos = currentObjects.filter(obj => 
        obj.type === 'info' && 
        Math.sqrt(Math.pow(player.x + player.width/2 - obj.x, 2) + Math.pow(player.y + player.height/2 - obj.y, 2)) < 50
    ).length;
    
    if (interactedInfos < infoCount) {
        return "Encontrar mais pontos de aprendizado (objetos verdes)";
    } else {
        return "Resolver o desafio final (objeto roxo)";
    }
}

// ===== ASSISTENTE IA MELHORADA =====
function showAIMessage(message, duration = 5000) {
    aiMessage.innerHTML = message.replace(/\n/g, '<br>');
    aiAssistant.classList.add('active');
    
    console.log("🤖 AI Message:", message.substring(0, 50) + "...");
    
    // Adicionar botão de dica se estiver em um desafio
    if (gameState === GAME_STATES.CHALLENGE && currentChallenge) {
        const existingHintBtn = document.getElementById('hintButton');
        if (!existingHintBtn) {
            const hintBtn = document.createElement('button');
            hintBtn.id = 'hintButton';
            hintBtn.className = 'pixel-button hint-btn';
            hintBtn.textContent = '💡 Pedir Dica da Alice';
            hintBtn.onclick = showHint;
            aiAssistant.appendChild(hintBtn);
        }
    } else {
        // Remover botão de dica se não estiver em desafio
        const hintBtn = document.getElementById('hintButton');
        if (hintBtn) {
            hintBtn.remove();
        }
    }
    
    // Auto-fechar após duração (exceto se for mensagem importante)
    if (duration > 0) {
        setTimeout(() => {
            if (aiMessage.innerHTML === message.replace(/\n/g, '<br>')) {
                hideAIMessage();
            }
        }, duration);
    }
}

// ===== INICIALIZAÇÃO DO JOGO =====
function startGame() {
    gameState = GAME_STATES.PLAYING;
    showDialog('intro');
}

// ===== RENDERIZAÇÃO =====
function drawBackground() {
    // Fundo
    ctx.fillStyle = '#0c0c1d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grade (estilo pixel art)
    ctx.strokeStyle = '#1e1e3f';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < canvas.width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawObjects() {
    const currentObjects = gameObjects.filter(obj => obj.phase === currentPhase);
    
    currentObjects.forEach(obj => {
        // Fundo do objeto
        ctx.fillStyle = obj.type === 'info' ? '#00cc00' : '#cc00cc';
        ctx.fillRect(obj.x - 20, obj.y - 20, 40, 40);
        
        // Ícone
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obj.type === 'info' ? '📚' : '🎯', obj.x, obj.y);
        
        // Label
        ctx.fillStyle = obj.type === 'info' ? '#00ff00' : '#ff00ff';
        ctx.font = '12px Courier New';
        ctx.fillText(obj.type === 'info' ? 'AULA' : 'DESAFIO', obj.x, obj.y + 25);
    });
}

function drawPlayer() {
    if (player.sprite) {
        ctx.drawImage(player.sprite, player.x, player.y, player.width, player.height);
    }
}

function drawUI() {
    // Título da fase
    ctx.fillStyle = '#4cc9f0';
    ctx.font = 'bold 20px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(`🎓 FASE ${currentPhase}: ${getPhaseTitle(currentPhase)}`, canvas.width / 2, 30);
    
    // Controles
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText('WASD/Setas: Mover | E: Interagir | H: Ajuda da Alice | ESC: Cancelar', 10, canvas.height - 20);
    
    // Progresso
    ctx.fillStyle = '#f72585';
    ctx.font = '14px Courier New';
    ctx.textAlign = 'right';
    ctx.fillText(`Progresso: ${currentPhase}/3 Fases`, canvas.width - 20, canvas.height - 20);
}

function getPhaseTitle(phase) {
    const titles = {
        1: 'CIFRA DE CÉSAR',
        2: 'OPERAÇÃO XOR', 
        3: 'CODIFICAÇÃO BASE64'
    };
    return titles[phase] || '';
}

function drawMenu() {
    drawBackground();
    
    // Título principal
    ctx.fillStyle = '#4cc9f0';
    ctx.font = 'bold 36px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('CRIPTOGRAFIA & IA', canvas.width / 2, 150);
    
    ctx.fillStyle = '#f72585';
    ctx.font = 'bold 28px Courier New';
    ctx.fillText('O LEGADO DE TURING', canvas.width / 2, 190);
    
    // História
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Courier New';
    ctx.fillText('Aprenda criptografia com a ALICE IA!', canvas.width / 2, 260);
    ctx.fillText('Descubra como Alan Turing revolucionou', canvas.width / 2, 290);
    ctx.fillText('a computação.', canvas.width / 2, 320);
    
    // Instrução
    ctx.fillStyle = '#7209b7';
    ctx.font = 'bold 22px Courier New';
    ctx.fillText('PRESSIONE ESPAÇO PARA COMEÇAR O JOGO', canvas.width / 2, 400);
    
    // Créditos
    ctx.fillStyle = '#4cc9f0';
    ctx.font = '14px Courier New';
    ctx.fillText('Pressione H durante o jogo para ajuda da Alice!', canvas.width / 2, 480);
}

function drawVictory() {
    drawBackground();
    
    ctx.fillStyle = '#4cc9f0';
    ctx.font = 'bold 36px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('🎓 JOGO COMPLETO!', canvas.width / 2, 150);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Courier New';
    ctx.fillText('Parabéns! Você dominou os fundamentos da criptografia!', canvas.width / 2, 220);
    ctx.fillText('Alan Turing ficaria orgulhoso do seu progresso.', canvas.width / 2, 260);
    ctx.fillText('Continue estudando - o futuro precisa de você!', canvas.width / 2, 300);
    
    ctx.fillStyle = '#f72585';
    ctx.font = 'bold 24px Courier New';
    ctx.fillText('O LEGADO DE TURING CONTINUA EM VOCÊ!', canvas.width / 2, 380);
}

// ===== LOOP PRINCIPAL =====
function gameLoop() {
    updatePlayer();
    
    // Renderização baseada no estado
    switch(gameState) {
        case GAME_STATES.MENU:
            drawMenu();
            break;
        case GAME_STATES.VICTORY:
            drawVictory();
            break;
        case GAME_STATES.PLAYING:
            drawBackground();
            drawObjects();
            drawPlayer();
            drawUI();
            break;
    }
    
    requestAnimationFrame(gameLoop);
}

// ===== INICIAR JOGO =====
loadAssets();
gameLoop();