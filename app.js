var mqtt = require('mqtt')
const { Client} = require('tplink-smarthome-api');
var client = mqtt.connect('mqtt://mqtt.flespi.io', { username: "TZ5MKODSaivTFSVsF19BGTejS4AFHb2q0V0AxtgxAAf3g0lJQj8k0dtI5RbBS1PG" })
var PythonShell = require('python-shell');
var fs = require('fs');

const tp_link = new Client();
let devices = null;
fs.readFile('devices.json', 'utf8', function readFileCallback(err, data){
  if (err){
      console.log(err);
  } else {
  devices = JSON.parse(data); //now it an object
}});

client.on('connect', function () {
  client.subscribe('send')
  client.subscribe('turn_on')
  client.subscribe('turn_off')
  client.subscribe('discover_tplink')
})

client.on('message', function (topic, message) {
  let data = message.toString()
  switch (topic) {
    case "send":
        var options = {
        mode: 'text',
        args: [data, '0']
        };
      PythonShell.run('send.py', options, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        console.log('results: %j', results);
      });
      break;
    case "turn_on":
        const plug = tp_link.getDevice({host: devices.list[0].host}).then((device)=>{
        //device.getPowerState().then((state) => {console.log(state)})
        device.setPowerState(true)
        });
        break;
    case "turn_off":
        const plug = tp_link.getDevice({host: devices.list[0].host}).then((device)=>{
        //device.getPowerState().then((state) => {console.log(state)})
        device.setPowerState(false)
        });
        break;
    case "discover_tplink":
        tp_link.startDiscovery({discoveryTimeout : 1000}).on('device-new', (device) => {
        console.log(device.host)
        if(!find(devices.list,device.host)){
          devices.list.push({host : device.host , alias : device.alias })
          fs.writeFile('devices.json', JSON.stringify(devices), 'utf8')
        }
        tp_link.stopDiscovery()
        });
        break;
  }
})

function find(list,host){
  var found = false;
  for(var i = 0; i < list.length; i++) {
      if (list[i].host == host) {
          found = true;
          break;
      }
  }
  return found;
}
