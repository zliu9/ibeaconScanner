var noble = require('noble');

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning([], true);
  } else {
    noble.stopScanning();
  }
});

var lastLPF;
var alpha = 0.8;
function LowPassFilter(rssi) {
  if(lastLPF === undefined) {
    lastLPF = rssi;
    return rssi;
  }

  var LPF = alpha * lastLPF + (1 - alpha) * rssi;
  lastLPF = LPF;
  return LPF;
}

function ibeaconParse(data) {

  if(data.length < 27) 
    return undefined;

  var ibeacon = {};
  var next = 4;
  var pos = 0;
  ibeacon.companyID = data.substring(pos, next);
  
  pos = next;
  next += 2;
  var prefix = data.substring(pos, next);
  
  if(prefix !== '02')
    return undefined;

  pos = next;
  next += 2;
  var length = parseInt(data.substring(pos, next), 16);
  if(length < (16 + 2 + 2 + 1))
    return undefined;


  pos = next;
  next += 16 * 2;
  ibeacon.uuid = data.substring(pos, next);

  pos = next;
  next += 4;
  ibeacon.major = parseInt(data.substring(pos, next), 16);

  pos = next;
  next += 4;
  ibeacon.minor = parseInt(data.substring(pos, next), 16);
  
  pos = next;
  next += 2;
  ibeacon.txPower = parseInt(data.substring(pos, next), 16);
  if ((ibeacon.txPower & 0x80) > 0) {
   ibeacon.txPower = ibeacon.txPower - 0x100;
  }
  //console.log(JSON.stringify(ibeacon));
  return ibeacon;
}

function rssiToDistance(rssi, txPower) {
  return Math.pow(10, (txPower - rssi) / (10 * 2));
}

function getDistance(peripheral) {
  var ibeacon = peripheral['ibeacon'];
  if(ibeacon) {
    console.log('use ibeacon :' + ibeacon.txPower);
    return rssiToDistance(peripheral.rssi, ibeacon.txPower);
  } else if(peripheral.advertisement.txPowerLevel !== undefined) {
    console.log('use txPowerLevel: ' + peripheral.advertisement.txPowerLevel);
    return rssiToDistance(peripheral.rssi, peripheral.advertisement.txPowerLevel);
  }

  return -1;
}

noble.on('discover', function(peripheral) {

  if (peripheral.advertisement.manufacturerData) {
    var ibeacon = ibeaconParse(peripheral.advertisement.manufacturerData.toString('hex'));
    if(ibeacon !== undefined) {
      peripheral.ibeacon = ibeacon;
    }
  }

  var distance = getDistance(peripheral);

  if(distance >= 0) {
    console.log('"' + peripheral.advertisement.localName + '", rssi: ' + peripheral.rssi + ", LPF: " + LowPassFilter(peripheral.rssi));
    console.log('\tdistance: ' + getDistance(peripheral));
  } 
});

