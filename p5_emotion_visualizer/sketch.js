
let values = [];
let maxValues = 300;
let port;
let reader;
let connectButton;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();
  strokeWeight(2);
  connectButton = select('#connectButton');
  connectButton.mousePressed(connectSerial);
}

function draw() {
  background(0);
  if (values.length > 1) {
    beginShape();
    for (let i = 0; i < values.length; i++) {
      let y = map(values[i], 0, 1023, height * 0.75, height * 0.25);
      let amt = map(values[i], 0, 1023, 0.2, 1);
      stroke(lerpColor(color(255, 165, 100), color(255, 69, 0), amt));
      curveVertex(map(i, 0, maxValues - 1, 0, width), y);
    }
    endShape();
  }
}

async function connectSerial() {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    reader = port.readable.getReader();
    readSerial();
  } catch (err) {
    console.error('串口连接失败:', err);
  }
}

async function readSerial() {
  let buffer = '';
  while (true) {
    try {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += new TextDecoder().decode(value);
      let lines = buffer.split('\n');
      buffer = lines.pop();
      for (let line of lines) {
        let val = parseInt(line.trim());
        if (!isNaN(val)) {
          values.push(val);
          if (values.length > maxValues) values.shift();
        }
      }
    } catch (err) {
      console.error('读取串口数据错误:', err);
      break;
    }
  }
}
