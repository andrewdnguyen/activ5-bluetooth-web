/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
/// <reference path="index.d.ts" />
/// <reference path="index.d.ts" />
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
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
    constructor() {
        this.disconnectEventAsObservable = new Subject();
        this.isomDataAsObservable = new Subject();
        this.characteristics = new Map();
        this.deviceState = DeviceState.disconnected;
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
    connect() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (window.navigator && window.navigator.bluetooth) {
                /** @type {?} */
                let device;
                if (!this.device) {
                    device = yield navigator.bluetooth.requestDevice({ filters: [{ services: [DeviceUUID.SERVICE] }] });
                }
                if (!this.server) {
                    this.server = yield device.gatt.connect();
                }
                if (!this.service) {
                    this.service = yield this.server.getPrimaryService(DeviceUUID.SERVICE);
                }
                yield this.cacheCharacteristic(DeviceUUID.READ);
                yield this.cacheCharacteristic(DeviceUUID.WRITE);
                yield this.writeCharacteristicValue(this.formatCommand(DeviceCommands.TVGTIME));
                this.device = device;
                this.deviceState = DeviceState.handshake;
                this.attachDisconnectListener();
                return this.device;
            }
        });
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
A5DeviceManager.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
/** @nocollapse */ A5DeviceManager.ngInjectableDef = i0.defineInjectable({ factory: function A5DeviceManager_Factory() { return new A5DeviceManager(); }, token: A5DeviceManager, providedIn: "root" });
if (false) {
    /**
     * @type {?}
     * @private
     */
    A5DeviceManager.prototype.device;
    /**
     * @type {?}
     * @private
     */
    A5DeviceManager.prototype.disconnectEventAsObservable;
    /**
     * @type {?}
     * @private
     */
    A5DeviceManager.prototype.server;
    /**
     * @type {?}
     * @private
     */
    A5DeviceManager.prototype.service;
    /**
     * @type {?}
     * @private
     */
    A5DeviceManager.prototype.isomDataAsObservable;
    /**
     * @type {?}
     * @private
     */
    A5DeviceManager.prototype.evergreenModeTimer;
    /**
     * @type {?}
     * @private
     */
    A5DeviceManager.prototype.characteristics;
    /**
     * @type {?}
     * @private
     */
    A5DeviceManager.prototype.deviceState;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYTUtZGV2aWNlLW1hbmFnZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AaDN0cmlrYS9hY3RpdjUtZGV2aWNlLyIsInNvdXJjZXMiOlsiYTUtZGV2aWNlLW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxtQ0FBbUM7O0FBRW5DLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQzs7OztJQUd6QyxTQUFVLHNDQUFzQztJQUNoRCxNQUFPLHNDQUFzQztJQUM3QyxPQUFRLHNDQUFzQzs7OztJQUk5QyxTQUFVLFNBQVM7SUFDbkIsTUFBTyxPQUFPO0lBQ2QsTUFBTyxPQUFPO0lBQ2QsTUFBTyxPQUFPOzs7O0lBSWQsV0FBWSxXQUFXO0lBQ3ZCLFdBQVksV0FBVztJQUN2QixNQUFPLE1BQU07SUFDYixjQUFlLGNBQWM7O0FBTy9CLE1BQU0sT0FBTyxlQUFlO0lBSjVCO1FBUVUsZ0NBQTJCLEdBQUcsSUFBSSxPQUFPLEVBQVMsQ0FBQztRQUtuRCx5QkFBb0IsR0FBRyxJQUFJLE9BQU8sRUFBVSxDQUFDO1FBRzdDLG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUM1QixnQkFBVyxHQUFHLFdBQVcsQ0FBQyxZQUFZLENBQUM7S0FtSWhEOzs7O0lBaklRLGdCQUFnQjtRQUNyQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNsRCxDQUFDOzs7O0lBRU0sWUFBWTtRQUNqQixPQUFPLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN6RCxDQUFDOzs7O0lBRVksT0FBTzs7WUFFbEIsSUFBSSxNQUFNLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFOztvQkFDOUMsTUFBdUI7Z0JBRTNCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNoQixNQUFN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bnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImluZGV4LmQudHNcIiAvPlxuXG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmVudW0gRGV2aWNlVVVJRCB7XG4gIFNFUlZJQ0UgPSAnMDAwMDUwMDAtMDAwMC0xMDAwLTgwMDAtMDA4MDVmOWIzNGZiJyxcbiAgUkVBRCA9ICcwMDAwNWEwMS0wMDAwLTEwMDAtODAwMC0wMDgwNWY5YjM0ZmInLFxuICBXUklURSA9ICcwMDAwNWEwMi0wMDAwLTEwMDAtODAwMC0wMDgwNWY5YjM0ZmInXG59XG5cbmVudW0gRGV2aWNlQ29tbWFuZHMge1xuICBUVkdUSU1FID0gJ1RWR1RJTUUnLFxuICBJU09NID0gJ0lTT00hJyxcbiAgVEFSRSA9ICdUQVJFIScsXG4gIFNUT1AgPSAnU1RPUCEnXG59XG5cbmVudW0gRGV2aWNlU3RhdGUge1xuICBoYW5kc2hha2UgPSAnaGFuZHNoYWtlJyxcbiAgaXNvbWV0cmljID0gJ2lzb21ldHJpYycsXG4gIHN0b3AgPSAnc3RvcCcsXG4gIGRpc2Nvbm5lY3RlZCA9ICdkaXNjb25uZWN0ZWQnXG59XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuXG5leHBvcnQgY2xhc3MgQTVEZXZpY2VNYW5hZ2VyIHtcblxuICBwcml2YXRlIGRldmljZTogQmx1ZXRvb3RoRGV2aWNlO1xuXG4gIHByaXZhdGUgZGlzY29ubmVjdEV2ZW50QXNPYnNlcnZhYmxlID0gbmV3IFN1YmplY3Q8RXZlbnQ+KCk7XG5cbiAgcHJpdmF0ZSBzZXJ2ZXI6IEJsdWV0b290aFJlbW90ZUdBVFRTZXJ2ZXI7XG4gIHByaXZhdGUgc2VydmljZTogQmx1ZXRvb3RoUmVtb3RlR0FUVFNlcnZpY2U7XG5cbiAgcHJpdmF0ZSBpc29tRGF0YUFzT2JzZXJ2YWJsZSA9IG5ldyBTdWJqZWN0PHN0cmluZz4oKTtcblxuICBwcml2YXRlIGV2ZXJncmVlbk1vZGVUaW1lcjogbnVtYmVyO1xuICBwcml2YXRlIGNoYXJhY3RlcmlzdGljcyA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBkZXZpY2VTdGF0ZSA9IERldmljZVN0YXRlLmRpc2Nvbm5lY3RlZDtcblxuICBwdWJsaWMgZ2V0SXNvbWV0cmljRGF0YSgpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmlzb21EYXRhQXNPYnNlcnZhYmxlLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgcHVibGljIG9uRGlzY29ubmVjdCgpOiBPYnNlcnZhYmxlPEV2ZW50PiB7XG4gICAgcmV0dXJuIHRoaXMuZGlzY29ubmVjdEV2ZW50QXNPYnNlcnZhYmxlLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIGNvbm5lY3QoKTogUHJvbWlzZTxCbHVldG9vdGhEZXZpY2U+IHtcblxuICAgIGlmICh3aW5kb3cubmF2aWdhdG9yICYmIHdpbmRvdy5uYXZpZ2F0b3IuYmx1ZXRvb3RoKSB7XG4gICAgICBsZXQgZGV2aWNlOiBCbHVldG9vdGhEZXZpY2U7XG5cbiAgICAgIGlmICghdGhpcy5kZXZpY2UpIHtcbiAgICAgICAgZGV2aWNlID0gYXdhaXQgbmF2aWdhdG9yLmJsdWV0b290aC5yZXF1ZXN0RGV2aWNlKHsgZmlsdGVyczogW3sgc2VydmljZXM6IFtEZXZpY2VVVUlELlNFUlZJQ0VdIH1dIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuc2VydmVyKSB7XG4gICAgICAgIHRoaXMuc2VydmVyID0gYXdhaXQgZGV2aWNlLmdhdHQuY29ubmVjdCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuc2VydmljZSkge1xuICAgICAgICB0aGlzLnNlcnZpY2UgPSBhd2FpdCB0aGlzLnNlcnZlci5nZXRQcmltYXJ5U2VydmljZShEZXZpY2VVVUlELlNFUlZJQ0UpO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCB0aGlzLmNhY2hlQ2hhcmFjdGVyaXN0aWMoRGV2aWNlVVVJRC5SRUFEKTtcbiAgICAgIGF3YWl0IHRoaXMuY2FjaGVDaGFyYWN0ZXJpc3RpYyhEZXZpY2VVVUlELldSSVRFKTtcblxuICAgICAgYXdhaXQgdGhpcy53cml0ZUNoYXJhY3RlcmlzdGljVmFsdWUodGhpcy5mb3JtYXRDb21tYW5kKERldmljZUNvbW1hbmRzLlRWR1RJTUUpKTtcblxuICAgICAgdGhpcy5kZXZpY2UgPSBkZXZpY2U7XG4gICAgICB0aGlzLmRldmljZVN0YXRlID0gRGV2aWNlU3RhdGUuaGFuZHNoYWtlO1xuICAgICAgdGhpcy5hdHRhY2hEaXNjb25uZWN0TGlzdGVuZXIoKTtcblxuICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzdGFydElzb21ldHJpYygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLndyaXRlQ2hhcmFjdGVyaXN0aWNWYWx1ZSh0aGlzLmZvcm1hdENvbW1hbmQoRGV2aWNlQ29tbWFuZHMuSVNPTSkpO1xuICAgIHRoaXMuZGV2aWNlU3RhdGUgPSBEZXZpY2VTdGF0ZS5pc29tZXRyaWM7XG5cbiAgICBjb25zdCBjaGFyYWN0ZXJpc3RpYyA9IGF3YWl0IHRoaXMuc3RhcnROb3RpZmljYXRpb25zKCk7XG4gICAgdGhpcy5hdHRhY2hJc29tZXRyaWNMaXN0ZW5lcihjaGFyYWN0ZXJpc3RpYyk7XG4gIH1cblxuICBwdWJsaWMgdGFyZSgpOiB2b2lkIHtcbiAgICB0aGlzLndyaXRlQ2hhcmFjdGVyaXN0aWNWYWx1ZSh0aGlzLmZvcm1hdENvbW1hbmQoRGV2aWNlQ29tbWFuZHMuVEFSRSkpO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIHN0b3AoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy53cml0ZUNoYXJhY3RlcmlzdGljVmFsdWUodGhpcy5mb3JtYXRDb21tYW5kKERldmljZUNvbW1hbmRzLlNUT1ApKTtcbiAgICB0aGlzLmRldmljZVN0YXRlID0gRGV2aWNlU3RhdGUuc3RvcDtcbiAgfVxuXG4gIHB1YmxpYyBldmVyZ3JlZW5Nb2RlKGlzRXZlcmdyZWVuTW9kZTogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmIChpc0V2ZXJncmVlbk1vZGUpIHtcbiAgICAgIHRoaXMuZXZlcmdyZWVuTW9kZVRpbWVyID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgc3dpdGNoICh0aGlzLmRldmljZVN0YXRlKSB7XG4gICAgICAgICAgY2FzZSBEZXZpY2VTdGF0ZS5zdG9wOiBjYXNlIERldmljZVN0YXRlLmhhbmRzaGFrZTpcbiAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9LCA2MDAwMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5ldmVyZ3JlZW5Nb2RlVGltZXIpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBkaXNjb25uZWN0KCk6IHZvaWQge1xuICAgIHRoaXMuZGV2aWNlLmdhdHQuZGlzY29ubmVjdCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBhdHRhY2hEaXNjb25uZWN0TGlzdGVuZXIoKTogdm9pZCB7XG4gICAgdGhpcy5kZXZpY2UuYWRkRXZlbnRMaXN0ZW5lcignZ2F0dHNlcnZlcmRpc2Nvbm5lY3RlZCcsIChldmVudDogRXZlbnQpID0+IHtcbiAgICAgIHRoaXMuZGlzY29ubmVjdEV2ZW50QXNPYnNlcnZhYmxlLm5leHQoZXZlbnQpO1xuICAgICAgdGhpcy5kZXZpY2VTdGF0ZSA9IERldmljZVN0YXRlLmRpc2Nvbm5lY3RlZDtcbiAgICAgIHRoaXMuZGV2aWNlID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5zZXJ2ZXIgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnNlcnZpY2UgPSB1bmRlZmluZWQ7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNhY2hlQ2hhcmFjdGVyaXN0aWMoY2hhcmFjdGVyaXN0aWNVdWlkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjaGFyYWN0ZXJpc3RpYyA9IGF3YWl0IHRoaXMuc2VydmljZS5nZXRDaGFyYWN0ZXJpc3RpYyhjaGFyYWN0ZXJpc3RpY1V1aWQpO1xuICAgIHRoaXMuY2hhcmFjdGVyaXN0aWNzLnNldChjaGFyYWN0ZXJpc3RpY1V1aWQsIGNoYXJhY3RlcmlzdGljKTtcbiAgfVxuXG4gIHByaXZhdGUgd3JpdGVDaGFyYWN0ZXJpc3RpY1ZhbHVlKHZhbHVlOiBEYXRhVmlldyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNoYXJhY3RlcmlzdGljID0gdGhpcy5jaGFyYWN0ZXJpc3RpY3MuZ2V0KERldmljZVVVSUQuV1JJVEUpO1xuICAgIHJldHVybiBjaGFyYWN0ZXJpc3RpYy53cml0ZVZhbHVlKHZhbHVlKTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhcnROb3RpZmljYXRpb25zKCk6IFByb21pc2U8Qmx1ZXRvb3RoUmVtb3RlR0FUVENoYXJhY3RlcmlzdGljPiB7XG4gICAgY29uc3QgY2hhcmFjdGVyaXN0aWMgPSB0aGlzLmNoYXJhY3RlcmlzdGljcy5nZXQoRGV2aWNlVVVJRC5SRUFEKTtcbiAgICByZXR1cm4gY2hhcmFjdGVyaXN0aWMuc3RhcnROb3RpZmljYXRpb25zKCk7XG4gIH1cblxuICBwcml2YXRlIGF0dGFjaElzb21ldHJpY0xpc3RlbmVyKGNoYXJhY3RlcmlzdGljOiBCbHVldG9vdGhSZW1vdGVHQVRUQ2hhcmFjdGVyaXN0aWMpOiB2b2lkIHtcbiAgICBjaGFyYWN0ZXJpc3RpYy5hZGRFdmVudExpc3RlbmVyKCdjaGFyYWN0ZXJpc3RpY3ZhbHVlY2hhbmdlZCcsIGV2ZW50ID0+IHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldCBhcyBCbHVldG9vdGhSZW1vdGVHQVRUQ2hhcmFjdGVyaXN0aWM7XG4gICAgICB0aGlzLnBhcnNlRGF0YSh0YXJnZXQudmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZURhdGEoZGF0YTogRGF0YVZpZXcpOiB2b2lkIHtcbiAgICBjb25zdCBkZXZpY2VEYXRhQXNTdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIG5ldyBVaW50OEFycmF5KGRhdGEuYnVmZmVyKSk7XG4gICAgY29uc3QgaXNvbURhdGEgPSBkZXZpY2VEYXRhQXNTdHJpbmcubWF0Y2goL0lTKC4qKVxcL0lTLylbMV07XG5cbiAgICB0aGlzLmlzb21EYXRhQXNPYnNlcnZhYmxlLm5leHQoaXNvbURhdGEpO1xuICB9XG5cbiAgcHJpdmF0ZSBmb3JtYXRDb21tYW5kKHR5cGU6IHN0cmluZyk6IERhdGFWaWV3IHtcbiAgICBjb25zdCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIodHlwZS5sZW5ndGggKyAyKTtcbiAgICBjb25zdCBkYXRhVmlldyA9IG5ldyBEYXRhVmlldyhidWZmZXIsIDApO1xuXG4gICAgZGF0YVZpZXcuc2V0VWludDgoMCwgNjUpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0eXBlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRhdGFWaWV3LnNldFVpbnQ4KGkgKyAxLCB0eXBlLmNoYXJDb2RlQXQoaSkpO1xuICAgIH1cblxuICAgIGRhdGFWaWV3LnNldFVpbnQ4KHR5cGUubGVuZ3RoICsgMSwgMjUpO1xuXG4gICAgcmV0dXJuIGRhdGFWaWV3O1xuICB9XG5cbn1cbiJdfQ==