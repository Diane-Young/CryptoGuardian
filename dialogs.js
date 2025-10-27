// Sistema de diálogos
let currentDialog = [];
let dialogIndex = 0;

const dialogs = {
    intro: [
        { name: "ALICE_IA", text: "Olá! Eu sou a ALICE, sua assistente de IA. Detectei que você descobriu algo incrível sobre Alan Turing!" },
        { name: "ALICE_IA", text: "Turing não apenas quebrou códigos nazistas... ele criou os fundamentos para uma IA revolucionária!" },
        { name: "ALICE_IA", text: "Agora, grupos maliciosos querem usar esse poder. Você deve proteger este legado!" },
        { name: "ALICE_IA", text: "Vou te guiar através dos fundamentos da criptografia e IA. Vamos começar!" }
    ]
};

function showDialog(dialogKey) {
    currentDialog = dialogs[dialogKey];
    dialogIndex = 0;
    window.gameState = 'DIALOG';
    showNextDialog();
}

function showNextDialog() {
    if (dialogIndex < currentDialog.length) {
        const dialog = currentDialog[dialogIndex];
        document.getElementById('dialogName').textContent = dialog.name;
        document.getElementById('dialogText').textContent = dialog.text;
        document.getElementById('dialogBox').classList.add('active');
        dialogIndex++;
    } else {
        hideDialog();
    }
}

function hideDialog() {
    document.getElementById('dialogBox').classList.remove('active');
    window.gameState = 'PLAYING';
}

function nextDialog() {
    showNextDialog();
}

// Sistema de desafios
let currentChallenge = null;

function startChallenge(obj) {
    currentChallenge = obj;
    window.gameState = 'CHALLENGE';
    document.getElementById('challengeQuestion').textContent = obj.question;
    document.getElementById('challengeInput').value = '';
    document.getElementById('challengeBox').classList.add('active');
    document.getElementById('challengeInput').focus();
}

function submitChallenge() {
    if (!currentChallenge) return;
    
    const userAnswer = document.getElementById('challengeInput').value.toLowerCase().trim();
    if (userAnswer === currentChallenge.answer.toLowerCase()) {
        showAIMessage("✅ Correto! Você avançou!");
        document.getElementById('challengeBox').classList.remove('active');
        window.gameState = 'PLAYING';
        advancePhase();
    } else {
        showAIMessage("❌ Tente novamente!");
        document.getElementById('challengeInput').value = '';
        document.getElementById('challengeInput').focus();
    }
}

function cancelChallenge() {
    document.getElementById('challengeBox').classList.remove('active');
    window.gameState = 'PLAYING';
    currentChallenge = null;
}

function advancePhase() {
    currentPhase++;
    if (currentPhase > 3) {
        window.gameState = 'VICTORY';
        showAIMessage("🎉 Parabéns! Você protegeu o legado de Turing!");
    } else {
        showAIMessage(`🏁 Fase ${currentPhase} iniciada! Continue explorando.`);
    }
} 