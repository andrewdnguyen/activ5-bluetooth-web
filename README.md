# activ5-device

## Example

To run the example project clone the repo and run **npm install** and then **npm start** from the **Example** directory.

# Use of framework

### Framework initialisation
In order to initialize the framework you need to import it.

```typescript
import { A5DeviceManager, A5Device } from 'activ5-device';
```

**A5DeviceManager** is the instance, from which devices of type **A5Device** are connected and returned.

### Search and Connect to a device
You need to search for devices in order to connect. This will open the browser popup for the available bluetooth devices.
Choose the desired one and click the **Pair** button. The device data is received in a callback function.

```typescript
new A5DeviceManager().connect().then((newDevice: A5Device) => {
  this.device = newDevice;
});
```

### Request Isometric Data from the activ5-device
Isometric data start to be stream when **startIsometric()** function is called.
```typescript
this.device.startIsometric();
```

The isometric data is going to be received in the observable function **getIsometricData()**. The data received is in **Newtons**.
```typescript
this.device.getIsometricData().subscribe((data: string) => {
  // do something
});
```

### Stop receiving isometric data
In order to save device battery it is recomended to call **stop()** function. That way the device consumption drops to a minimum while still is being connected. 

```typescript
this.device.stop();
```
_NB: After 7 minutes in **stop mode** the device will switch off_ .
If you don't want the device to timeout after 7 minutes you can switch on evergreen mode. This will keep the device awake.

```typescript
this.device.evergreenMode(true);
```

### Execute tare
This is executing **tare** command on the device.
```typescript 
this.device.tare();
```

### Disconnect device
Disconnecting the device happens with calling **disconnect()** function.
```typescript 
this.device.disconnect();
```

An event will be fired to notify for the disconnect success. 
```typescript 
this.device.onDisconnect().subscribe((event: Event) => {
  // do something
});
```

## Author

h3trika ivo.zhulev@gmail.com

## License

**activ5-device** is available under the MIT license. See the LICENSE file for more info.
