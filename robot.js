// Canvas elements
const canvasWrapper = document.getElementById("canvas-wrapper");
const canvasWrapperRect = canvasWrapper.getBoundingClientRect();
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Robot inputs
const robotHeightInput = document.getElementById("robot-height");
const angleDegreesInput = document.getElementById("angle-degrees");

// Motor inputs
const torqueInput = document.getElementById("torque");
const maxTorqueInput = document.getElementById("max-torque");
const maxAngularVelocityInput = document.getElementById("max-angular-velocity");

// Ball inputs
const ballDensityInput = document.getElementById("ball-density");
const ballDiameterInput = document.getElementById("ball-diameter");

// Rod inputs
const rodDensityInput = document.getElementById("rod-density");
const rodDiameterInput = document.getElementById("rod-diameter");
const rodLengthInput = document.getElementById("rod-length");
const rodPivotLengthInput = document.getElementById("rod-pivot-length");

// Calculation inputs
const ballRadiusInput = document.getElementById("ball-radius");
const ballVolumeInput = document.getElementById("ball-volume");
const ballMassInput = document.getElementById("ball-mass");
const ballInertiaCenterOfMassInput = document.getElementById("ball-I-cm");
const ballInertiaPivotInput = document.getElementById("ball-I-pivot");
const rodRadiusInput = document.getElementById("rod-radius");
const rodVolumeInput = document.getElementById("rod-volume");
const rodMassInput = document.getElementById("rod-mass");
const rodInertiaCenterOfMassInput = document.getElementById("rod-I-cm");
const rodInertiaPivotInput = document.getElementById("rod-I-pivot");
const totalInertiaInput = document.getElementById("total-I");
const angleRadiansInput = document.getElementById("angle-radians");
const ballPositionXInput = document.getElementById("ball-x");
const ballPositionYInput = document.getElementById("ball-y");
const timeToSpinMotorInput = document.getElementById("motor-time");
const angularVelocityInput = document.getElementById("angular-velocity");
const tangentialVelocityInput = document.getElementById("tangential-velocity");
const initialVelocityXInput = document.getElementById("initial-velocity-x");
const initialVelocityYInput = document.getElementById("initial-velocity-y");
const travelTimeInput = document.getElementById("travel-time");
const travelDistanceInput = document.getElementById("travel-distance");

// Physics utilities
const gravity = -9.8; // m/s^2

const getPositions = (
  initialPositionX,
  initialPositionY,
  initialVelocityX,
  initialVelocityY,
  totalTime,
  numberOfPoints
) => {
  let xPositions = [];
  let yPositions = [];
  const dt = totalTime / (numberOfPoints - 1);

  // Calculate the x and y positions at various points in time
  for (let i = 0; i < numberOfPoints; i++) {
    const time = i * dt;
    const xPosition = initialPositionX + initialVelocityX * time;
    const yPosition =
      initialPositionY +
      initialVelocityY * time +
      (1 / 2) * gravity * Math.pow(time, 2);
    xPositions.push(xPosition);
    yPositions.push(yPosition);
  }

  return {
    x: xPositions,
    y: yPositions,
  };
};

const solveQuadratic = (a, b, c) => {
  const b2 = Math.pow(b, 2);
  const sqrt = Math.sqrt(b2 - 4 * a * c);
  const x1 = (-b + sqrt) / (2 * a);
  const x2 = (-b - sqrt) / (2 * a);
  return [x1, x2];
};

// Canvas utilities
const pixelMeterFactor = 250; // Arbitrary factor to scale meters to canvas pixels

const pixelToMeter = (pixel) => {
  return pixel / pixelMeterFactor;
};

const meterToPixel = (meter) => {
  return meter * pixelMeterFactor;
};

const redrawCanvas = () => {
  canvas.width = canvasWrapperRect.width;
  canvas.height = canvasWrapperRect.height;

  drawRobot();
};

let drawRobot = () => {
  // Convert the robot height in meters to pixels and adjust for the canvas coordinate system
  const robotHeightMeters = parseFloat(robotHeightInput.value);
  const robotHeightPixels = -1 * meterToPixel(robotHeightMeters);
  const robotWidth = 50;
  const robotX = 100;
  const robotY = canvas.height;

  // Draw the robot as a rectangle
  ctx.fillStyle = "#BA89E0";
  ctx.fillRect(robotX, robotY, robotWidth, robotHeightPixels);

  // Draw the pivot
  const pivotRadius = 2;
  const pivotCenterX = robotX + robotWidth / 2;
  const pivotCenterY = robotY + robotHeightPixels;
  ctx.beginPath();
  ctx.arc(pivotCenterX, pivotCenterY, pivotRadius, 0, 2 * Math.PI, false);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.save();

  // Draw the rod as a rotated rectangle centered about the pivot and also draw the ball at the end of the rod.
  // Note: We're adjusting the canvas coordinate system here to make it easier to draw these pieces.
  const initialRodAngleRadians = parseFloat(angleRadiansInput.value);
  const adjustedRodAngleRadians = (3 * Math.PI) / 2 - initialRodAngleRadians; // Adjust by 270 degrees for the canvas coordinate system
  const rodLength = meterToPixel(parseFloat(rodLengthInput.value));
  const rodPivotLength = meterToPixel(parseFloat(rodPivotLengthInput.value));
  const rodRadius = meterToPixel(parseFloat(rodRadiusInput.value));
  const rodWidth = rodRadius * 2;
  const pivotOffset = rodLength - rodPivotLength;
  const pivotOffsetX = pivotOffset * Math.cos(initialRodAngleRadians);
  const pivotOffsetY = pivotOffset * Math.sin(initialRodAngleRadians);
  const translateX = pivotCenterX - pivotOffsetX;
  const translateY = pivotCenterY + pivotOffsetY;
  ctx.beginPath();
  ctx.translate(translateX, translateY);
  ctx.rotate(adjustedRodAngleRadians);
  ctx.translate(-translateX, -translateY);
  ctx.fillStyle = "#7A7F80";
  ctx.fillRect(translateX, translateY, rodWidth, rodLength);

  const ballRadius = meterToPixel(parseFloat(ballRadiusInput.value));
  const ballCenterX = translateX;
  const ballCenterY = translateY + rodLength - ballRadius;
  ctx.arc(ballCenterX, ballCenterY, ballRadius, 0, 2 * Math.PI, false);
  ctx.fillStyle = "#ADB2BD";
  ctx.fill();

  // Draw the path of the ball using the original coordinate system
  ctx.restore();
  const initialPositionX = parseFloat(ballPositionXInput.value);
  const initialPositionY = parseFloat(ballPositionYInput.value);
  const initialVelocityX = parseFloat(initialVelocityXInput.value);
  const initialVelocityY = parseFloat(initialVelocityYInput.value);
  const totalTime = parseFloat(travelTimeInput.value);
  const numberOfPoints = 100;
  const data = getPositions(
    initialPositionX,
    initialPositionY,
    initialVelocityX,
    initialVelocityY,
    totalTime,
    numberOfPoints
  );
  ctx.fillStyle = "red";
  for (let i = 0; i < data.x.length; i++) {
    const x = meterToPixel(data.x[i]);
    const y = meterToPixel(data.y[i]);
    ctx.beginPath();
    ctx.arc(
      pivotCenterX + ballRadius + x,
      canvas.height + ballRadius - y,
      1,
      0,
      2 * Math.PI,
      false
    );
    ctx.fill();
  }
};

// Calculations
const updateRobotCalculations = () => {
  // Convert degrees to radians
  const angleDegrees = parseFloat(angleDegreesInput.value);
  const angleRadians = (angleDegrees * Math.PI) / 180;

  // Calculate the x and y components of the ball position based on the rod angle
  const robotHeight = parseFloat(robotHeightInput.value);
  const rodPivotLength = parseFloat(rodPivotLengthInput.value);
  const ballPositionX = rodPivotLength * Math.cos(angleRadians);
  const ballPositionY = rodPivotLength * Math.sin(angleRadians) + robotHeight;

  // Update the UI
  angleRadiansInput.value = angleRadians;
  ballPositionXInput.value = ballPositionX.toExponential(5);
  ballPositionYInput.value = ballPositionY.toExponential(5);
};

const updateBallCalculations = () => {
  // Calculate the ball mass
  const ballDensity = parseFloat(ballDensityInput.value);
  const ballDiameter = parseFloat(ballDiameterInput.value);
  const ballRadius = ballDiameter / 2;
  const ballVolume = (4 / 3) * Math.PI * Math.pow(ballRadius, 3); // m^3
  const ballMass = ballDensity * ballVolume; // kg

  // Calculate the moments of inertia
  const rodPivotLength = parseFloat(rodPivotLengthInput.value);
  const ballInertiaCenterOfMass = (2 / 5) * ballMass * Math.pow(ballRadius, 2); // kg m^2
  const ballInertiaPivot = ballMass * Math.pow(rodPivotLength, 2); // kg m^2

  // Update the UI
  ballRadiusInput.value = ballRadius;
  ballVolumeInput.value = ballVolume.toExponential(5);
  ballMassInput.value = ballMass.toExponential(5);
  ballInertiaCenterOfMassInput.value = ballInertiaCenterOfMass.toExponential(5);
  ballInertiaPivotInput.value = ballInertiaPivot.toExponential(5);
};

const updateRodCalculations = () => {
  // Calculate the rod mass
  const rodDensity = parseFloat(rodDensityInput.value);
  const rodDiameter = parseFloat(rodDiameterInput.value);
  const rodLength = parseFloat(rodLengthInput.value);
  const rodRadius = rodDiameter / 2;
  const rodVolume = Math.PI * Math.pow(rodRadius, 2) * rodLength; // m^3
  const rodMass = rodDensity * rodVolume; // kg

  // Calculate the moments of inertia
  const rodCenter = rodLength / 2;
  const rodPivotLength = parseFloat(rodPivotLengthInput.value);
  const rodInertiaCenterOfMass = (1 / 12) * rodMass * Math.pow(rodLength, 2); // kg m^2
  const rodInertiaPivot = rodMass * Math.pow(rodPivotLength - rodCenter, 2); // kg m^2

  // Update the UI
  rodRadiusInput.value = rodRadius;
  rodVolumeInput.value = rodVolume.toExponential(5);
  rodMassInput.value = rodMass.toExponential(5);
  rodInertiaCenterOfMassInput.value = rodInertiaCenterOfMass.toExponential(5);
  rodInertiaPivotInput.value = rodInertiaPivot.toExponential(5);
};

const updateMotorCalculations = () => {
  // Calculate the total moment of inertia
  const ballInertiaCenterOfMass = parseFloat(
    ballInertiaCenterOfMassInput.value
  );
  const ballInertiaPivot = parseFloat(ballInertiaPivotInput.value);
  const rodInertiaCenterOfMass = parseFloat(rodInertiaCenterOfMassInput.value);
  const rodInertiaPivot = parseFloat(rodInertiaPivotInput.value);
  const totalInertia =
    ballInertiaCenterOfMass +
    ballInertiaPivot +
    rodInertiaCenterOfMass +
    rodInertiaPivot; // kg m^2

  // Calculate the time it takes to spin the motor and angular velocity
  const torque = parseFloat(torqueInput.value);
  const maxTorque = parseFloat(maxTorqueInput.value);
  const maxAngularVelocity = parseFloat(maxAngularVelocityInput.value);
  const timeToSpinMotor = (totalInertia * maxAngularVelocity) / maxTorque; // s
  const angularVelocity = (torque * timeToSpinMotor) / totalInertia; // rad/s

  // Update the UI
  totalInertiaInput.value = totalInertia.toExponential(5);
  timeToSpinMotorInput.value = timeToSpinMotor.toExponential(5);
  angularVelocityInput.value = angularVelocity.toExponential(5);
};

const updateKinematicsCalculations = () => {
  // Calculate the tangential velocity and the corresponding x and y components
  const ballPositionX = parseFloat(ballPositionXInput.value);
  const ballPositionY = parseFloat(ballPositionYInput.value);
  const angularVelocity = parseFloat(angularVelocityInput.value);
  const adjustedAngleRadians =
    parseFloat(angleRadiansInput.value) - Math.PI / 2;
  const rodPivotLength = parseFloat(rodPivotLengthInput.value);
  const tangentialVelocity = rodPivotLength * angularVelocity; // m/s
  const initialVelocityX = tangentialVelocity * Math.cos(adjustedAngleRadians); // m/s
  const initialVelocityY = tangentialVelocity * Math.sin(adjustedAngleRadians); // m/s

  // Solve quadratic for travel time and calculate the travel distance
  // 0 = (xi - xf) + (vi * t) + (1/2 * a * t^2)
  const a = (1 / 2) * gravity;
  const b = initialVelocityY;
  const c = ballPositionY;
  const times = solveQuadratic(a, b, c);
  const travelTime = Math.max(...times); // s
  const travelDistance = ballPositionX + initialVelocityX * travelTime; // m

  // Update the UI
  tangentialVelocityInput.value = tangentialVelocity.toExponential(5);
  initialVelocityXInput.value = initialVelocityX.toExponential(5);
  initialVelocityYInput.value = initialVelocityY.toExponential(5);
  travelTimeInput.value = travelTime.toExponential(5);
  travelDistanceInput.value = travelDistance.toExponential(5);
};

const updateCalculations = () => {
  updateRobotCalculations();
  updateBallCalculations();
  updateRodCalculations();
  updateMotorCalculations();
  updateKinematicsCalculations();
};

// Initialize
const refresh = () => {
  updateCalculations();
  redrawCanvas();
};
refresh();

// Add Event Listeners
window.onresize = redrawCanvas();
robotHeightInput.addEventListener("change", refresh);
robotHeightInput.addEventListener("input", refresh);
angleDegreesInput.addEventListener("change", refresh);
angleDegreesInput.addEventListener("input", refresh);
torqueInput.addEventListener("change", refresh);
torqueInput.addEventListener("input", refresh);
maxTorqueInput.addEventListener("change", refresh);
maxTorqueInput.addEventListener("input", refresh);
maxAngularVelocityInput.addEventListener("change", refresh);
maxAngularVelocityInput.addEventListener("input", refresh);
ballDensityInput.addEventListener("change", refresh);
ballDensityInput.addEventListener("input", refresh);
ballDiameterInput.addEventListener("change", refresh);
ballDiameterInput.addEventListener("input", refresh);
rodDensityInput.addEventListener("change", refresh);
rodDensityInput.addEventListener("input", refresh);
rodDiameterInput.addEventListener("change", refresh);
rodDiameterInput.addEventListener("input", refresh);
rodLengthInput.addEventListener("change", refresh);
rodLengthInput.addEventListener("input", refresh);
rodPivotLengthInput.addEventListener("change", refresh);
rodPivotLengthInput.addEventListener("input", refresh);
