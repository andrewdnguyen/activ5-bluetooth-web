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
var DeviceUUID = {
    SERVICE: '00005000-0000-1000-8000-00805f9b34fb',
    READ: '00005a01-0000-1000-8000-00805f9b34fb',
    WRITE: '00005a02-0000-1000-8000-00805f9b34fb',
};
/** @enum {string} */
var DeviceCommands = {
    TVGTIME: 'TVGTIME',
    ISOM: 'ISOM!',
    TARE: 'TARE!',
    STOP: 'STOP!',
};
/** @enum {string} */
var DeviceState = {
    handshake: 'handshake',
    isometric: 'isometric',
    stop: 'stop',
    disconnected: 'disconnected',
};
var A5DeviceManager = /** @class */ (function () {
    function A5DeviceManager() {
        this.disconnectEventAsObservable = new Subject();
        this.isomDataAsObservable = new Subject();
        this.characteristics = new Map();
        this.deviceState = DeviceState.disconnected;
    }
    /**
     * @return {?}
     */
    A5DeviceManager.prototype.getIsometricData = /**
     * @return {?}
     */
    function () {
        return this.isomDataAsObservable.asObservable();
    };
    /**
     * @return {?}
     */
    A5DeviceManager.prototype.onDisconnect = /**
     * @return {?}
     */
    function () {
        return this.disconnectEventAsObservable.asObservable();
    };
    /**
     * @return {?}
     */
    A5DeviceManager.prototype.connect = /**
     * @return {?}
     */
    function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var device, _a, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(window.navigator && window.navigator.bluetooth)) return [3 /*break*/, 10];
                        device = void 0;
                        if (!!this.device) return [3 /*break*/, 2];
                        return [4 /*yield*/, navigator.bluetooth.requestDevice({ filters: [{ services: [DeviceUUID.SERVICE] }] })];
                    case 1:
                        device = _c.sent();
                        _c.label = 2;
                    case 2:
                        if (!!this.server) return [3 /*break*/, 4];
                        _a = this;
                        return [4 /*yield*/, device.gatt.connect()];
                    case 3:
                        _a.server = _c.sent();
                        _c.label = 4;
                    case 4:
                        if (!!this.service) return [3 /*break*/, 6];
                        _b = this;
                        return [4 /*yield*/, this.server.getPrimaryService(DeviceUUID.SERVICE)];
                    case 5:
                        _b.service = _c.sent();
                        _c.label = 6;
                    case 6: return [4 /*yield*/, this.cacheCharacteristic(DeviceUUID.READ)];
                    case 7:
                        _c.sent();
                        return [4 /*yield*/, this.cacheCharacteristic(DeviceUUID.WRITE)];
                    case 8:
                        _c.sent();
                        return [4 /*yield*/, this.writeCharacteristicValue(this.formatCommand(DeviceCommands.TVGTIME))];
                    case 9:
                        _c.sent();
                        this.device = device;
                        this.deviceState = DeviceState.handshake;
                        this.attachDisconnectListener();
                        return [2 /*return*/, this.device];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @return {?}
     */
    A5DeviceManager.prototype.startIsometric = /**
     * @return {?}
     */
    function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var characteristic;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeCharacteristicValue(this.formatCommand(DeviceCommands.ISOM))];
                    case 1:
                        _a.sent();
                        this.deviceState = DeviceState.isometric;
                        return [4 /*yield*/, this.startNotifications()];
                    case 2:
                        characteristic = _a.sent();
                        this.attachIsometricListener(characteristic);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @return {?}
     */
    A5DeviceManager.prototype.tare = /**
     * @return {?}
     */
    function () {
        this.writeCharacteristicValue(this.formatCommand(DeviceCommands.TARE));
    };
    /**
     * @return {?}
     */
    A5DeviceManager.prototype.stop = /**
     * @return {?}
     */
    function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeCharacteristicValue(this.formatCommand(DeviceCommands.STOP))];
                    case 1:
                        _a.sent();
                        this.deviceState = DeviceState.stop;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @param {?} isEvergreenMode
     * @return {?}
     */
    A5DeviceManager.prototype.evergreenMode = /**
     * @param {?} isEvergreenMode
     * @return {?}
     */
    function (isEvergreenMode) {
        var _this = this;
        if (isEvergreenMode) {
            this.evergreenModeTimer = window.setInterval((/**
             * @return {?}
             */
            function () {
                switch (_this.deviceState) {
                    case DeviceState.stop:
                    case DeviceState.handshake:
                        _this.stop();
                        break;
                    default:
                        break;
                }
            }), 60000);
        }
        else {
            clearInterval(this.evergreenModeTimer);
        }
    };
    /**
     * @return {?}
     */
    A5DeviceManager.prototype.disconnect = /**
     * @return {?}
     */
    function () {
        this.device.gatt.disconnect();
    };
    /**
     * @private
     * @return {?}
     */
    A5DeviceManager.prototype.attachDisconnectListener = /**
     * @private
     * @return {?}
     */
    function () {
        var _this = this;
        this.device.addEventListener('gattserverdisconnected', (/**
         * @param {?} event
         * @return {?}
         */
        function (event) {
            _this.disconnectEventAsObservable.next(event);
            _this.deviceState = DeviceState.disconnected;
            _this.device = undefined;
            _this.server = undefined;
            _this.service = undefined;
        }));
    };
    /**
     * @private
     * @param {?} characteristicUuid
     * @return {?}
     */
    A5DeviceManager.prototype.cacheCharacteristic = /**
     * @private
     * @param {?} characteristicUuid
     * @return {?}
     */
    function (characteristicUuid) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var characteristic;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.service.getCharacteristic(characteristicUuid)];
                    case 1:
                        characteristic = _a.sent();
                        this.characteristics.set(characteristicUuid, characteristic);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @private
     * @param {?} value
     * @return {?}
     */
    A5DeviceManager.prototype.writeCharacteristicValue = /**
     * @private
     * @param {?} value
     * @return {?}
     */
    function (value) {
        /** @type {?} */
        var characteristic = this.characteristics.get(DeviceUUID.WRITE);
        return characteristic.writeValue(value);
    };
    /**
     * @private
     * @return {?}
     */
    A5DeviceManager.prototype.startNotifications = /**
     * @private
     * @return {?}
     */
    function () {
        /** @type {?} */
        var characteristic = this.characteristics.get(DeviceUUID.READ);
        return characteristic.startNotifications();
    };
    /**
     * @private
     * @param {?} characteristic
     * @return {?}
     */
    A5DeviceManager.prototype.attachIsometricListener = /**
     * @private
     * @param {?} characteristic
     * @return {?}
     */
    function (characteristic) {
        var _this = this;
        characteristic.addEventListener('characteristicvaluechanged', (/**
         * @param {?} event
         * @return {?}
         */
        function (event) {
            /** @type {?} */
            var target = (/** @type {?} */ (event.target));
            _this.parseData(target.value);
        }));
    };
    /**
     * @private
     * @param {?} data
     * @return {?}
     */
    A5DeviceManager.prototype.parseData = /**
     * @private
     * @param {?} data
     * @return {?}
     */
    function (data) {
        /** @type {?} */
        var deviceDataAsString = String.fromCharCode.apply(null, new Uint8Array(data.buffer));
        /** @type {?} */
        var isomData = deviceDataAsString.match(/IS(.*)\/IS/)[1];
        this.isomDataAsObservable.next(isomData);
    };
    /**
     * @private
     * @param {?} type
     * @return {?}
     */
    A5DeviceManager.prototype.formatCommand = /**
     * @private
     * @param {?} type
     * @return {?}
     */
    function (type) {
        /** @type {?} */
        var buffer = new ArrayBuffer(type.length + 2);
        /** @type {?} */
        var dataView = new DataView(buffer, 0);
        dataView.setUint8(0, 65);
        for (var i = 0; i < type.length; i++) {
            dataView.setUint8(i + 1, type.charCodeAt(i));
        }
        dataView.setUint8(type.length + 1, 25);
        return dataView;
    };
    A5DeviceManager.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'root'
                },] }
    ];
    /** @nocollapse */ A5DeviceManager.ngInjectableDef = i0.defineInjectable({ factory: function A5DeviceManager_Factory() { return new A5DeviceManager(); }, token: A5DeviceManager, providedIn: "root" });
    return A5DeviceManager;
}());
export { A5DeviceManager };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYTUtZGV2aWNlLW1hbmFnZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AaDN0cmlrYS9hY3RpdjUtZGV2aWNlLyIsInNvdXJjZXMiOlsiYTUtZGV2aWNlLW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxtQ0FBbUM7O0FBRW5DLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQzs7OztJQUd6QyxTQUFVLHNDQUFzQztJQUNoRCxNQUFPLHNDQUFzQztJQUM3QyxPQUFRLHNDQUFzQzs7OztJQUk5QyxTQUFVLFNBQVM7SUFDbkIsTUFBTyxPQUFPO0lBQ2QsTUFBTyxPQUFPO0lBQ2QsTUFBTyxPQUFPOzs7O0lBSWQsV0FBWSxXQUFXO0lBQ3ZCLFdBQVksV0FBVztJQUN2QixNQUFPLE1BQU07SUFDYixjQUFlLGNBQWM7O0FBRy9CO0lBQUE7UUFRVSxnQ0FBMkIsR0FBRyxJQUFJLE9BQU8sRUFBUyxDQUFDO1FBS25ELHlCQUFvQixHQUFHLElBQUksT0FBTyxFQUFVLENBQUM7UUFHN0Msb0JBQWUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzVCLGdCQUFXLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQztLQW1JaEQ7Ozs7SUFqSVEsMENBQWdCOzs7SUFBdkI7UUFDRSxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNsRCxDQUFDOzs7O0lBRU0sc0NBQVk7OztJQUFuQjtRQUNFLE9BQU8sSUFBSSxDQUFDLDJCQUEyQixDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3pELENBQUM7Ozs7SUFFWSxpQ0FBTzs7O0lBQXBCOzs7Ozs7NkJBRU0sQ0FBQSxNQUFNLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFBLEVBQTlDLHlCQUE4Qzt3QkFDNUMsTUFBTSxTQUFpQjs2QkFFdkIsQ0FBQyxJQUFJLENB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QUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoRDtRQUVELFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFdkMsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQzs7Z0JBbEpGLFVBQVUsU0FBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkI7OzswQkEzQkQ7Q0E2S0MsQUFwSkQsSUFvSkM7U0FoSlksZUFBZTs7Ozs7O0lBRTFCLGlDQUFnQzs7Ozs7SUFFaEMsc0RBQTJEOzs7OztJQUUzRCxpQ0FBMEM7Ozs7O0lBQzFDLGtDQUE0Qzs7Ozs7SUFFNUMsK0NBQXFEOzs7OztJQUVyRCw2Q0FBbUM7Ozs7O0lBQ25DLDBDQUFvQzs7Ozs7SUFDcEMsc0NBQStDIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImluZGV4LmQudHNcIiAvPlxuXG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmVudW0gRGV2aWNlVVVJRCB7XG4gIFNFUlZJQ0UgPSAnMDAwMDUwMDAtMDAwMC0xMDAwLTgwMDAtMDA4MDVmOWIzNGZiJyxcbiAgUkVBRCA9ICcwMDAwNWEwMS0wMDAwLTEwMDAtODAwMC0wMDgwNWY5YjM0ZmInLFxuICBXUklURSA9ICcwMDAwNWEwMi0wMDAwLTEwMDAtODAwMC0wMDgwNWY5YjM0ZmInXG59XG5cbmVudW0gRGV2aWNlQ29tbWFuZHMge1xuICBUVkdUSU1FID0gJ1RWR1RJTUUnLFxuICBJU09NID0gJ0lTT00hJyxcbiAgVEFSRSA9ICdUQVJFIScsXG4gIFNUT1AgPSAnU1RPUCEnXG59XG5cbmVudW0gRGV2aWNlU3RhdGUge1xuICBoYW5kc2hha2UgPSAnaGFuZHNoYWtlJyxcbiAgaXNvbWV0cmljID0gJ2lzb21ldHJpYycsXG4gIHN0b3AgPSAnc3RvcCcsXG4gIGRpc2Nvbm5lY3RlZCA9ICdkaXNjb25uZWN0ZWQnXG59XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuXG5leHBvcnQgY2xhc3MgQTVEZXZpY2VNYW5hZ2VyIHtcblxuICBwcml2YXRlIGRldmljZTogQmx1ZXRvb3RoRGV2aWNlO1xuXG4gIHByaXZhdGUgZGlzY29ubmVjdEV2ZW50QXNPYnNlcnZhYmxlID0gbmV3IFN1YmplY3Q8RXZlbnQ+KCk7XG5cbiAgcHJpdmF0ZSBzZXJ2ZXI6IEJsdWV0b290aFJlbW90ZUdBVFRTZXJ2ZXI7XG4gIHByaXZhdGUgc2VydmljZTogQmx1ZXRvb3RoUmVtb3RlR0FUVFNlcnZpY2U7XG5cbiAgcHJpdmF0ZSBpc29tRGF0YUFzT2JzZXJ2YWJsZSA9IG5ldyBTdWJqZWN0PHN0cmluZz4oKTtcblxuICBwcml2YXRlIGV2ZXJncmVlbk1vZGVUaW1lcjogbnVtYmVyO1xuICBwcml2YXRlIGNoYXJhY3RlcmlzdGljcyA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBkZXZpY2VTdGF0ZSA9IERldmljZVN0YXRlLmRpc2Nvbm5lY3RlZDtcblxuICBwdWJsaWMgZ2V0SXNvbWV0cmljRGF0YSgpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmlzb21EYXRhQXNPYnNlcnZhYmxlLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgcHVibGljIG9uRGlzY29ubmVjdCgpOiBPYnNlcnZhYmxlPEV2ZW50PiB7XG4gICAgcmV0dXJuIHRoaXMuZGlzY29ubmVjdEV2ZW50QXNPYnNlcnZhYmxlLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIGNvbm5lY3QoKTogUHJvbWlzZTxCbHVldG9vdGhEZXZpY2U+IHtcblxuICAgIGlmICh3aW5kb3cubmF2aWdhdG9yICYmIHdpbmRvdy5uYXZpZ2F0b3IuYmx1ZXRvb3RoKSB7XG4gICAgICBsZXQgZGV2aWNlOiBCbHVldG9vdGhEZXZpY2U7XG5cbiAgICAgIGlmICghdGhpcy5kZXZpY2UpIHtcbiAgICAgICAgZGV2aWNlID0gYXdhaXQgbmF2aWdhdG9yLmJsdWV0b290aC5yZXF1ZXN0RGV2aWNlKHsgZmlsdGVyczogW3sgc2VydmljZXM6IFtEZXZpY2VVVUlELlNFUlZJQ0VdIH1dIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuc2VydmVyKSB7XG4gICAgICAgIHRoaXMuc2VydmVyID0gYXdhaXQgZGV2aWNlLmdhdHQuY29ubmVjdCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuc2VydmljZSkge1xuICAgICAgICB0aGlzLnNlcnZpY2UgPSBhd2FpdCB0aGlzLnNlcnZlci5nZXRQcmltYXJ5U2VydmljZShEZXZpY2VVVUlELlNFUlZJQ0UpO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCB0aGlzLmNhY2hlQ2hhcmFjdGVyaXN0aWMoRGV2aWNlVVVJRC5SRUFEKTtcbiAgICAgIGF3YWl0IHRoaXMuY2FjaGVDaGFyYWN0ZXJpc3RpYyhEZXZpY2VVVUlELldSSVRFKTtcblxuICAgICAgYXdhaXQgdGhpcy53cml0ZUNoYXJhY3RlcmlzdGljVmFsdWUodGhpcy5mb3JtYXRDb21tYW5kKERldmljZUNvbW1hbmRzLlRWR1RJTUUpKTtcblxuICAgICAgdGhpcy5kZXZpY2UgPSBkZXZpY2U7XG4gICAgICB0aGlzLmRldmljZVN0YXRlID0gRGV2aWNlU3RhdGUuaGFuZHNoYWtlO1xuICAgICAgdGhpcy5hdHRhY2hEaXNjb25uZWN0TGlzdGVuZXIoKTtcblxuICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzdGFydElzb21ldHJpYygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLndyaXRlQ2hhcmFjdGVyaXN0aWNWYWx1ZSh0aGlzLmZvcm1hdENvbW1hbmQoRGV2aWNlQ29tbWFuZHMuSVNPTSkpO1xuICAgIHRoaXMuZGV2aWNlU3RhdGUgPSBEZXZpY2VTdGF0ZS5pc29tZXRyaWM7XG5cbiAgICBjb25zdCBjaGFyYWN0ZXJpc3RpYyA9IGF3YWl0IHRoaXMuc3RhcnROb3RpZmljYXRpb25zKCk7XG4gICAgdGhpcy5hdHRhY2hJc29tZXRyaWNMaXN0ZW5lcihjaGFyYWN0ZXJpc3RpYyk7XG4gIH1cblxuICBwdWJsaWMgdGFyZSgpOiB2b2lkIHtcbiAgICB0aGlzLndyaXRlQ2hhcmFjdGVyaXN0aWNWYWx1ZSh0aGlzLmZvcm1hdENvbW1hbmQoRGV2aWNlQ29tbWFuZHMuVEFSRSkpO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIHN0b3AoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy53cml0ZUNoYXJhY3RlcmlzdGljVmFsdWUodGhpcy5mb3JtYXRDb21tYW5kKERldmljZUNvbW1hbmRzLlNUT1ApKTtcbiAgICB0aGlzLmRldmljZVN0YXRlID0gRGV2aWNlU3RhdGUuc3RvcDtcbiAgfVxuXG4gIHB1YmxpYyBldmVyZ3JlZW5Nb2RlKGlzRXZlcmdyZWVuTW9kZTogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmIChpc0V2ZXJncmVlbk1vZGUpIHtcbiAgICAgIHRoaXMuZXZlcmdyZWVuTW9kZVRpbWVyID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgc3dpdGNoICh0aGlzLmRldmljZVN0YXRlKSB7XG4gICAgICAgICAgY2FzZSBEZXZpY2VTdGF0ZS5zdG9wOiBjYXNlIERldmljZVN0YXRlLmhhbmRzaGFrZTpcbiAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9LCA2MDAwMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5ldmVyZ3JlZW5Nb2RlVGltZXIpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBkaXNjb25uZWN0KCk6IHZvaWQge1xuICAgIHRoaXMuZGV2aWNlLmdhdHQuZGlzY29ubmVjdCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBhdHRhY2hEaXNjb25uZWN0TGlzdGVuZXIoKTogdm9pZCB7XG4gICAgdGhpcy5kZXZpY2UuYWRkRXZlbnRMaXN0ZW5lcignZ2F0dHNlcnZlcmRpc2Nvbm5lY3RlZCcsIChldmVudDogRXZlbnQpID0+IHtcbiAgICAgIHRoaXMuZGlzY29ubmVjdEV2ZW50QXNPYnNlcnZhYmxlLm5leHQoZXZlbnQpO1xuICAgICAgdGhpcy5kZXZpY2VTdGF0ZSA9IERldmljZVN0YXRlLmRpc2Nvbm5lY3RlZDtcbiAgICAgIHRoaXMuZGV2aWNlID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5zZXJ2ZXIgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnNlcnZpY2UgPSB1bmRlZmluZWQ7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNhY2hlQ2hhcmFjdGVyaXN0aWMoY2hhcmFjdGVyaXN0aWNVdWlkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjaGFyYWN0ZXJpc3RpYyA9IGF3YWl0IHRoaXMuc2VydmljZS5nZXRDaGFyYWN0ZXJpc3RpYyhjaGFyYWN0ZXJpc3RpY1V1aWQpO1xuICAgIHRoaXMuY2hhcmFjdGVyaXN0aWNzLnNldChjaGFyYWN0ZXJpc3RpY1V1aWQsIGNoYXJhY3RlcmlzdGljKTtcbiAgfVxuXG4gIHByaXZhdGUgd3JpdGVDaGFyYWN0ZXJpc3RpY1ZhbHVlKHZhbHVlOiBEYXRhVmlldyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNoYXJhY3RlcmlzdGljID0gdGhpcy5jaGFyYWN0ZXJpc3RpY3MuZ2V0KERldmljZVVVSUQuV1JJVEUpO1xuICAgIHJldHVybiBjaGFyYWN0ZXJpc3RpYy53cml0ZVZhbHVlKHZhbHVlKTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhcnROb3RpZmljYXRpb25zKCk6IFByb21pc2U8Qmx1ZXRvb3RoUmVtb3RlR0FUVENoYXJhY3RlcmlzdGljPiB7XG4gICAgY29uc3QgY2hhcmFjdGVyaXN0aWMgPSB0aGlzLmNoYXJhY3RlcmlzdGljcy5nZXQoRGV2aWNlVVVJRC5SRUFEKTtcbiAgICByZXR1cm4gY2hhcmFjdGVyaXN0aWMuc3RhcnROb3RpZmljYXRpb25zKCk7XG4gIH1cblxuICBwcml2YXRlIGF0dGFjaElzb21ldHJpY0xpc3RlbmVyKGNoYXJhY3RlcmlzdGljOiBCbHVldG9vdGhSZW1vdGVHQVRUQ2hhcmFjdGVyaXN0aWMpOiB2b2lkIHtcbiAgICBjaGFyYWN0ZXJpc3RpYy5hZGRFdmVudExpc3RlbmVyKCdjaGFyYWN0ZXJpc3RpY3ZhbHVlY2hhbmdlZCcsIGV2ZW50ID0+IHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldCBhcyBCbHVldG9vdGhSZW1vdGVHQVRUQ2hhcmFjdGVyaXN0aWM7XG4gICAgICB0aGlzLnBhcnNlRGF0YSh0YXJnZXQudmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZURhdGEoZGF0YTogRGF0YVZpZXcpOiB2b2lkIHtcbiAgICBjb25zdCBkZXZpY2VEYXRhQXNTdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIG5ldyBVaW50OEFycmF5KGRhdGEuYnVmZmVyKSk7XG4gICAgY29uc3QgaXNvbURhdGEgPSBkZXZpY2VEYXRhQXNTdHJpbmcubWF0Y2goL0lTKC4qKVxcL0lTLylbMV07XG5cbiAgICB0aGlzLmlzb21EYXRhQXNPYnNlcnZhYmxlLm5leHQoaXNvbURhdGEpO1xuICB9XG5cbiAgcHJpdmF0ZSBmb3JtYXRDb21tYW5kKHR5cGU6IHN0cmluZyk6IERhdGFWaWV3IHtcbiAgICBjb25zdCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIodHlwZS5sZW5ndGggKyAyKTtcbiAgICBjb25zdCBkYXRhVmlldyA9IG5ldyBEYXRhVmlldyhidWZmZXIsIDApO1xuXG4gICAgZGF0YVZpZXcuc2V0VWludDgoMCwgNjUpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0eXBlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRhdGFWaWV3LnNldFVpbnQ4KGkgKyAxLCB0eXBlLmNoYXJDb2RlQXQoaSkpO1xuICAgIH1cblxuICAgIGRhdGFWaWV3LnNldFVpbnQ4KHR5cGUubGVuZ3RoICsgMSwgMjUpO1xuXG4gICAgcmV0dXJuIGRhdGFWaWV3O1xuICB9XG5cbn1cbiJdfQ==