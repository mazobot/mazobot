const loginScreen = document.getElementById("login-screen");
const desktop = document.getElementById("desktop");
const loginButton = document.getElementById("login-button");
const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
const windowMenu = document.getElementById("window-menu");
let popupLoopTimer = null;
let loginLocked = false;
let totalPopupsCreated = 0;

function logout() {
    if (popupLoopTimer) {
        clearTimeout(popupLoopTimer);
        popupLoopTimer = null;
    }

    desktop.style.display = "none";
    loginScreen.style.display = "flex";
    startMenu.hidden = true;
    windowMenu.hidden = true;

    document.querySelectorAll(".app-window").forEach(windowEl => {
        windowEl.hidden = true;
    });

    document.getElementById("accessdenied-screen").hidden = true;
    document.getElementById("dead").hidden = true;
    document.getElementById("kicked").hidden = true;
}

function openApp(id) {
    const app = document.getElementById(id);
    if (!app) return;

    app.hidden = false;
    app.style.zIndex = String(getNextZIndex());
}

function closeApp(id) {
    const app = document.getElementById(id);
    if (!app) return;

    app.hidden = true;
}

function getNextZIndex() {
    const windows = [...document.querySelectorAll(".app-window")];
    let currentMax = 10;

    windows.forEach(windowEl => {
        if (!windowEl.hidden) {
            currentMax = Math.max(currentMax, Number(windowEl.style.zIndex || 10));
        }
    });

    return currentMax + 1;``
}

function randomizeSusIcon() {
    const susIcon = document.querySelector(".sus-icon");
    if (!susIcon) return;

    const left = Math.random() * 80 + 5;
    const top = Math.random() * 68 + 8;
    susIcon.style.left = `${left}%`;
    susIcon.style.top = `${top}%`;
}

function maybeShowEasterEgg(chance = 0.2) {
    const easterEgg = document.getElementById("easter-egg");
    if (!easterEgg || !easterEgg.hidden || loginLocked) return;

    if (Math.random() < chance) {
        easterEgg.hidden = false;
        setTimeout(() => {
            easterEgg.hidden = true;
        }, 2500);
    }
}

loginButton.addEventListener("click", function() {
    if (loginLocked) return;

    randomizeSusIcon();
    maybeShowEasterEgg(0.3);
    loginScreen.style.display = "none";
    desktop.style.display = "block";
});

document.querySelector(".sus-icon").addEventListener("click", function() {
    maybeShowEasterEgg(0.5);
    startPopupLoop();
});

startButton.addEventListener("click", function() {
    startMenu.hidden = !startMenu.hidden;
    document.querySelector(".logout-item").style.display = startMenu.hidden ? "none" : "block";
});

document.querySelectorAll(".window-header").forEach(header => {
    const menuButton = document.createElement("button");
    menuButton.type = "button";
    menuButton.className = "window-menu-button";
    menuButton.textContent = "⋮";
    menuButton.setAttribute("aria-label", "Window menu");

    menuButton.addEventListener("click", function(event) {
        event.stopPropagation();
        const rect = header.getBoundingClientRect();
        windowMenu.style.top = `${rect.top + rect.height + 6}px`;
        windowMenu.style.left = `${rect.left + rect.width - 120}px`;
        windowMenu.hidden = !windowMenu.hidden;
    });

    header.appendChild(menuButton);
});

document.querySelectorAll(".start-menu-item").forEach(button => {
    button.addEventListener("click", function() {
        if (this.dataset.action === "logout") {
            logout();
            return;
        }

        openApp(this.dataset.app);
        startMenu.hidden = true;
        document.querySelector(".logout-item").style.display = "none";
    });
});

document.querySelector(".window-menu-item").addEventListener("click", function() {
    logout();
});

document.addEventListener("click", function(event) {
    if (!event.target.closest(".window-menu-button") && !event.target.closest(".window-menu-item")) {
        windowMenu.hidden = true;
    }
});

document.querySelectorAll(".app-window").forEach(windowEl => {
    windowEl.addEventListener("mousedown", function() {
        this.style.zIndex = String(getNextZIndex());
    });
});

let dragWindow = null;
let offsetX = 0;
let offsetY = 0;

document.querySelectorAll("[data-drag-handle]").forEach(handle => {
    handle.addEventListener("mousedown", function(event) {
        const windowEl = this.closest(".app-window");
        if (!windowEl || windowEl.hidden) return;

        dragWindow = windowEl;
        const rect = dragWindow.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
        dragWindow.style.zIndex = String(getNextZIndex());
    });
});

document.addEventListener("mousemove", function(event) {
    if (!dragWindow) return;

    dragWindow.style.left = `${event.clientX - offsetX}px`;
    dragWindow.style.top = `${event.clientY - offsetY}px`;
});

document.addEventListener("mouseup", function() {
    dragWindow = null;
});

function createFloatingPopup() {
    if (!desktop || desktop.style.display === "none") return;

    const popupLayer = document.getElementById("popup-layer");
    if (!popupLayer) return;

    const messages = [
        { title: "Alert", text: "You are being watched...", image: "strona/jak.webp", imageSize: "52px" },
        { title: "Sus", text: "The desktop is not safe.", image: "strona/jak.webp", imageSize: "70px" },
        { title: "Warning", text: "Something is moving behind the screen.", image: "strona/jak.webp", imageSize: "60px" },
        { title: "Baka", text: "You have been susy baka'd.", image: "strona/jak.webp", imageSize: "75px"}, 
        { title: "System", text: "Another anihilation has occurred.", image: "strona/jak.webp", imageSize: "48px" }
    ];

    const item = messages[Math.floor(Math.random() * messages.length)];
    const popup = document.createElement("div");
    popup.className = "floating-popup";
    let popupImage = null;

    if (item.image) {
        popupImage = document.createElement("img");
        popupImage.src = item.image;
        popupImage.alt = item.title;
        popupImage.className = "popup-image";
        popupImage.style.width = item.imageSize || "50px";
        popupImage.style.height = item.imageSize || "50px";

        const popupBody = document.createElement("div");
        popupBody.className = "popup-body";
        popupBody.innerHTML = `
            <strong>${item.title}</strong>
            <span>${item.text}</span>
        `;

        popup.appendChild(popupBody);
        popup.appendChild(popupImage);
    } else {
        popup.innerHTML = `<strong>${item.title}</strong>${item.text}`;
    }

    const maxX = Math.max(desktop.clientWidth - 220, 1);
    const maxY = Math.max(desktop.clientHeight - 120, 1);
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    const baseSpeed = 0.7;
    const speed = Math.min(baseSpeed * Math.pow(1.3, totalPopupsCreated), 6);
    const vx = (Math.random() * 2 - 1) * speed;
    const vy = (Math.random() * 2 - 1) * speed;

    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.dataset.vx = String(vx);
    popup.dataset.vy = String(vy);

    if (popupImage) {
        popupImage.style.transform = vx < 0 ? "scaleX(-1)" : "scaleX(1)";
    }

    popup.addEventListener("click", function() {
        popup.remove();
    });

    popupLayer.appendChild(popup);
    totalPopupsCreated += 1;

    if (popupLayer.querySelectorAll(".floating-popup").length >= 15) {
        lockLogin();
        return;
    }

    const move = () => {
        const left = parseFloat(popup.style.left) || 0;
        const top = parseFloat(popup.style.top) || 0;
        let nextX = left + Number(popup.dataset.vx);
        let nextY = top + Number(popup.dataset.vy);

        if (nextX <= 0 || nextX >= maxX) {
            popup.dataset.vx = String(-Number(popup.dataset.vx));
            nextX = Math.min(Math.max(nextX, 0), maxX);
        }

        if (popupImage) {
            popupImage.style.transform = Number(popup.dataset.vx) < 0 ? "scaleX(-1)" : "scaleX(1)";
        }

        if (nextY <= 0 || nextY >= maxY) {
            popup.dataset.vy = String(-Number(popup.dataset.vy));
            nextY = Math.min(Math.max(nextY, 0), maxY);
        }

        popup.style.left = `${nextX}px`;
        popup.style.top = `${nextY}px`;

        if (popup.isConnected) {
            requestAnimationFrame(move);
        }
    };

    requestAnimationFrame(move);
}

function startPopupLoop() {
    if (loginLocked) return;

    if (popupLoopTimer) {
        clearTimeout(popupLoopTimer);
    }

    function scheduleNextPopup() {
        if (desktop.style.display !== "block") return;

        const popupCount = totalPopupsCreated;
        const minDelay = 1000;
        const maxDelay = Math.max(minDelay, (20 - popupCount * 3) * 1000);
        const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;

        popupLoopTimer = setTimeout(() => {
            if (desktop.style.display === "block" && !loginLocked) {
                createFloatingPopup();
            }
            if (!loginLocked) scheduleNextPopup();
        }, randomDelay);
    }

    scheduleNextPopup();
}

function lockLogin() {
    loginLocked = true;

    if (popupLoopTimer) {
        clearTimeout(popupLoopTimer);
        popupLoopTimer = null;
    }

    document.querySelectorAll(".floating-popup").forEach(popup => popup.remove());
    desktop.style.display = "none";
    loginScreen.style.display = "flex";
    AccessDenied();
    Dead();
    Kicked();
    loginButton.disabled = true;
    loginButton.textContent = "Access denied";
}

function updateClock() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

const calculatorOutput = document.getElementById('calculator-output');
let calculatorValue = '0';
let calculatorPreviousValue = null;
let calculatorOperator = null;
let calculatorShouldReset = false;

function updateCalculatorDisplay() {
    if (!calculatorOutput) return;
    calculatorOutput.textContent = calculatorValue;
}

function clearCalculator() {
    calculatorValue = '0';
    calculatorPreviousValue = null;
    calculatorOperator = null;
    calculatorShouldReset = false;
    updateCalculatorDisplay();
}

function appendNumber(number) {
    if (calculatorValue === 'Error') {
        calculatorValue = '0';
    }

    if (calculatorShouldReset) {
        calculatorValue = number;
        calculatorShouldReset = false;
    } else {
        calculatorValue = calculatorValue === '0' ? number : calculatorValue + number;
    }

    updateCalculatorDisplay();
}

function appendDecimal() {
    if (calculatorValue === 'Error') {
        calculatorValue = '0';
    }

    if (calculatorShouldReset) {
        calculatorValue = '0.';
        calculatorShouldReset = false;
        updateCalculatorDisplay();
        return;
    }

    if (!calculatorValue.includes('.')) {
        calculatorValue += '.';
    }

    updateCalculatorDisplay();
}

function deleteLastCalculatorDigit() {
    if (calculatorValue === 'Error') {
        clearCalculator();
        return;
    }

    if (calculatorShouldReset) {
        calculatorValue = '0';
        calculatorShouldReset = false;
        updateCalculatorDisplay();
        return;
    }

    calculatorValue = calculatorValue.length <= 1 ? '0' : calculatorValue.slice(0, -1);
    updateCalculatorDisplay();
}

function applyCalculatorOperator(nextOperator) {
    const currentValue = Number(calculatorValue);

    if (calculatorOperator && calculatorPreviousValue !== null && !calculatorShouldReset) {
        performCalculatorCalculation();
    }

    calculatorPreviousValue = currentValue;
    calculatorOperator = nextOperator;
    calculatorShouldReset = true;
}

function performCalculatorCalculation() {
    if (calculatorOperator === null || calculatorPreviousValue === null) {
        return;
    }

    const currentValue = Number(calculatorValue);
    let result;

    switch (calculatorOperator) {
        case '+':
            result = calculatorPreviousValue + currentValue;
            break;
        case '-':
            result = calculatorPreviousValue - currentValue;
            break;
        case '*':
            result = calculatorPreviousValue * currentValue;
            break;
        case '/':
            result = currentValue === 0 ? 'Error' : calculatorPreviousValue / currentValue;
            break;
        default:
            return;
    }

    if (result === 'Error') {
        calculatorValue = 'Error';
    } else {
        calculatorValue = Number.isInteger(result) ? String(result) : Number(result.toFixed(10)).toString();
    }

    calculatorPreviousValue = null;
    calculatorOperator = null;
    calculatorShouldReset = true;
    updateCalculatorDisplay();
}

function handleCalculatorButtonClick(event) {
    const button = event.currentTarget;
    const action = button.dataset.action;
    const value = button.dataset.value;

    if (action === 'clear') {
        clearCalculator();
        return;
    }

    if (action === 'delete') {
        deleteLastCalculatorDigit();
        return;
    }

    if (action === 'number') {
        appendNumber(value);
        return;
    }

    if (action === 'decimal') {
        appendDecimal();
        return;
    }

    if (action === 'operator') {
        applyCalculatorOperator(value);
        return;
    }

    if (action === 'equals') {
        performCalculatorCalculation();
    }
}

document.querySelectorAll('.calculator-btn').forEach(button => {
    button.addEventListener('click', handleCalculatorButtonClick);
});
function AccessDenied() {
    const accessDeniedScreen = document.getElementById("accessdenied-screen");
    if (accessDeniedScreen) {
        accessDeniedScreen.hidden = false;
    }
    else {
        console.error("Access Denied screen element not found.");
    }
}

function Dead() {
    const deadScreen = document.getElementById("dead");
    if (deadScreen) {
        deadScreen.hidden = false;
    }
    else {
        console.error("Dead screen element not found.");
    }
}

function Kicked() {
    const kickedScreen = document.getElementById("kicked");
    if (kickedScreen) {
        kickedScreen.hidden = false;
    }
    else {
        console.error("Kicked screen element not found.");
    }
}
function showEasterEgg() {
    const easterEggScreen = document.getElementById("easter-egg");  
    if (easterEggScreen) {
        easterEggScreen.hidden = false;
    }
    else {
        console.error("Easter Egg screen element not found.");
    }
}



updateClock();
setInterval(updateClock, 1000);
