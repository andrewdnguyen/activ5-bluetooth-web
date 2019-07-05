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
        this.deviceAsObservable = new Subject();
        this.isomDataAsObservable = new Subject();
        this.characteristics = new Map();
        this.deviceState = DeviceState.disconnected;
    }
    /**
     * @return {?}
     */
    getDevice() {
        return this.deviceAsObservable.asObservable();
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
                this.deviceAsObservable.next(device);
                this.device = device;
                this.deviceState = DeviceState.handshake;
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
            this.attachListener(characteristic);
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
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.device.gatt.disconnect();
            this.device = undefined;
            this.server = undefined;
            this.service = undefined;
            this.deviceAsObservable.next(undefined);
        });
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
    attachListener(characteristic) {
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
    A5DeviceManager.prototype.deviceAsObservable;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYTUtZGV2aWNlLW1hbmFnZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AaDN0cmlrYS9hY3RpdjUtZGV2aWNlLyIsInNvdXJjZXMiOlsiYTUtZGV2aWNlLW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxtQ0FBbUM7O0FBRW5DLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQzs7OztJQUd6QyxTQUFVLHNDQUFzQztJQUNoRCxNQUFPLHNDQUFzQztJQUM3QyxPQUFRLHNDQUFzQzs7OztJQUk5QyxTQUFVLFNBQVM7SUFDbkIsTUFBTyxPQUFPO0lBQ2QsTUFBTyxPQUFPO0lBQ2QsTUFBTyxPQUFPOzs7O0lBSWQsV0FBWSxXQUFXO0lBQ3ZCLFdBQVksV0FBVztJQUN2QixNQUFPLE1BQU07SUFDYixjQUFlLGNBQWM7O0FBTy9CLE1BQU0sT0FBTyxlQUFlO0lBSjVCO1FBT1UsdUJBQWtCLEdBQUcsSUFBSSxPQUFPLEVBQW1CLENBQUM7UUFLcEQseUJBQW9CLEdBQUcsSUFBSSxPQUFPLEVBQVUsQ0FBQztRQUc3QyxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDNUIsZ0JBQVcsR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDO0tBMkhoRDs7OztJQXpIUSxTQUFTO1FBQ2QsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDaEQsQ0FBQzs7OztJQUVNLGdCQUFnQjtRQUNyQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNsRCxDQUFDOzs7O0lBRVksT0FBTzs7WUFFbEIsSUFBSSxNQUFNLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFOztvQkFDOUMsTUFBdUI7Z0JBRTNCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNoQixNQUFN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QUFDO1FBRTFELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDM0MsQ0FBQzs7Ozs7O0lBRU8sYUFBYSxDQUFDLElBQVk7O2NBQzFCLE1BQU0sR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQzs7Y0FDekMsUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFFeEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFekIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDbEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoRDtRQUVELFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFdkMsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQzs7O1lBeklGLFVBQVUsU0FBQztnQkFDVixVQUFVLEVBQUUsTUFBTTthQUNuQjs7Ozs7Ozs7SUFJQyxpQ0FBZ0M7Ozs7O0lBQ2hDLDZDQUE0RDs7Ozs7SUFFNUQsaUNBQTBDOzs7OztJQUMxQyxrQ0FBNEM7Ozs7O0lBRTVDLCtDQUFxRDs7Ozs7SUFFckQsNkNBQW1DOzs7OztJQUNuQywwQ0FBb0M7Ozs7O0lBQ3BDLHNDQUErQyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJpbmRleC5kLnRzXCIgLz5cblxuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5lbnVtIERldmljZVVVSUQge1xuICBTRVJWSUNFID0gJzAwMDA1MDAwLTAwMDAtMTAwMC04MDAwLTAwODA1ZjliMzRmYicsXG4gIFJFQUQgPSAnMDAwMDVhMDEtMDAwMC0xMDAwLTgwMDAtMDA4MDVmOWIzNGZiJyxcbiAgV1JJVEUgPSAnMDAwMDVhMDItMDAwMC0xMDAwLTgwMDAtMDA4MDVmOWIzNGZiJ1xufVxuXG5lbnVtIERldmljZUNvbW1hbmRzIHtcbiAgVFZHVElNRSA9ICdUVkdUSU1FJyxcbiAgSVNPTSA9ICdJU09NIScsXG4gIFRBUkUgPSAnVEFSRSEnLFxuICBTVE9QID0gJ1NUT1AhJ1xufVxuXG5lbnVtIERldmljZVN0YXRlIHtcbiAgaGFuZHNoYWtlID0gJ2hhbmRzaGFrZScsXG4gIGlzb21ldHJpYyA9ICdpc29tZXRyaWMnLFxuICBzdG9wID0gJ3N0b3AnLFxuICBkaXNjb25uZWN0ZWQgPSAnZGlzY29ubmVjdGVkJ1xufVxuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290J1xufSlcblxuZXhwb3J0IGNsYXNzIEE1RGV2aWNlTWFuYWdlciB7XG5cbiAgcHJpdmF0ZSBkZXZpY2U6IEJsdWV0b290aERldmljZTtcbiAgcHJpdmF0ZSBkZXZpY2VBc09ic2VydmFibGUgPSBuZXcgU3ViamVjdDxCbHVldG9vdGhEZXZpY2U+KCk7XG5cbiAgcHJpdmF0ZSBzZXJ2ZXI6IEJsdWV0b290aFJlbW90ZUdBVFRTZXJ2ZXI7XG4gIHByaXZhdGUgc2VydmljZTogQmx1ZXRvb3RoUmVtb3RlR0FUVFNlcnZpY2U7XG5cbiAgcHJpdmF0ZSBpc29tRGF0YUFzT2JzZXJ2YWJsZSA9IG5ldyBTdWJqZWN0PHN0cmluZz4oKTtcblxuICBwcml2YXRlIGV2ZXJncmVlbk1vZGVUaW1lcjogbnVtYmVyO1xuICBwcml2YXRlIGNoYXJhY3RlcmlzdGljcyA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBkZXZpY2VTdGF0ZSA9IERldmljZVN0YXRlLmRpc2Nvbm5lY3RlZDtcblxuICBwdWJsaWMgZ2V0RGV2aWNlKCk6IE9ic2VydmFibGU8Qmx1ZXRvb3RoRGV2aWNlPiB7XG4gICAgcmV0dXJuIHRoaXMuZGV2aWNlQXNPYnNlcnZhYmxlLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgcHVibGljIGdldElzb21ldHJpY0RhdGEoKTogT2JzZXJ2YWJsZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5pc29tRGF0YUFzT2JzZXJ2YWJsZS5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjb25uZWN0KCk6IFByb21pc2U8dm9pZD4ge1xuXG4gICAgaWYgKHdpbmRvdy5uYXZpZ2F0b3IgJiYgd2luZG93Lm5hdmlnYXRvci5ibHVldG9vdGgpIHtcbiAgICAgIGxldCBkZXZpY2U6IEJsdWV0b290aERldmljZTtcblxuICAgICAgaWYgKCF0aGlzLmRldmljZSkge1xuICAgICAgICBkZXZpY2UgPSBhd2FpdCBuYXZpZ2F0b3IuYmx1ZXRvb3RoLnJlcXVlc3REZXZpY2UoeyBmaWx0ZXJzOiBbeyBzZXJ2aWNlczogW0RldmljZVVVSUQuU0VSVklDRV0gfV0gfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5zZXJ2ZXIpIHtcbiAgICAgICAgdGhpcy5zZXJ2ZXIgPSBhd2FpdCBkZXZpY2UuZ2F0dC5jb25uZWN0KCk7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5zZXJ2aWNlKSB7XG4gICAgICAgIHRoaXMuc2VydmljZSA9IGF3YWl0IHRoaXMuc2VydmVyLmdldFByaW1hcnlTZXJ2aWNlKERldmljZVVVSUQuU0VSVklDRSk7XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IHRoaXMuY2FjaGVDaGFyYWN0ZXJpc3RpYyhEZXZpY2VVVUlELlJFQUQpO1xuICAgICAgYXdhaXQgdGhpcy5jYWNoZUNoYXJhY3RlcmlzdGljKERldmljZVVVSUQuV1JJVEUpO1xuXG4gICAgICBhd2FpdCB0aGlzLndyaXRlQ2hhcmFjdGVyaXN0aWNWYWx1ZSh0aGlzLmZvcm1hdENvbW1hbmQoRGV2aWNlQ29tbWFuZHMuVFZHVElNRSkpO1xuXG4gICAgICB0aGlzLmRldmljZUFzT2JzZXJ2YWJsZS5uZXh0KGRldmljZSk7XG4gICAgICB0aGlzLmRldmljZSA9IGRldmljZTtcbiAgICAgIHRoaXMuZGV2aWNlU3RhdGUgPSBEZXZpY2VTdGF0ZS5oYW5kc2hha2U7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHN0YXJ0SXNvbWV0cmljKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMud3JpdGVDaGFyYWN0ZXJpc3RpY1ZhbHVlKHRoaXMuZm9ybWF0Q29tbWFuZChEZXZpY2VDb21tYW5kcy5JU09NKSk7XG4gICAgdGhpcy5kZXZpY2VTdGF0ZSA9IERldmljZVN0YXRlLmlzb21ldHJpYztcblxuICAgIGNvbnN0IGNoYXJhY3RlcmlzdGljID0gYXdhaXQgdGhpcy5zdGFydE5vdGlmaWNhdGlvbnMoKTtcbiAgICB0aGlzLmF0dGFjaExpc3RlbmVyKGNoYXJhY3RlcmlzdGljKTtcbiAgfVxuXG4gIHB1YmxpYyB0YXJlKCk6IHZvaWQge1xuICAgIHRoaXMud3JpdGVDaGFyYWN0ZXJpc3RpY1ZhbHVlKHRoaXMuZm9ybWF0Q29tbWFuZChEZXZpY2VDb21tYW5kcy5UQVJFKSk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc3RvcCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLndyaXRlQ2hhcmFjdGVyaXN0aWNWYWx1ZSh0aGlzLmZvcm1hdENvbW1hbmQoRGV2aWNlQ29tbWFuZHMuU1RPUCkpO1xuICAgIHRoaXMuZGV2aWNlU3RhdGUgPSBEZXZpY2VTdGF0ZS5zdG9wO1xuICB9XG5cbiAgcHVibGljIGV2ZXJncmVlbk1vZGUoaXNFdmVyZ3JlZW5Nb2RlOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKGlzRXZlcmdyZWVuTW9kZSkge1xuICAgICAgdGhpcy5ldmVyZ3JlZW5Nb2RlVGltZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHRoaXMuZGV2aWNlU3RhdGUpIHtcbiAgICAgICAgICBjYXNlIERldmljZVN0YXRlLnN0b3A6IGNhc2UgRGV2aWNlU3RhdGUuaGFuZHNoYWtlOlxuICAgICAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0sIDYwMDAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmV2ZXJncmVlbk1vZGVUaW1lcik7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGRpc2Nvbm5lY3QoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5kZXZpY2UuZ2F0dC5kaXNjb25uZWN0KCk7XG4gICAgdGhpcy5kZXZpY2UgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5zZXJ2ZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5zZXJ2aWNlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZGV2aWNlQXNPYnNlcnZhYmxlLm5leHQodW5kZWZpbmVkKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY2FjaGVDaGFyYWN0ZXJpc3RpYyhjaGFyYWN0ZXJpc3RpY1V1aWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNoYXJhY3RlcmlzdGljID0gYXdhaXQgdGhpcy5zZXJ2aWNlLmdldENoYXJhY3RlcmlzdGljKGNoYXJhY3RlcmlzdGljVXVpZCk7XG4gICAgdGhpcy5jaGFyYWN0ZXJpc3RpY3Muc2V0KGNoYXJhY3RlcmlzdGljVXVpZCwgY2hhcmFjdGVyaXN0aWMpO1xuICB9XG5cbiAgcHJpdmF0ZSB3cml0ZUNoYXJhY3RlcmlzdGljVmFsdWUodmFsdWU6IERhdGFWaWV3KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY2hhcmFjdGVyaXN0aWMgPSB0aGlzLmNoYXJhY3RlcmlzdGljcy5nZXQoRGV2aWNlVVVJRC5XUklURSk7XG4gICAgcmV0dXJuIGNoYXJhY3RlcmlzdGljLndyaXRlVmFsdWUodmFsdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGFydE5vdGlmaWNhdGlvbnMoKTogUHJvbWlzZTxCbHVldG9vdGhSZW1vdGVHQVRUQ2hhcmFjdGVyaXN0aWM+IHtcbiAgICBjb25zdCBjaGFyYWN0ZXJpc3RpYyA9IHRoaXMuY2hhcmFjdGVyaXN0aWNzLmdldChEZXZpY2VVVUlELlJFQUQpO1xuICAgIHJldHVybiBjaGFyYWN0ZXJpc3RpYy5zdGFydE5vdGlmaWNhdGlvbnMoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXR0YWNoTGlzdGVuZXIoY2hhcmFjdGVyaXN0aWM6IEJsdWV0b290aFJlbW90ZUdBVFRDaGFyYWN0ZXJpc3RpYyk6IHZvaWQge1xuICAgIGNoYXJhY3RlcmlzdGljLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYXJhY3RlcmlzdGljdmFsdWVjaGFuZ2VkJywgZXZlbnQgPT4ge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGFzIEJsdWV0b290aFJlbW90ZUdBVFRDaGFyYWN0ZXJpc3RpYztcbiAgICAgIHRoaXMucGFyc2VEYXRhKHRhcmdldC52YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHBhcnNlRGF0YShkYXRhOiBEYXRhVmlldyk6IHZvaWQge1xuICAgIGNvbnN0IGRldmljZURhdGFBc1N0cmluZyA9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIpKTtcbiAgICBjb25zdCBpc29tRGF0YSA9IGRldmljZURhdGFBc1N0cmluZy5tYXRjaCgvSVMoLiopXFwvSVMvKVsxXTtcblxuICAgIHRoaXMuaXNvbURhdGFBc09ic2VydmFibGUubmV4dChpc29tRGF0YSk7XG4gIH1cblxuICBwcml2YXRlIGZvcm1hdENvbW1hbmQodHlwZTogc3RyaW5nKTogRGF0YVZpZXcge1xuICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcih0eXBlLmxlbmd0aCArIDIpO1xuICAgIGNvbnN0IGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlciwgMCk7XG5cbiAgICBkYXRhVmlldy5zZXRVaW50OCgwLCA2NSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHR5cGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGF0YVZpZXcuc2V0VWludDgoaSArIDEsIHR5cGUuY2hhckNvZGVBdChpKSk7XG4gICAgfVxuXG4gICAgZGF0YVZpZXcuc2V0VWludDgodHlwZS5sZW5ndGggKyAxLCAyNSk7XG5cbiAgICByZXR1cm4gZGF0YVZpZXc7XG4gIH1cblxufVxuIl19