// TODO: Dar alguna memorizacion para los parametros. Escribir "help".
const hideParametersHtmlSource = 
`<button id="showParam">Show Parameters</button>`

let parameterHtmlSource = 
`<span>Vector Field Parameters:</span><br>

<form id="parameters">
    <label for="X">X Component</label>
    <input id="xComp" value="x * y">
    <label for="Y">Y Component</label>
    <input id="yComp" value="50.0 * sin(sqrt(x*x + y*y))">
    <label for="Y">Particle Amount</label>
    <input id="partAmount" value="400000">
    <label for="Y">X screen amplitude</label>
    <input id="xAmp" value="50">
    <label for="Y">Y screen amplitude</label>
    <input id="yAmp" value="25">
    <label for="Y">Min. Colored Speed</label>
    <input id="minColSpeed" value="1">
</form>

<span>Restart:</span>
<input type="radio" id="congruence" name="type" value="congruence">
<label for="congruence">Congruence</label>
<input type="radio" id="randomPos" name="type" value="randomPos" checked>
<label for="restart">Random Pos.</label>
<input type="radio" id="noRestart" name="type" value="noRestart">
<label for="noRestart">No restart</label><br>

<button id="start">Start</button>
<button id="help">Help</button>
<button id="hideParam">Hide Parameters</button>
<span>Particle Color:</span>
<input type="color" id="color" name="color" value="#e66465">`

const popupText = 
`X/Y Component: Vector field expression. Numbers must go with decimals (eg 1 should be 1.0)

X/Y Screen Amplitude: Distance from center of screen to the sides

Min Colored Speed: Minimum speed for drawn particles (pixels/s)

Restart: Congruence makes the screen a toroid, Random Pos. puts particles in random positions after they are outside the screen, No Restart does nothing when particles go off the screen.`

function helpPopUp() {
    alert(popupText);
}

function hexToRgbA(hex){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return [((c>>16)&255) / 255, ((c>>8)&255) / 255, (c&255) / 255, 1];
    }
    throw new Error('Bad Hex');
}


let paramBox = document.getElementById("paramBox");

function runField() {
    paramBox = document.getElementById("paramBox");
    parameterHtmlSource = paramBox.innerHTML;
    console.log(parameterHtmlSource);

    const xComponent = document.getElementById("xComp").value;
    const yComponent = document.getElementById("yComp").value;
    const xAmplitude = document.getElementById("xAmp").value;
    const yAmplitude = document.getElementById("yAmp").value;
    const particleAmount = document.getElementById("partAmount").value;
    const minSpeed = document.getElementById("minColSpeed").value;

    const color = hexToRgbA(document.getElementById("color").value); // convert to rgba
    
    const restartPos = document.getElementById("randomPos");
    const moduloPos = document.getElementById("congruence");
    const noRestartPos = document.getElementById("noRestart");

    let mode = "";
    if (restartPos.checked) {
        mode = "restart";
    }
    else if (moduloPos.checked) {
        mode = "modulo";
    }
    else {
        mode = "noRestart";
    }

    main(xComponent, yComponent, [xAmplitude, yAmplitude], mode, color, particleAmount, minSpeed);
}

function hiddenParameterManagement() {
    paramBox.innerHTML = '';
    paramBox.insertAdjacentHTML('beforeend', hideParametersHtmlSource);
    let button = document.getElementById("showParam");
    button.addEventListener("click", showParameterManagement);
}

function showParameterManagement() {
    paramBox.innerHTML = '';
    paramBox.insertAdjacentHTML('beforeend', parameterHtmlSource);
    let hideButton = document.getElementById("hideParam");
    let startButton = document.getElementById("start");
    let helpButton = document.getElementById("help");
    hideButton.addEventListener("click", hiddenParameterManagement);
    startButton.addEventListener("click", runField);
    helpButton.addEventListener("click", helpPopUp);
}

showParameterManagement();