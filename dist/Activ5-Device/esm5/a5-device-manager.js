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
        this.deviceAsObservable = new Subject();
        this.isomDataAsObservable = new Subject();
        this.characteristics = new Map();
        this.deviceState = DeviceState.disconnected;
    }
    /**
     * @return {?}
     */
    A5DeviceManager.prototype.getDevice = /**
     * @return {?}
     */
    function () {
        return this.deviceAsObservable.asObservable();
    };
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
                        this.deviceAsObservable.next(device);
                        this.device = device;
                        this.deviceState = DeviceState.handshake;
                        _c.label = 10;
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
                        this.attachListener(characteristic);
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.device.gatt.disconnect()];
                    case 1:
                        _a.sent();
                        this.device = undefined;
                        this.server = undefined;
                        this.service = undefined;
                        this.deviceAsObservable.next(undefined);
                        return [2 /*return*/];
                }
            });
        });
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
    A5DeviceManager.prototype.attachListener = /**
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYTUtZGV2aWNlLW1hbmFnZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AaDN0cmlrYS9hY3RpdjUtZGV2aWNlLyIsInNvdXJjZXMiOlsiYTUtZGV2aWNlLW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxtQ0FBbUM7O0FBRW5DLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQzs7OztJQUd6QyxTQUFVLHNDQUFzQztJQUNoRCxNQUFPLHNDQUFzQztJQUM3QyxPQUFRLHNDQUFzQzs7OztJQUk5QyxTQUFVLFNBQVM7SUFDbkIsTUFBTyxPQUFPO0lBQ2QsTUFBTyxPQUFPO0lBQ2QsTUFBTyxPQUFPOzs7O0lBSWQsV0FBWSxXQUFXO0lBQ3ZCLFdBQVksV0FBVztJQUN2QixNQUFPLE1BQU07SUFDYixjQUFlLGNBQWM7O0FBRy9CO0lBQUE7UUFPVSx1QkFBa0IsR0FBRyxJQUFJLE9BQU8sRUFBbUIsQ0FBQztRQUtwRCx5QkFBb0IsR0FBRyxJQUFJLE9BQU8sRUFBVSxDQUFDO1FBRzdDLG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUM1QixnQkFBVyxHQUFHLFdBQVcsQ0FBQyxZQUFZLENBQUM7S0EySGhEOzs7O0lBekhRLG1DQUFTOzs7SUFBaEI7UUFDRSxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNoRCxDQUFDOzs7O0lBRU0sMENBQWdCOzs7SUFBdkI7UUFDRSxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNsRCxDQUFDOzs7O0lBRVksaUNBQU87OztJQUFwQjs7Ozs7OzZCQUVNLENBQUEsTUFBTSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQSxFQUE5Qyx5QkFBOEM7d0JBQzVDLE1BQU0sU0FBaUI7NkJBRXZCLENBQUMsSUFBSSxD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QUFDOztnQkF6SUYsVUFBVSxTQUFDO29CQUNWLFVBQVUsRUFBRSxNQUFNO2lCQUNuQjs7OzBCQTNCRDtDQW9LQyxBQTNJRCxJQTJJQztTQXZJWSxlQUFlOzs7Ozs7SUFFMUIsaUNBQWdDOzs7OztJQUNoQyw2Q0FBNEQ7Ozs7O0lBRTVELGlDQUEwQzs7Ozs7SUFDMUMsa0NBQTRDOzs7OztJQUU1QywrQ0FBcUQ7Ozs7O0lBRXJELDZDQUFtQzs7Ozs7SUFDbkMsMENBQW9DOzs7OztJQUNwQyxzQ0FBK0MiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiaW5kZXguZC50c1wiIC8+XG5cbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuZW51bSBEZXZpY2VVVUlEIHtcbiAgU0VSVklDRSA9ICcwMDAwNTAwMC0wMDAwLTEwMDAtODAwMC0wMDgwNWY5YjM0ZmInLFxuICBSRUFEID0gJzAwMDA1YTAxLTAwMDAtMTAwMC04MDAwLTAwODA1ZjliMzRmYicsXG4gIFdSSVRFID0gJzAwMDA1YTAyLTAwMDAtMTAwMC04MDAwLTAwODA1ZjliMzRmYidcbn1cblxuZW51bSBEZXZpY2VDb21tYW5kcyB7XG4gIFRWR1RJTUUgPSAnVFZHVElNRScsXG4gIElTT00gPSAnSVNPTSEnLFxuICBUQVJFID0gJ1RBUkUhJyxcbiAgU1RPUCA9ICdTVE9QISdcbn1cblxuZW51bSBEZXZpY2VTdGF0ZSB7XG4gIGhhbmRzaGFrZSA9ICdoYW5kc2hha2UnLFxuICBpc29tZXRyaWMgPSAnaXNvbWV0cmljJyxcbiAgc3RvcCA9ICdzdG9wJyxcbiAgZGlzY29ubmVjdGVkID0gJ2Rpc2Nvbm5lY3RlZCdcbn1cblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5cbmV4cG9ydCBjbGFzcyBBNURldmljZU1hbmFnZXIge1xuXG4gIHByaXZhdGUgZGV2aWNlOiBCbHVldG9vdGhEZXZpY2U7XG4gIHByaXZhdGUgZGV2aWNlQXNPYnNlcnZhYmxlID0gbmV3IFN1YmplY3Q8Qmx1ZXRvb3RoRGV2aWNlPigpO1xuXG4gIHByaXZhdGUgc2VydmVyOiBCbHVldG9vdGhSZW1vdGVHQVRUU2VydmVyO1xuICBwcml2YXRlIHNlcnZpY2U6IEJsdWV0b290aFJlbW90ZUdBVFRTZXJ2aWNlO1xuXG4gIHByaXZhdGUgaXNvbURhdGFBc09ic2VydmFibGUgPSBuZXcgU3ViamVjdDxzdHJpbmc+KCk7XG5cbiAgcHJpdmF0ZSBldmVyZ3JlZW5Nb2RlVGltZXI6IG51bWJlcjtcbiAgcHJpdmF0ZSBjaGFyYWN0ZXJpc3RpY3MgPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgZGV2aWNlU3RhdGUgPSBEZXZpY2VTdGF0ZS5kaXNjb25uZWN0ZWQ7XG5cbiAgcHVibGljIGdldERldmljZSgpOiBPYnNlcnZhYmxlPEJsdWV0b290aERldmljZT4ge1xuICAgIHJldHVybiB0aGlzLmRldmljZUFzT2JzZXJ2YWJsZS5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRJc29tZXRyaWNEYXRhKCk6IE9ic2VydmFibGU8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuaXNvbURhdGFBc09ic2VydmFibGUuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY29ubmVjdCgpOiBQcm9taXNlPHZvaWQ+IHtcblxuICAgIGlmICh3aW5kb3cubmF2aWdhdG9yICYmIHdpbmRvdy5uYXZpZ2F0b3IuYmx1ZXRvb3RoKSB7XG4gICAgICBsZXQgZGV2aWNlOiBCbHVldG9vdGhEZXZpY2U7XG5cbiAgICAgIGlmICghdGhpcy5kZXZpY2UpIHtcbiAgICAgICAgZGV2aWNlID0gYXdhaXQgbmF2aWdhdG9yLmJsdWV0b290aC5yZXF1ZXN0RGV2aWNlKHsgZmlsdGVyczogW3sgc2VydmljZXM6IFtEZXZpY2VVVUlELlNFUlZJQ0VdIH1dIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuc2VydmVyKSB7XG4gICAgICAgIHRoaXMuc2VydmVyID0gYXdhaXQgZGV2aWNlLmdhdHQuY29ubmVjdCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuc2VydmljZSkge1xuICAgICAgICB0aGlzLnNlcnZpY2UgPSBhd2FpdCB0aGlzLnNlcnZlci5nZXRQcmltYXJ5U2VydmljZShEZXZpY2VVVUlELlNFUlZJQ0UpO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCB0aGlzLmNhY2hlQ2hhcmFjdGVyaXN0aWMoRGV2aWNlVVVJRC5SRUFEKTtcbiAgICAgIGF3YWl0IHRoaXMuY2FjaGVDaGFyYWN0ZXJpc3RpYyhEZXZpY2VVVUlELldSSVRFKTtcblxuICAgICAgYXdhaXQgdGhpcy53cml0ZUNoYXJhY3RlcmlzdGljVmFsdWUodGhpcy5mb3JtYXRDb21tYW5kKERldmljZUNvbW1hbmRzLlRWR1RJTUUpKTtcblxuICAgICAgdGhpcy5kZXZpY2VBc09ic2VydmFibGUubmV4dChkZXZpY2UpO1xuICAgICAgdGhpcy5kZXZpY2UgPSBkZXZpY2U7XG4gICAgICB0aGlzLmRldmljZVN0YXRlID0gRGV2aWNlU3RhdGUuaGFuZHNoYWtlO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzdGFydElzb21ldHJpYygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLndyaXRlQ2hhcmFjdGVyaXN0aWNWYWx1ZSh0aGlzLmZvcm1hdENvbW1hbmQoRGV2aWNlQ29tbWFuZHMuSVNPTSkpO1xuICAgIHRoaXMuZGV2aWNlU3RhdGUgPSBEZXZpY2VTdGF0ZS5pc29tZXRyaWM7XG5cbiAgICBjb25zdCBjaGFyYWN0ZXJpc3RpYyA9IGF3YWl0IHRoaXMuc3RhcnROb3RpZmljYXRpb25zKCk7XG4gICAgdGhpcy5hdHRhY2hMaXN0ZW5lcihjaGFyYWN0ZXJpc3RpYyk7XG4gIH1cblxuICBwdWJsaWMgdGFyZSgpOiB2b2lkIHtcbiAgICB0aGlzLndyaXRlQ2hhcmFjdGVyaXN0aWNWYWx1ZSh0aGlzLmZvcm1hdENvbW1hbmQoRGV2aWNlQ29tbWFuZHMuVEFSRSkpO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIHN0b3AoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy53cml0ZUNoYXJhY3RlcmlzdGljVmFsdWUodGhpcy5mb3JtYXRDb21tYW5kKERldmljZUNvbW1hbmRzLlNUT1ApKTtcbiAgICB0aGlzLmRldmljZVN0YXRlID0gRGV2aWNlU3RhdGUuc3RvcDtcbiAgfVxuXG4gIHB1YmxpYyBldmVyZ3JlZW5Nb2RlKGlzRXZlcmdyZWVuTW9kZTogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmIChpc0V2ZXJncmVlbk1vZGUpIHtcbiAgICAgIHRoaXMuZXZlcmdyZWVuTW9kZVRpbWVyID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgc3dpdGNoICh0aGlzLmRldmljZVN0YXRlKSB7XG4gICAgICAgICAgY2FzZSBEZXZpY2VTdGF0ZS5zdG9wOiBjYXNlIERldmljZVN0YXRlLmhhbmRzaGFrZTpcbiAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9LCA2MDAwMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5ldmVyZ3JlZW5Nb2RlVGltZXIpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBkaXNjb25uZWN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZGV2aWNlLmdhdHQuZGlzY29ubmVjdCgpO1xuICAgIHRoaXMuZGV2aWNlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc2VydmVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc2VydmljZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmRldmljZUFzT2JzZXJ2YWJsZS5uZXh0KHVuZGVmaW5lZCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNhY2hlQ2hhcmFjdGVyaXN0aWMoY2hhcmFjdGVyaXN0aWNVdWlkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjaGFyYWN0ZXJpc3RpYyA9IGF3YWl0IHRoaXMuc2VydmljZS5nZXRDaGFyYWN0ZXJpc3RpYyhjaGFyYWN0ZXJpc3RpY1V1aWQpO1xuICAgIHRoaXMuY2hhcmFjdGVyaXN0aWNzLnNldChjaGFyYWN0ZXJpc3RpY1V1aWQsIGNoYXJhY3RlcmlzdGljKTtcbiAgfVxuXG4gIHByaXZhdGUgd3JpdGVDaGFyYWN0ZXJpc3RpY1ZhbHVlKHZhbHVlOiBEYXRhVmlldyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNoYXJhY3RlcmlzdGljID0gdGhpcy5jaGFyYWN0ZXJpc3RpY3MuZ2V0KERldmljZVVVSUQuV1JJVEUpO1xuICAgIHJldHVybiBjaGFyYWN0ZXJpc3RpYy53cml0ZVZhbHVlKHZhbHVlKTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhcnROb3RpZmljYXRpb25zKCk6IFByb21pc2U8Qmx1ZXRvb3RoUmVtb3RlR0FUVENoYXJhY3RlcmlzdGljPiB7XG4gICAgY29uc3QgY2hhcmFjdGVyaXN0aWMgPSB0aGlzLmNoYXJhY3RlcmlzdGljcy5nZXQoRGV2aWNlVVVJRC5SRUFEKTtcbiAgICByZXR1cm4gY2hhcmFjdGVyaXN0aWMuc3RhcnROb3RpZmljYXRpb25zKCk7XG4gIH1cblxuICBwcml2YXRlIGF0dGFjaExpc3RlbmVyKGNoYXJhY3RlcmlzdGljOiBCbHVldG9vdGhSZW1vdGVHQVRUQ2hhcmFjdGVyaXN0aWMpOiB2b2lkIHtcbiAgICBjaGFyYWN0ZXJpc3RpYy5hZGRFdmVudExpc3RlbmVyKCdjaGFyYWN0ZXJpc3RpY3ZhbHVlY2hhbmdlZCcsIGV2ZW50ID0+IHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldCBhcyBCbHVldG9vdGhSZW1vdGVHQVRUQ2hhcmFjdGVyaXN0aWM7XG4gICAgICB0aGlzLnBhcnNlRGF0YSh0YXJnZXQudmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZURhdGEoZGF0YTogRGF0YVZpZXcpOiB2b2lkIHtcbiAgICBjb25zdCBkZXZpY2VEYXRhQXNTdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIG5ldyBVaW50OEFycmF5KGRhdGEuYnVmZmVyKSk7XG4gICAgY29uc3QgaXNvbURhdGEgPSBkZXZpY2VEYXRhQXNTdHJpbmcubWF0Y2goL0lTKC4qKVxcL0lTLylbMV07XG5cbiAgICB0aGlzLmlzb21EYXRhQXNPYnNlcnZhYmxlLm5leHQoaXNvbURhdGEpO1xuICB9XG5cbiAgcHJpdmF0ZSBmb3JtYXRDb21tYW5kKHR5cGU6IHN0cmluZyk6IERhdGFWaWV3IHtcbiAgICBjb25zdCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIodHlwZS5sZW5ndGggKyAyKTtcbiAgICBjb25zdCBkYXRhVmlldyA9IG5ldyBEYXRhVmlldyhidWZmZXIsIDApO1xuXG4gICAgZGF0YVZpZXcuc2V0VWludDgoMCwgNjUpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0eXBlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRhdGFWaWV3LnNldFVpbnQ4KGkgKyAxLCB0eXBlLmNoYXJDb2RlQXQoaSkpO1xuICAgIH1cblxuICAgIGRhdGFWaWV3LnNldFVpbnQ4KHR5cGUubGVuZ3RoICsgMSwgMjUpO1xuXG4gICAgcmV0dXJuIGRhdGFWaWV3O1xuICB9XG5cbn1cbiJdfQ==