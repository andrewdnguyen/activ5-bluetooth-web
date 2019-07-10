/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
/// <reference path="index.d.ts" />
/// <reference path="index.d.ts" />
import { Subject } from 'rxjs';
/** @enum {string} */
const DeviceUUID = {
    SERVICE: '00005000-0000-1000-8000-00805f9b34fb',
    READ: '00005a01-0000-1000-8000-00805f9b34fb',
    WRITE: '00005a02-0000-1000-8000-00805f9b34fb',
};
/** @enum {string} */
const DeviceCommands = {
    TVGTIME: 'TVGTIME',
    ISOM: 'ISOM!',
    TARE: 'TARE!',
    STOP: 'STOP!',
};
/** @enum {string} */
const DeviceState = {
    handshake: 'handshake',
    isometric: 'isometric',
    stop: 'stop',
    disconnected: 'disconnected',
};
export class A5DeviceManager {
    /**
     * @return {?}
     */
    connect() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (window.navigator && window.navigator.bluetooth) {
                /** @type {?} */
                const device = yield navigator.bluetooth.requestDevice({ filters: [{ services: [DeviceUUID.SERVICE] }] });
                /** @type {?} */
                const server = yield device.gatt.connect();
                /** @type {?} */
                const service = yield server.getPrimaryService(DeviceUUID.SERVICE);
                return new A5Device(device, server, service);
            }
        });
    }
}
export class A5Device {
    /**
     * @param {?} device
     * @param {?} server
     * @param {?} service
     */
    constructor(device, server, service) {
        this.disconnectEventAsObservable = new Subject();
        this.isomDataAsObservable = new Subject();
        this.characteristics = new Map();
        this.deviceState = DeviceState.disconnected;
        this.device = device;
        this.server = server;
        this.service = service;
        this.init();
    }
    /**
     * @return {?}
     */
    getIsometricData() {
        return this.isomDataAsObservable.asObservable();
    }
    /**
     * @return {?}
     */
    onDisconnect() {
        return this.disconnectEventAsObservable.asObservable();
    }
    /**
     * @return {?}
     */
    startIsometric() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.writeCharacteristicValue(this.formatCommand(DeviceCommands.ISOM));
            this.deviceState = DeviceState.isometric;
            /** @type {?} */
            const characteristic = yield this.startNotifications();
            this.attachIsometricListener(characteristic);
        });
    }
    /**
     * @return {?}
     */
    tare() {
        this.writeCharacteristicValue(this.formatCommand(DeviceCommands.TARE));
    }
    /**
     * @return {?}
     */
    stop() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.writeCharacteristicValue(this.formatCommand(DeviceCommands.STOP));
            this.deviceState = DeviceState.stop;
        });
    }
    /**
     * @param {?} isEvergreenMode
     * @return {?}
     */
    evergreenMode(isEvergreenMode) {
        if (isEvergreenMode) {
            this.evergreenModeTimer = window.setInterval((/**
             * @return {?}
             */
            () => {
                switch (this.deviceState) {
                    case DeviceState.stop:
                    case DeviceState.handshake:
                        this.stop();
                        break;
                    default:
                        break;
                }
            }), 60000);
        }
        else {
            clearInterval(this.evergreenModeTimer);
        }
    }
    /**
     * @return {?}
     */
    disconnect() {
        this.device.gatt.disconnect();
    }
    /**
     * @private
     * @return {?}
     */
    init() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.cacheCharacteristic(DeviceUUID.READ);
            yield this.cacheCharacteristic(DeviceUUID.WRITE);
            yield this.writeCharacteristicValue(this.formatCommand(DeviceCommands.TVGTIME));
            this.deviceState = DeviceState.handshake;
            this.attachDisconnectListener();
        });
    }
    /**
     * @private
     * @return {?}
     */
    attachDisconnectListener() {
        this.device.addEventListener('gattserverdisconnected', (/**
         * @param {?} event
         * @return {?}
         */
        (event) => {
            this.disconnectEventAsObservable.next(event);
            this.deviceState = DeviceState.disconnected;
            this.device = undefined;
            this.server = undefined;
            this.service = undefined;
        }));
    }
    /**
     * @private
     * @param {?} characteristicUuid
     * @return {?}
     */
    cacheCharacteristic(characteristicUuid) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            /** @type {?} */
            const characteristic = yield this.service.getCharacteristic(characteristicUuid);
            this.characteristics.set(characteristicUuid, characteristic);
        });
    }
    /**
     * @private
     * @param {?} value
     * @return {?}
     */
    writeCharacteristicValue(value) {
        /** @type {?} */
        const characteristic = this.characteristics.get(DeviceUUID.WRITE);
        return characteristic.writeValue(value);
    }
    /**
     * @private
     * @return {?}
     */
    startNotifications() {
        /** @type {?} */
        const characteristic = this.characteristics.get(DeviceUUID.READ);
        return characteristic.startNotifications();
    }
    /**
     * @private
     * @param {?} characteristic
     * @return {?}
     */
    attachIsometricListener(characteristic) {
        characteristic.addEventListener('characteristicvaluechanged', (/**
         * @param {?} event
         * @return {?}
         */
        event => {
            /** @type {?} */
            const target = (/** @type {?} */ (event.target));
            this.parseData(target.value);
        }));
    }
    /**
     * @private
     * @param {?} data
     * @return {?}
     */
    parseData(data) {
        /** @type {?} */
        const deviceDataAsString = String.fromCharCode.apply(null, new Uint8Array(data.buffer));
        /** @type {?} */
        const isomData = deviceDataAsString.match(/IS(.*)\/IS/)[1];
        this.isomDataAsObservable.next(isomData);
    }
    /**
     * @private
     * @param {?} type
     * @return {?}
     */
    formatCommand(type) {
        /** @type {?} */
        const buffer = new ArrayBuffer(type.length + 2);
        /** @type {?} */
        const dataView = new DataView(buffer, 0);
        dataView.setUint8(0, 65);
        for (let i = 0; i < type.length; i++) {
            dataView.setUint8(i + 1, type.charCodeAt(i));
        }
        dataView.setUint8(type.length + 1, 25);
        return dataView;
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    A5Device.prototype.device;
    /**
     * @type {?}
     * @private
     */
    A5Device.prototype.server;
    /**
     * @type {?}
     * @private
     */
    A5Device.prototype.service;
    /**
     * @type {?}
     * @private
     */
    A5Device.prototype.disconnectEventAsObservable;
    /**
     * @type {?}
     * @private
     */
    A5Device.prototype.isomDataAsObservable;
    /**
     * @type {?}
     * @private
     */
    A5Device.prototype.evergreenModeTimer;
    /**
     * @type {?}
     * @private
     */
    A5Device.prototype.characteristics;
    /**
     * @type {?}
     * @private
     */
    A5Device.prototype.deviceState;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYTUtZGV2aWNlLW1hbmFnZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hY3RpdjUtZGV2aWNlLyIsInNvdXJjZXMiOlsiYTUtZGV2aWNlLW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxtQ0FBbUM7O0FBRW5DLE9BQU8sRUFBYyxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7OztJQUd6QyxTQUFVLHNDQUFzQztJQUNoRCxNQUFPLHNDQUFzQztJQUM3QyxPQUFRLHNDQUFzQzs7OztJQUk5QyxTQUFVLFNBQVM7SUFDbkIsTUFBTyxPQUFPO0lBQ2QsTUFBTyxPQUFPO0lBQ2QsTUFBTyxPQUFPOzs7O0lBSWQsV0FBWSxXQUFXO0lBQ3ZCLFdBQVksV0FBVztJQUN2QixNQUFPLE1BQU07SUFDYixjQUFlLGNBQWM7O0FBRy9CLE1BQU0sT0FBTyxlQUFlOzs7O0lBRWIsT0FBTzs7WUFDbEIsSUFBSSxNQUFNLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFOztzQkFDNUMsTUFBTSxHQUFHLE1BQU0sU0FBUyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzs7c0JBQ25HLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFOztzQkFDcEMsT0FBTyxHQUFHLE1BQU0sTUFBTSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7Z0JBRWxFLE9BQU8sSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQzthQUM5QztRQUNILENBQUM7S0FBQTtDQUVGO0FBRUQsTUFBTSxPQUFPLFFBQVE7Ozs7OztJQUVuQixZQUFZLE1BQXVCLEVBQUUsTUFBaUMsRUFBRSxPQUFtQztRQVluRyxnQ0FBMkIsR0FBRyxJ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O2NBQ3hCLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7O2NBQ2pGLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTFELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDM0MsQ0FBQzs7Ozs7O0lBRU8sYUFBYSxDQUFDLElBQVk7O2NBQzFCLE1BQU0sR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQzs7Y0FDekMsUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFFeEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFekIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDbEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoRDtRQUVELFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFdkMsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztDQUVGOzs7Ozs7SUF6SEMsMEJBQWdDOzs7OztJQUNoQywwQkFBMEM7Ozs7O0lBQzFDLDJCQUE0Qzs7Ozs7SUFFNUMsK0NBQTJEOzs7OztJQUMzRCx3Q0FBcUQ7Ozs7O0lBRXJELHNDQUFtQzs7Ozs7SUFDbkMsbUNBQW9DOzs7OztJQUNwQywrQkFBK0MiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiaW5kZXguZC50c1wiIC8+XG5cbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuZW51bSBEZXZpY2VVVUlEIHtcbiAgU0VSVklDRSA9ICcwMDAwNTAwMC0wMDAwLTEwMDAtODAwMC0wMDgwNWY5YjM0ZmInLFxuICBSRUFEID0gJzAwMDA1YTAxLTAwMDAtMTAwMC04MDAwLTAwODA1ZjliMzRmYicsXG4gIFdSSVRFID0gJzAwMDA1YTAyLTAwMDAtMTAwMC04MDAwLTAwODA1ZjliMzRmYidcbn1cblxuZW51bSBEZXZpY2VDb21tYW5kcyB7XG4gIFRWR1RJTUUgPSAnVFZHVElNRScsXG4gIElTT00gPSAnSVNPTSEnLFxuICBUQVJFID0gJ1RBUkUhJyxcbiAgU1RPUCA9ICdTVE9QISdcbn1cblxuZW51bSBEZXZpY2VTdGF0ZSB7XG4gIGhhbmRzaGFrZSA9ICdoYW5kc2hha2UnLFxuICBpc29tZXRyaWMgPSAnaXNvbWV0cmljJyxcbiAgc3RvcCA9ICdzdG9wJyxcbiAgZGlzY29ubmVjdGVkID0gJ2Rpc2Nvbm5lY3RlZCdcbn1cblxuZXhwb3J0IGNsYXNzIEE1RGV2aWNlTWFuYWdlciB7XG5cbiAgcHVibGljIGFzeW5jIGNvbm5lY3QoKTogUHJvbWlzZTxBNURldmljZT4ge1xuICAgIGlmICh3aW5kb3cubmF2aWdhdG9yICYmIHdpbmRvdy5uYXZpZ2F0b3IuYmx1ZXRvb3RoKSB7XG4gICAgICBjb25zdCBkZXZpY2UgPSBhd2FpdCBuYXZpZ2F0b3IuYmx1ZXRvb3RoLnJlcXVlc3REZXZpY2UoeyBmaWx0ZXJzOiBbeyBzZXJ2aWNlczogW0RldmljZVVVSUQuU0VSVklDRV0gfV0gfSk7XG4gICAgICBjb25zdCBzZXJ2ZXIgPSBhd2FpdCBkZXZpY2UuZ2F0dC5jb25uZWN0KCk7XG4gICAgICBjb25zdCBzZXJ2aWNlID0gYXdhaXQgc2VydmVyLmdldFByaW1hcnlTZXJ2aWNlKERldmljZVVVSUQuU0VSVklDRSk7XG5cbiAgICAgIHJldHVybiBuZXcgQTVEZXZpY2UoZGV2aWNlLCBzZXJ2ZXIsIHNlcnZpY2UpO1xuICAgIH1cbiAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBBNURldmljZSB7XG5cbiAgY29uc3RydWN0b3IoZGV2aWNlOiBCbHVldG9vdGhEZXZpY2UsIHNlcnZlcjogQmx1ZXRvb3RoUmVtb3RlR0FUVFNlcnZlciwgc2VydmljZTogQmx1ZXRvb3RoUmVtb3RlR0FUVFNlcnZpY2UpIHtcbiAgICB0aGlzLmRldmljZSA9IGRldmljZTtcbiAgICB0aGlzLnNlcnZlciA9IHNlcnZlcjtcbiAgICB0aGlzLnNlcnZpY2UgPSBzZXJ2aWNlO1xuXG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICBwcml2YXRlIGRldmljZTogQmx1ZXRvb3RoRGV2aWNlO1xuICBwcml2YXRlIHNlcnZlcjogQmx1ZXRvb3RoUmVtb3RlR0FUVFNlcnZlcjtcbiAgcHJpdmF0ZSBzZXJ2aWNlOiBCbHVldG9vdGhSZW1vdGVHQVRUU2VydmljZTtcblxuICBwcml2YXRlIGRpc2Nvbm5lY3RFdmVudEFzT2JzZXJ2YWJsZSA9IG5ldyBTdWJqZWN0PEV2ZW50PigpO1xuICBwcml2YXRlIGlzb21EYXRhQXNPYnNlcnZhYmxlID0gbmV3IFN1YmplY3Q8c3RyaW5nPigpO1xuXG4gIHByaXZhdGUgZXZlcmdyZWVuTW9kZVRpbWVyOiBudW1iZXI7XG4gIHByaXZhdGUgY2hhcmFjdGVyaXN0aWNzID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIGRldmljZVN0YXRlID0gRGV2aWNlU3RhdGUuZGlzY29ubmVjdGVkO1xuXG4gIHB1YmxpYyBnZXRJc29tZXRyaWNEYXRhKCk6IE9ic2VydmFibGU8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuaXNvbURhdGFBc09ic2VydmFibGUuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBwdWJsaWMgb25EaXNjb25uZWN0KCk6IE9ic2VydmFibGU8RXZlbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5kaXNjb25uZWN0RXZlbnRBc09ic2VydmFibGUuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc3RhcnRJc29tZXRyaWMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy53cml0ZUNoYXJhY3RlcmlzdGljVmFsdWUodGhpcy5mb3JtYXRDb21tYW5kKERldmljZUNvbW1hbmRzLklTT00pKTtcbiAgICB0aGlzLmRldmljZVN0YXRlID0gRGV2aWNlU3RhdGUuaXNvbWV0cmljO1xuXG4gICAgY29uc3QgY2hhcmFjdGVyaXN0aWMgPSBhd2FpdCB0aGlzLnN0YXJ0Tm90aWZpY2F0aW9ucygpO1xuICAgIHRoaXMuYXR0YWNoSXNvbWV0cmljTGlzdGVuZXIoY2hhcmFjdGVyaXN0aWMpO1xuICB9XG5cbiAgcHVibGljIHRhcmUoKTogdm9pZCB7XG4gICAgdGhpcy53cml0ZUNoYXJhY3RlcmlzdGljVmFsdWUodGhpcy5mb3JtYXRDb21tYW5kKERldmljZUNvbW1hbmRzLlRBUkUpKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzdG9wKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMud3JpdGVDaGFyYWN0ZXJpc3RpY1ZhbHVlKHRoaXMuZm9ybWF0Q29tbWFuZChEZXZpY2VDb21tYW5kcy5TVE9QKSk7XG4gICAgdGhpcy5kZXZpY2VTdGF0ZSA9IERldmljZVN0YXRlLnN0b3A7XG4gIH1cblxuICBwdWJsaWMgZXZlcmdyZWVuTW9kZShpc0V2ZXJncmVlbk1vZGU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoaXNFdmVyZ3JlZW5Nb2RlKSB7XG4gICAgICB0aGlzLmV2ZXJncmVlbk1vZGVUaW1lciA9IHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5kZXZpY2VTdGF0ZSkge1xuICAgICAgICAgIGNhc2UgRGV2aWNlU3RhdGUuc3RvcDogY2FzZSBEZXZpY2VTdGF0ZS5oYW5kc2hha2U6XG4gICAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSwgNjAwMDApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbGVhckludGVydmFsKHRoaXMuZXZlcmdyZWVuTW9kZVRpbWVyKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZGlzY29ubmVjdCgpOiB2b2lkIHtcbiAgICB0aGlzLmRldmljZS5nYXR0LmRpc2Nvbm5lY3QoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmNhY2hlQ2hhcmFjdGVyaXN0aWMoRGV2aWNlVVVJRC5SRUFEKTtcbiAgICBhd2FpdCB0aGlzLmNhY2hlQ2hhcmFjdGVyaXN0aWMoRGV2aWNlVVVJRC5XUklURSk7XG5cbiAgICBhd2FpdCB0aGlzLndyaXRlQ2hhcmFjdGVyaXN0aWNWYWx1ZSh0aGlzLmZvcm1hdENvbW1hbmQoRGV2aWNlQ29tbWFuZHMuVFZHVElNRSkpO1xuXG5cbiAgICB0aGlzLmRldmljZVN0YXRlID0gRGV2aWNlU3RhdGUuaGFuZHNoYWtlO1xuICAgIHRoaXMuYXR0YWNoRGlzY29ubmVjdExpc3RlbmVyKCk7XG4gIH1cblxuICBwcml2YXRlIGF0dGFjaERpc2Nvbm5lY3RMaXN0ZW5lcigpOiB2b2lkIHtcbiAgICB0aGlzLmRldmljZS5hZGRFdmVudExpc3RlbmVyKCdnYXR0c2VydmVyZGlzY29ubmVjdGVkJywgKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgdGhpcy5kaXNjb25uZWN0RXZlbnRBc09ic2VydmFibGUubmV4dChldmVudCk7XG4gICAgICB0aGlzLmRldmljZVN0YXRlID0gRGV2aWNlU3RhdGUuZGlzY29ubmVjdGVkO1xuICAgICAgdGhpcy5kZXZpY2UgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnNlcnZlciA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuc2VydmljZSA9IHVuZGVmaW5lZDtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY2FjaGVDaGFyYWN0ZXJpc3RpYyhjaGFyYWN0ZXJpc3RpY1V1aWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNoYXJhY3RlcmlzdGljID0gYXdhaXQgdGhpcy5zZXJ2aWNlLmdldENoYXJhY3RlcmlzdGljKGNoYXJhY3RlcmlzdGljVXVpZCk7XG4gICAgdGhpcy5jaGFyYWN0ZXJpc3RpY3Muc2V0KGNoYXJhY3RlcmlzdGljVXVpZCwgY2hhcmFjdGVyaXN0aWMpO1xuICB9XG5cbiAgcHJpdmF0ZSB3cml0ZUNoYXJhY3RlcmlzdGljVmFsdWUodmFsdWU6IERhdGFWaWV3KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY2hhcmFjdGVyaXN0aWMgPSB0aGlzLmNoYXJhY3RlcmlzdGljcy5nZXQoRGV2aWNlVVVJRC5XUklURSk7XG4gICAgcmV0dXJuIGNoYXJhY3RlcmlzdGljLndyaXRlVmFsdWUodmFsdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGFydE5vdGlmaWNhdGlvbnMoKTogUHJvbWlzZTxCbHVldG9vdGhSZW1vdGVHQVRUQ2hhcmFjdGVyaXN0aWM+IHtcbiAgICBjb25zdCBjaGFyYWN0ZXJpc3RpYyA9IHRoaXMuY2hhcmFjdGVyaXN0aWNzLmdldChEZXZpY2VVVUlELlJFQUQpO1xuICAgIHJldHVybiBjaGFyYWN0ZXJpc3RpYy5zdGFydE5vdGlmaWNhdGlvbnMoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXR0YWNoSXNvbWV0cmljTGlzdGVuZXIoY2hhcmFjdGVyaXN0aWM6IEJsdWV0b290aFJlbW90ZUdBVFRDaGFyYWN0ZXJpc3RpYyk6IHZvaWQge1xuICAgIGNoYXJhY3RlcmlzdGljLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYXJhY3RlcmlzdGljdmFsdWVjaGFuZ2VkJywgZXZlbnQgPT4ge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGFzIEJsdWV0b290aFJlbW90ZUdBVFRDaGFyYWN0ZXJpc3RpYztcbiAgICAgIHRoaXMucGFyc2VEYXRhKHRhcmdldC52YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHBhcnNlRGF0YShkYXRhOiBEYXRhVmlldyk6IHZvaWQge1xuICAgIGNvbnN0IGRldmljZURhdGFBc1N0cmluZyA9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIpKTtcbiAgICBjb25zdCBpc29tRGF0YSA9IGRldmljZURhdGFBc1N0cmluZy5tYXRjaCgvSVMoLiopXFwvSVMvKVsxXTtcblxuICAgIHRoaXMuaXNvbURhdGFBc09ic2VydmFibGUubmV4dChpc29tRGF0YSk7XG4gIH1cblxuICBwcml2YXRlIGZvcm1hdENvbW1hbmQodHlwZTogc3RyaW5nKTogRGF0YVZpZXcge1xuICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcih0eXBlLmxlbmd0aCArIDIpO1xuICAgIGNvbnN0IGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlciwgMCk7XG5cbiAgICBkYXRhVmlldy5zZXRVaW50OCgwLCA2NSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHR5cGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGF0YVZpZXcuc2V0VWludDgoaSArIDEsIHR5cGUuY2hhckNvZGVBdChpKSk7XG4gICAgfVxuXG4gICAgZGF0YVZpZXcuc2V0VWludDgodHlwZS5sZW5ndGggKyAxLCAyNSk7XG5cbiAgICByZXR1cm4gZGF0YVZpZXc7XG4gIH1cblxufVxuXG5cbi8vIGV4cG9ydCBjbGFzcyBBNURldmljZU1hbmFnZXIge1xuXG4vLyAgIHByaXZhdGUgZGV2aWNlczogQmx1ZXRvb3RoRGV2aWNlW10gPSBbXTtcbi8vICAgcHJpdmF0ZSBzZXJ2ZXJzOiBCbHVldG9vdGhSZW1vdGVHQVRUU2VydmVyW10gPSBbXTtcbi8vICAgcHJpdmF0ZSBzZXJ2aWNlczogQmx1ZXRvb3RoUmVtb3RlR0FUVFNlcnZpY2VbXSA9IFtdO1xuXG4vLyAgIHByaXZhdGUgY2hhcmFjdGVyaXN0aWNzID0gWyBuZXcgTWFwKCksIG5ldyBNYXAoKSBdO1xuLy8gICBwcml2YXRlIGRldmljZXNTdGF0ZXMgPSBbIERldmljZVN0YXRlLmRpc2Nvbm5lY3RlZCwgRGV2aWNlU3RhdGUuZGlzY29ubmVjdGVkIF07XG4vLyAgIHByaXZhdGUgZGV2aWNlTnVtYmVyID0gMDtcblxuLy8gICBwcml2YXRlIGV2ZXJncmVlbk1vZGVUaW1lcnM6IG51bWJlcltdID0gW107XG5cbi8vICAgcHJpdmF0ZSBkaXNjb25uZWN0RXZlbnRzQXNPYnNlcnZhYmxlID0gbmV3IFN1YmplY3Q8RXZlbnRbXT4oKTtcbi8vICAgcHJpdmF0ZSBpc29tRGF0YXNBc09ic2VydmFibGUgPSBuZXcgU3ViamVjdDxzdHJpbmdbXT4oKTtcblxuXG4vLyAgIHB1YmxpYyBnZXRJc29tZXRyaWNEYXRhKCk6IE9ic2VydmFibGU8c3RyaW5nPiB7XG4vLyAgICAgcmV0dXJuIHRoaXMuaXNvbURhdGFBc09ic2VydmFibGUuYXNPYnNlcnZhYmxlKCk7XG4vLyAgIH1cblxuLy8gICBwdWJsaWMgb25EaXNjb25uZWN0KCk6IE9ic2VydmFibGU8RXZlbnQ+IHtcbi8vICAgICByZXR1cm4gdGhpcy5kaXNjb25uZWN0RXZlbnRBc09ic2VydmFibGUuYXNPYnNlcnZhYmxlKCk7XG4vLyAgIH1cblxuLy8gICBwdWJsaWMgYXN5bmMgY29ubmVjdCgpOiBQcm9taXNlPEJsdWV0b290aERldmljZVtdPiB7XG5cbi8vICAgICBpZiAod2luZG93Lm5hdmlnYXRvciAmJiB3aW5kb3cubmF2aWdhdG9yLmJsdWV0b290aCkge1xuLy8gICAgICAgdGhpcy5kZXZpY2VOdW1iZXIgPSB0aGlzLmRldmljZXNbMF0gPyAxIDogMDtcbiAgICAgIFxuLy8gICAgICAgbGV0IGRldmljZSA9IHRoaXMuZGV2aWNlc1t0aGlzLmRldmljZU51bWJlcl07XG4vLyAgICAgICBsZXQgc2VydmVyID0gdGhpcy5zZXJ2ZXJzW3RoaXMuZGV2aWNlTnVtYmVyXTtcbi8vICAgICAgIGxldCBzZXJ2aWNlID0gdGhpcy5zZXJ2aWNlc1t0aGlzLmRldmljZU51bWJlcl07XG4vLyAgICAgICBsZXQgZGV2aWNlU3RhdGUgPSB0aGlzLmRldmljZXNTdGF0ZXNbdGhpcy5kZXZpY2VOdW1iZXJdO1xuXG4vLyAgICAgICBkZXZpY2UgPSBhd2FpdCBuYXZpZ2F0b3IuYmx1ZXRvb3RoLnJlcXVlc3REZXZpY2UoeyBmaWx0ZXJzOiBbeyBzZXJ2aWNlczogW0RldmljZVVVSUQuU0VSVklDRV0gfV0gfSk7XG4vLyAgICAgICBzZXJ2ZXIgPSBhd2FpdCBkZXZpY2UuZ2F0dC5jb25uZWN0KCk7XG4vLyAgICAgICBzZXJ2aWNlID0gYXdhaXQgc2VydmVyLmdldFByaW1hcnlTZXJ2aWNlKERldmljZVVVSUQuU0VSVklDRSk7XG5cbi8vICAgICAgIGF3YWl0IHRoaXMuY2FjaGVDaGFyYWN0ZXJpc3RpYyhEZXZpY2VVVUlELlJFQUQpO1xuLy8gICAgICAgYXdhaXQgdGhpcy5jYWNoZUNoYXJhY3RlcmlzdGljKERldmljZVVVSUQuV1JJVEUpO1xuXG4vLyAgICAgICBhd2FpdCB0aGlzLndyaXRlQ2hhcmFjdGVyaXN0aWNWYWx1ZSh0aGlzLmZvcm1hdENvbW1hbmQoRGV2aWNlQ29tbWFuZHMuVFZHVElNRSkpO1xuXG5cbi8vICAgICAgIGRldmljZVN0YXRlID0gRGV2aWNlU3RhdGUuaGFuZHNoYWtlO1xuLy8gICAgICAgLy90aGlzLmF0dGFjaERpc2Nvbm5lY3RMaXN0ZW5lcigpO1xuXG4vLyAgICAgICByZXR1cm4gdGhpcy5kZXZpY2VzO1xuLy8gICAgIH1cbi8vICAgfVxuXG4vLyAgIHB1YmxpYyBhc3luYyBzdGFydElzb21ldHJpYygpOiBQcm9taXNlPHZvaWQ+IHtcbi8vICAgICBhd2FpdCB0aGlzLndyaXRlQ2hhcmFjdGVyaXN0aWNWYWx1ZSh0aGlzLmZvcm1hdENvbW1hbmQoRGV2aWNlQ29tbWFuZHMuSVNPTSkpO1xuLy8gICAgIHRoaXMuZGV2aWNlU3RhdGUgPSBEZXZpY2VTdGF0ZS5pc29tZXRyaWM7XG5cbi8vICAgICBjb25zdCBjaGFyYWN0ZXJpc3RpYyA9IGF3YWl0IHRoaXMuc3RhcnROb3RpZmljYXRpb25zKCk7XG4vLyAgICAgdGhpcy5hdHRhY2hJc29tZXRyaWNMaXN0ZW5lcihjaGFyYWN0ZXJpc3RpYyk7XG4vLyAgIH1cblxuLy8gICBwdWJsaWMgdGFyZSgpOiB2b2lkIHtcbi8vICAgICB0aGlzLndyaXRlQ2hhcmFjdGVyaXN0aWNWYWx1ZSh0aGlzLmZvcm1hdENvbW1hbmQoRGV2aWNlQ29tbWFuZHMuVEFSRSkpO1xuLy8gICB9XG5cbi8vICAgcHVibGljIGFzeW5jIHN0b3AoKTogUHJvbWlzZTx2b2lkPiB7XG4vLyAgICAgYXdhaXQgdGhpcy53cml0ZUNoYXJhY3RlcmlzdGljVmFsdWUodGhpcy5mb3JtYXRDb21tYW5kKERldmljZUNvbW1hbmRzLlNUT1ApKTtcbi8vICAgICB0aGlzLmRldmljZVN0YXRlID0gRGV2aWNlU3RhdGUuc3RvcDtcbi8vICAgfVxuXG4vLyAgIHB1YmxpYyBldmVyZ3JlZW5Nb2RlKGlzRXZlcmdyZWVuTW9kZTogYm9vbGVhbik6IHZvaWQge1xuLy8gICAgIGlmIChpc0V2ZXJncmVlbk1vZGUpIHtcbi8vICAgICAgIHRoaXMuZXZlcmdyZWVuTW9kZVRpbWVyID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHtcbi8vICAgICAgICAgc3dpdGNoICh0aGlzLmRldmljZVN0YXRlKSB7XG4vLyAgICAgICAgICAgY2FzZSBEZXZpY2VTdGF0ZS5zdG9wOiBjYXNlIERldmljZVN0YXRlLmhhbmRzaGFrZTpcbi8vICAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuLy8gICAgICAgICAgICAgYnJlYWs7XG4vLyAgICAgICAgICAgZGVmYXVsdDpcbi8vICAgICAgICAgICAgIGJyZWFrO1xuLy8gICAgICAgICB9XG4vLyAgICAgICB9LCA2MDAwMCk7XG4vLyAgICAgfSBlbHNlIHtcbi8vICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5ldmVyZ3JlZW5Nb2RlVGltZXIpO1xuLy8gICAgIH1cbi8vICAgfVxuXG4vLyAgIHB1YmxpYyBkaXNjb25uZWN0KCk6IHZvaWQge1xuLy8gICAgIHRoaXMuZGV2aWNlLmdhdHQuZGlzY29ubmVjdCgpO1xuLy8gICB9XG5cbi8vICAgcHJpdmF0ZSBhdHRhY2hEaXNjb25uZWN0TGlzdGVuZXIoKTogdm9pZCB7XG4vLyAgICAgdGhpcy5kZXZpY2UuYWRkRXZlbnRMaXN0ZW5lcignZ2F0dHNlcnZlcmRpc2Nvbm5lY3RlZCcsIChldmVudDogRXZlbnQpID0+IHtcbi8vICAgICAgIHRoaXMuZGlzY29ubmVjdEV2ZW50QXNPYnNlcnZhYmxlLm5leHQoZXZlbnQpO1xuLy8gICAgICAgdGhpcy5kZXZpY2VTdGF0ZSA9IERldmljZVN0YXRlLmRpc2Nvbm5lY3RlZDtcbi8vICAgICAgIHRoaXMuZGV2aWNlID0gdW5kZWZpbmVkO1xuLy8gICAgICAgdGhpcy5zZXJ2ZXIgPSB1bmRlZmluZWQ7XG4vLyAgICAgICB0aGlzLnNlcnZpY2UgPSB1bmRlZmluZWQ7XG4vLyAgICAgfSk7XG4vLyAgIH1cblxuLy8gICBwcml2YXRlIGFzeW5jIGNhY2hlQ2hhcmFjdGVyaXN0aWMoY2hhcmFjdGVyaXN0aWNVdWlkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbi8vICAgICBjb25zdCBzZXJ2aWNlID0gdGhpcy5zZXJ2aWNlc1t0aGlzLmRldmljZU51bWJlcl07XG4vLyAgICAgY29uc3QgY2hhcmFjdGVyaXN0aWNzID0gdGhpcy5jaGFyYWN0ZXJpc3RpY3NbdGhpcy5kZXZpY2VOdW1iZXJdO1xuLy8gICAgIGNvbnN0IGNoYXJhY3RlcmlzdGljID0gYXdhaXQgc2VydmljZS5nZXRDaGFyYWN0ZXJpc3RpYyhjaGFyYWN0ZXJpc3RpY1V1aWQpO1xuLy8gICAgIGNoYXJhY3RlcmlzdGljcy5zZXQoY2hhcmFjdGVyaXN0aWNVdWlkLCBjaGFyYWN0ZXJpc3RpYyk7XG4vLyAgIH1cblxuLy8gICBwcml2YXRlIHdyaXRlQ2hhcmFjdGVyaXN0aWNWYWx1ZSh2YWx1ZTogRGF0YVZpZXcpOiBQcm9taXNlPHZvaWQ+IHtcbi8vICAgICBjb25zdCBjaGFyYWN0ZXJpc3RpY3MgPSB0aGlzLmNoYXJhY3RlcmlzdGljc1t0aGlzLmRldmljZU51bWJlcl07XG4vLyAgICAgcmV0dXJuIGNoYXJhY3RlcmlzdGljcy5nZXQoRGV2aWNlVVVJRC5XUklURSkud3JpdGVWYWx1ZSh2YWx1ZSk7XG4vLyAgIH1cblxuLy8gICBwcml2YXRlIHN0YXJ0Tm90aWZpY2F0aW9ucygpOiBQcm9taXNlPEJsdWV0b290aFJlbW90ZUdBVFRDaGFyYWN0ZXJpc3RpYz4ge1xuLy8gICAgIGNvbnN0IGNoYXJhY3RlcmlzdGljID0gdGhpcy5jaGFyYWN0ZXJpc3RpY3NbdGhpcy5kZXZpY2VOdW1iZXJdLmdldChEZXZpY2VVVUlELlJFQUQpO1xuLy8gICAgIHJldHVybiBjaGFyYWN0ZXJpc3RpYy5zdGFydE5vdGlmaWNhdGlvbnMoKTtcbi8vICAgfVxuXG4vLyAgIHByaXZhdGUgYXR0YWNoSXNvbWV0cmljTGlzdGVuZXIoY2hhcmFjdGVyaXN0aWM6IEJsdWV0b290aFJlbW90ZUdBVFRDaGFyYWN0ZXJpc3RpYyk6IHZvaWQge1xuLy8gICAgIGNoYXJhY3RlcmlzdGljLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYXJhY3RlcmlzdGljdmFsdWVjaGFuZ2VkJywgZXZlbnQgPT4ge1xuLy8gICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGFzIEJsdWV0b290aFJlbW90ZUdBVFRDaGFyYWN0ZXJpc3RpYztcbi8vICAgICAgIHRoaXMucGFyc2VEYXRhKHRhcmdldC52YWx1ZSk7XG4vLyAgICAgfSk7XG4vLyAgIH1cblxuLy8gICBwcml2YXRlIHBhcnNlRGF0YShkYXRhOiBEYXRhVmlldyk6IHZvaWQge1xuLy8gICAgIGNvbnN0IGRldmljZURhdGFBc1N0cmluZyA9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIpKTtcbi8vICAgICBjb25zdCBpc29tRGF0YSA9IGRldmljZURhdGFBc1N0cmluZy5tYXRjaCgvSVMoLiopXFwvSVMvKVsxXTtcblxuLy8gICAgIHRoaXMuaXNvbURhdGFzQXNPYnNlcnZhYmxlLm5leHQoaXNvbURhdGEpO1xuLy8gICB9XG5cbi8vICAgcHJpdmF0ZSBmb3JtYXRDb21tYW5kKHR5cGU6IHN0cmluZyk6IERhdGFWaWV3IHtcbi8vICAgICBjb25zdCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIodHlwZS5sZW5ndGggKyAyKTtcbi8vICAgICBjb25zdCBkYXRhVmlldyA9IG5ldyBEYXRhVmlldyhidWZmZXIsIDApO1xuXG4vLyAgICAgZGF0YVZpZXcuc2V0VWludDgoMCwgNjUpO1xuXG4vLyAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0eXBlLmxlbmd0aDsgaSsrKSB7XG4vLyAgICAgICAgIGRhdGFWaWV3LnNldFVpbnQ4KGkgKyAxLCB0eXBlLmNoYXJDb2RlQXQoaSkpO1xuLy8gICAgIH1cblxuLy8gICAgIGRhdGFWaWV3LnNldFVpbnQ4KHR5cGUubGVuZ3RoICsgMSwgMjUpO1xuXG4vLyAgICAgcmV0dXJuIGRhdGFWaWV3O1xuLy8gICB9XG4iXX0=