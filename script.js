const input = document.getElementById("terminal-input");
const output = document.getElementById("terminal-output");
let history = [];
let index = 0;

// Referência ao terminal
const terminal = document.querySelector(".terminal-window");

// Estado do jogo
let gameLoaded = false;

/* =============================
   FUNÇÕES DO TERMINAL 
============================= */

function printLine(text, color = "") {
  const div = document.createElement("div");
  div.className = "line " + color;
  div.innerHTML = text;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

function minimizeTerminal() {
  terminal.classList.add("terminal-minimized");
}

function maximizeTerminal() {
  terminal.classList.remove("terminal-minimized");
}

/* =============================
   FUNÇÕES DO JOGO 
============================= */

function startGame() {
  minimizeTerminal(); // Minimiza o terminal

  const gameArea = document.getElementById("game-area");
  gameArea.style.display = "block";

  if (!gameLoaded) {
    gameArea.innerHTML = `
      <iframe src="game/index.html"
              style="width:100%; height:100%; border:none;"></iframe>
    `;
    gameLoaded = true;
  }
}

function exitGame() {
  const gameArea = document.getElementById("game-area");
  gameArea.style.display = "none";

  maximizeTerminal();

  printLine("<span class='yellow'>Jogo encerrado.</span>");
}

/* =============================
   COMANDOS DO TERMINAL
============================= */

const commands = {
  help: () => `
    <span class="cyan">Available commands:</span><br>
    <span class="yellow">ls</span> - list sections<br>
    <span class="yellow">cd &lt;section&gt;</span> - enter section<br>
    <span class="yellow">clear</span> - clear terminal<br>
    <span class="yellow">whoami</span> - display user<br>
    <span class="yellow">about</span> - info about the project<br>
    <span class="yellow">history</span> - list past commands<br>
    <span class="yellow">exit</span> - sair do jogo
  `,

  ls: () => `
    <span class="green">games</span>  
    <span class="green">news</span>  
    <span class="green">store</span>  
    <span class="green">company</span>  
    <span class="green">community</span>
  `,

  cd: (arg) => {
    if (!arg) return "cd: missing argument";

    // abre o jogo
    if (arg === "games") {
      startGame();
      return `<span class="cyan">Iniciando jogo...</span>`;
    }

    // seções fake
    const sections = ["news", "store", "company", "community"];

    if (sections.includes(arg)) {
      return `<span class="cyan">Entering /${arg}...</span>`;
    }

    return `<span class="red">cd:</span> section not found: ${arg}`;
  },

  exit: () => {
    exitGame();
    return `<span class="red">Saindo do jogo...</span>`;
  },

  clear: () => {
    output.innerHTML = "";
    return null;
  },

  whoami: () => `<span class="yellow">You are:</span> Visitor`,

  about: () => `
    <span class="cyan">CRIPT Entertainment OS</span><br>
    Interactive terminal site created for fun and immersion.<br>
    Type <span class="yellow">'help'</span> to explore.
  `,
};

/* =============================
   INPUT DO TERMINAL
============================= */

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const commandText = input.value.trim();
    if (!commandText) return;

    printLine(`cript@entertainment:~$ ${commandText}`, "green");
    history.push(commandText);
    index = history.length;

    const [cmd, arg] = commandText.split(" ");
    if (commands[cmd]) {
      const result = commands[cmd](arg);
      if (result) printLine(result);
    } else {
      printLine(`<span class="red">Command not found:</span> ${cmd}`);
    }

    input.value = "";
  }

  if (e.key === "ArrowUp") {
    if (index > 0) {
      index--;
      input.value = history[index];
    }
  }

  if (e.key === "ArrowDown") {
    if (index < history.length - 1) {
      index++;
      input.value = history[index];
    } else {
      input.value = "";
    }
  }
});
