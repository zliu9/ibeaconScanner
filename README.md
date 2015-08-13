# iBeacon Scaner

A nodejs iBeacon scanner. It can discover nearby BLE devices and try to calculate the their distance.

For the standard iBeacon emitter the distance can be cacluated with advertised tx power.

For the non-iBeacon devices, the txPowerLevel is needed before calculate distance.

## Install

### [Noble](https://github.com/sandeepmistry/noble)
* Please read its README. It can run on Linux/Mac/Edison. 

* The Edison developer should also read [Configure Intel Edison for Bluetooth Development](http://rexstjohn.com/configure-intel-edison-for-bluetooth-le-smart-development/)

### Run

``` bash
node scanner.js
```
