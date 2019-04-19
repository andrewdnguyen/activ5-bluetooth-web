# Activ5-Device

[![npm](https://img.shields.io/npm/v/activ5-device.svg?colorB=brightgreen)](https://www.npmjs.com/package/activ5-device)

## Example

To run the example project clone the repo and run `npm install` from the Example directory first.

## Requirements

Activ5-Device is an [Angular](https://angular.io) library and an [Angular](https://angular.io) based project is required to run it.

## Installation

Activ5-Device is available through [npm](https://www.npmjs.com).

```typescript
npm install activ5-device
```

# Use of framework

## Basic funtionality

### Framework initialisation
In order to initialize the framework you need to import it in the desired **Component**.

```typescript
import { A5DeviceManager } from 'Activ5-Device';
```

As this is an **Angular Service** you need also to inject it.

```typescript
constructor(private A5Device: A5DeviceManager ) { }
```

### Search and Connect to a device
You need to search for devices in order to connect. This will open the browser popup for the available bluetooth devices.
Choose the desired one and click the **Pair** button.

```typescript
this.A5Device.connect();
```

### Request Device Data
Device data is going to be received in the observable function `getDevice`. The data received is of type **BluetoothDevice**.
```typescript
this.A5Device.getDevice().subscribe(device => {
  // do something with the data received
});
```

### Request Isometric Data from the A5 device
Isometric data start to be stream when `startIsometric()` function is called.
```typescript
this.A5Device.startIsometric();
```

The isometric data is going to be received in the observable function `getIsometricData()`. The data received is in **Newtons**.
```typescript
this.A5Device.getIsometricData().subscribe(data => {
  // do something with the data received
});
```

### Stop receiving isometric data
In order to save device battery it is recomended to call `stop()` function. That way the device consumption drops to a minimum while still is being connected. 

```typescript
this.A5Device.stop();
```
_NB: After 7 minutes in `stop mode` the device will switch switch off_ .
If you don't want the device to timeout after 7 minutes you can switch on evergreen mode. This will keep the device awake.

```typescript
this.A5Device.evergreenMode(true);
```

### Execute tare
This is executing `tare` command on the device.
```typescript 
this.A5Device.tare();
```

### Disconnect device
Disconnecting the device happens with calling `disconnect()` function.
```typescript 
this.A5Device.disconnect();
```

## Author

ivo.zhulev@gmail.com

## License

Activ5-Device is available under the MIT license. See the LICENSE file for more info.
