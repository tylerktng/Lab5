// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const canvas = document.getElementById('user-image');
const ctx = canvas.getContext('2d');
const imgsel = document.getElementById('image-input');
const form = document.getElementById('generate-meme');
const clearbutton = document.getElementById('button-group').children[0];
const readbutton = document.getElementById('button-group').children[1];
const synth = window.speechSynthesis;
const toptext = document.getElementById('text-top');
const bottext = document.getElementById('text-bottom');
const voicesel = document.getElementById('voice-selection');
const volicon = document.getElementById('volume-group').children[0];
const volrange = document.getElementById('volume-group').children[1];
var dim = { 'width': 0, 'height': 0, 'startX': 0, 'startY': 0 };
const voices = synth.getVoices();
window.onload = function() {
    voicesel.disabled = voices.length === 0;
    if(!voicesel.disabled) {
        voicesel.children[0].remove();
    }
    voices.sort((a, b) => {
        return a.name > b.name;
    })
    voices.forEach((v, i) =>{
        let option = document.createElement('option');
        option.textContent = v.name + ' - ' + v.lang;
        option.setAttribute('voice-index', i);
        voicesel.appendChild(option);
        if(v.default){
            voicesel.value = option.name;
        }        

    });
};

window.onbeforeunload = function() {
    allreset();
};

imgsel.addEventListener('change', () => {
    let url = URL.createObjectURL(imgsel.files[0]);
    img.src = url;
    img.alt = imgsel.files[0].name;
});

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO
    reloadImage();
    clearbutton.disabled = false;
  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

clearbutton.addEventListener('click', () => {
    allreset();
});
readbutton.addEventListener('click', () => {
    if(volrange.value / 100 > 0) {        
        let text1, text2;
        text1 = new SpeechSynthesisUtterance(toptext.value);
        let selvoice = voices[voicesel.selectedOptions[0].getAttribute('voice-index')];
        text1.volume = volrange.value / 100;
        text1.voice = selvoice;
        text2 = new SpeechSynthesisUtterance(bottext.value);
        text2.volume = volrange.value / 100;
        text2.voice = selvoice;
        synth.speak(text1);
        synth.speak(text2);
    }
});

toptext.addEventListener('change', () => {
    if(toptext.value === "") {
        readbutton.disabled = bottext.value === "";
    } else {
        readbutton.disabled = voicesel.disabled;
    }
});

bottext.addEventListener('change', () => {
    if(bottext.value === "") {
        readbutton.disabled = toptext.value === "";
    } else {
        readbutton.disabled = voicesel.disabled;
    }
});

form.addEventListener('submit', (event) => {

    reloadImage();
    drawText();

    event.preventDefault();
});

volrange.addEventListener('input', () => {
    if(volrange.value > 66) {
        volicon.src = "icons/volume-level-3.svg";
        volicon.alt = "level3";
    } else if(volrange.value > 33) {
        volicon.src = "icons/volume-level-2.svg";
        volicon.alt = "level2";
    } else if(volrange.value > 0) {
        volicon.src = "icons/volume-level-1.svg";
        volicon.alt = "level1";
    } else {
        volicon.src = "icons/volume-level-0.svg";
        volicon.alt = "level0";
    }
});

function reloadImage() {
    if(img.src === "") {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        dim.startY = 30;
        dim.height = canvas.height - 60;
    } else {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        dim = getDimensions(canvas.width, canvas.height, img.width, img.height);
        ctx.drawImage(img, dim.startX, dim.startY, dim.width, dim.height);    
    }
}

function drawText() {
    ctx.font = dim.startY + "px impact";
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'top';
    ctx.fillText(toptext.value, canvas.width / 2, 0);
    ctx.fillText(bottext.value, canvas.width / 2, dim.height + dim.startY);
}

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}

function allreset() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    img.src = "";
    img.alt = "";
    form.reset();
    clearbutton.disabled = true;
    readbutton.disabled = true;
}