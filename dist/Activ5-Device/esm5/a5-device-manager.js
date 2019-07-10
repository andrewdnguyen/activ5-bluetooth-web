/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
/// <reference path="index.d.ts" />
/// <reference path="index.d.ts" />
import { Subject } from 'rxjs';
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
    }
    /**
     * @return {?}
     */
    A5DeviceManager.prototype.connect = /**
     * @return {?}
     */
    function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var device, server, service;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(window.navigator && window.navigator.bluetooth)) return [3 /*break*/, 4];
                        return [4 /*yield*/, navigator.bluetooth.requestDevice({ filters: [{ services: [DeviceUUID.SERVICE] }] })];
                    case 1:
                        device = _a.sent();
                        return [4 /*yield*/, device.gatt.connect()];
                    case 2:
                        server = _a.sent();
                        return [4 /*yield*/, server.getPrimaryService(DeviceUUID.SERVICE)];
                    case 3:
                        service = _a.sent();
                        return [2 /*return*/, new A5Device(device, server, service)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return A5DeviceManager;
}());
export { A5DeviceManager };
var A5Device = /** @class */ (function () {
    function A5Device(device, server, service) {
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
    A5Device.prototype.getIsometricData = /**
     * @return {?}
     */
    function () {
        return this.isomDataAsObservable.asObservable();
    };
    /**
     * @return {?}
     */
    A5Device.prototype.onDisconnect = /**
     * @return {?}
     */
    function () {
        return this.disconnectEventAsObservable.asObservable();
    };
    /**
     * @return {?}
     */
    A5Device.prototype.startIsometric = /**
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
    A5Device.prototype.tare = /**
     * @return {?}
     */
    function () {
        this.writeCharacteristicValue(this.formatCommand(DeviceCommands.TARE));
    };
    /**
     * @return {?}
     */
    A5Device.prototype.stop = /**
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
    A5Device.prototype.evergreenMode = /**
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
    A5Device.prototype.disconnect = /**
     * @return {?}
     */
    function () {
        this.device.gatt.disconnect();
    };
    /**
     * @private
     * @return {?}
     */
    A5Device.prototype.init = /**
     * @private
     * @return {?}
     */
    function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cacheCharacteristic(DeviceUUID.READ)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.cacheCharacteristic(DeviceUUID.WRITE)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.writeCharacteristicValue(this.formatCommand(DeviceCommands.TVGTIME))];
                    case 3:
                        _a.sent();
                        this.deviceState = DeviceState.handshake;
                        this.attachDisconnectListener();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @private
     * @return {?}
     */
    A5Device.prototype.attachDisconnectListener = /**
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
    A5Device.prototype.cacheCharacteristic = /**
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
    A5Device.prototype.writeCharacteristicValue = /**
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
    A5Device.prototype.startNotifications = /**
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
    A5Device.prototype.attachIsometricListener = /**
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
    A5Device.prototype.parseData = /**
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
    A5Device.prototype.formatCommand = /**
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
    return A5Device;
}());
export { A5Device };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYTUtZGV2aWNlLW1hbmFnZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hY3RpdjUtZGV2aWNlLyIsInNvdXJjZXMiOlsiYTUtZGV2aWNlLW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxtQ0FBbUM7O0FBRW5DLE9BQU8sRUFBYyxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7OztJQUd6QyxTQUFVLHNDQUFzQztJQUNoRCxNQUFPLHNDQUFzQztJQUM3QyxPQUFRLHNDQUFzQzs7OztJQUk5QyxTQUFVLFNBQVM7SUFDbkIsTUFBTyxPQUFPO0lBQ2QsTUFBTyxPQUFPO0lBQ2QsTUFBTyxPQUFPOzs7O0lBSWQsV0FBWSxXQUFXO0lBQ3ZCLFdBQVksV0FBVztJQUN2QixNQUFPLE1BQU07SUFDYixjQUFlLGNBQWM7O0FBRy9CO0lBQUE7SUFZQSxDQUFDOzs7O0lBVmMsaUNBQU87OztJQUFwQjs7Ozs7OzZCQUNNLENBQUEsTUFBTSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQSxFQUE5Qyx3QkFBOEM7d0JBQ2pDLHFCQUFNLFNBQVMsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQTs7d0JBQW5HLE1BQU0sR0FBRyxTQUEwRjt3QkFDMUYscUJBQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBQTs7d0JBQXBDLE1BQU0sR0FBRyxTQUEyQjt3QkFDMUIscUJBQU0sTUFBTSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBQTs7d0JBQTVELE9BQU8sR0FBRyxTQUFrRDt3QkFFbEUsc0JBQU8sSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsRUFBQzs7Ozs7S0FFaEQ7SUFFSCxzQkFBQztBQUFE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QUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2hEO1FBRUQsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV2QyxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRUgsZUFBQztBQUFELENBQUMsQUFuSUQsSUFtSUM7Ozs7Ozs7SUF6SEMsMEJBQWdDOzs7OztJQUNoQywwQkFBMEM7Ozs7O0lBQzFDLDJCQUE0Qzs7Ozs7SUFFNUMsK0NBQTJEOzs7OztJQUMzRCx3Q0FBcUQ7Ozs7O0lBRXJELHNDQUFtQzs7Ozs7SUFDbkMsbUNBQW9DOzs7OztJQUNwQywrQkFBK0MiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiaW5kZXguZC50c1wiIC8+XG5cbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuZW51bSBEZXZpY2VVVUlEIHtcbiAgU0VSVklDRSA9ICcwMDAwNTAwMC0wMDAwLTEwMDAtODAwMC0wMDgwNWY5YjM0ZmInLFxuICBSRUFEID0gJzAwMDA1YTAxLTAwMDAtMTAwMC04MDAwLTAwODA1ZjliMzRmYicsXG4gIFdSSVRFID0gJzAwMDA1YTAyLTAwMDAtMTAwMC04MDAwLTAwODA1ZjliMzRmYidcbn1cblxuZW51bSBEZXZpY2VDb21tYW5kcyB7XG4gIFRWR1RJTUUgPSAnVFZHVElNRScsXG4gIElTT00gPSAnSVNPTSEnLFxuICBUQVJFID0gJ1RBUkUhJyxcbiAgU1RPUCA9ICdTVE9QISdcbn1cblxuZW51bSBEZXZpY2VTdGF0ZSB7XG4gIGhhbmRzaGFrZSA9ICdoYW5kc2hha2UnLFxuICBpc29tZXRyaWMgPSAnaXNvbWV0cmljJyxcbiAgc3RvcCA9ICdzdG9wJyxcbiAgZGlzY29ubmVjdGVkID0gJ2Rpc2Nvbm5lY3RlZCdcbn1cblxuZXhwb3J0IGNsYXNzIEE1RGV2aWNlTWFuYWdlciB7XG5cbiAgcHVibGljIGFzeW5jIGNvbm5lY3QoKTogUHJvbWlzZTxBNURldmljZT4ge1xuICAgIGlmICh3aW5kb3cubmF2aWdhdG9yICYmIHdpbmRvdy5uYXZpZ2F0b3IuYmx1ZXRvb3RoKSB7XG4gICAgICBjb25zdCBkZXZpY2UgPSBhd2FpdCBuYXZpZ2F0b3IuYmx1ZXRvb3RoLnJlcXVlc3REZXZpY2UoeyBmaWx0ZXJzOiBbeyBzZXJ2aWNlczogW0RldmljZVVVSUQuU0VSVklDRV0gfV0gfSk7XG4gICAgICBjb25zdCBzZXJ2ZXIgPSBhd2FpdCBkZXZpY2UuZ2F0dC5jb25uZWN0KCk7XG4gICAgICBjb25zdCBzZXJ2aWNlID0gYXdhaXQgc2VydmVyLmdldFByaW1hcnlTZXJ2aWNlKERldmljZVVVSUQuU0VSVklDRSk7XG5cbiAgICAgIHJldHVybiBuZXcgQTVEZXZpY2UoZGV2aWNlLCBzZXJ2ZXIsIHNlcnZpY2UpO1xuICAgIH1cbiAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBBNURldmljZSB7XG5cbiAgY29uc3RydWN0b3IoZGV2aWNlOiBCbHVldG9vdGhEZXZpY2UsIHNlcnZlcjogQmx1ZXRvb3RoUmVtb3RlR0FUVFNlcnZlciwgc2VydmljZTogQmx1ZXRvb3RoUmVtb3RlR0FUVFNlcnZpY2UpIHtcbiAgICB0aGlzLmRldmljZSA9IGRldmljZTtcbiAgICB0aGlzLnNlcnZlciA9IHNlcnZlcjtcbiAgICB0aGlzLnNlcnZpY2UgPSBzZXJ2aWNlO1xuXG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICBwcml2YXRlIGRldmljZTogQmx1ZXRvb3RoRGV2aWNlO1xuICBwcml2YXRlIHNlcnZlcjogQmx1ZXRvb3RoUmVtb3RlR0FUVFNlcnZlcjtcbiAgcHJpdmF0ZSBzZXJ2aWNlOiBCbHVldG9vdGhSZW1vdGVHQVRUU2VydmljZTtcblxuICBwcml2YXRlIGRpc2Nvbm5lY3RFdmVudEFzT2JzZXJ2YWJsZSA9IG5ldyBTdWJqZWN0PEV2ZW50PigpO1xuICBwcml2YXRlIGlzb21EYXRhQXNPYnNlcnZhYmxlID0gbmV3IFN1YmplY3Q8c3RyaW5nPigpO1xuXG4gIHByaXZhdGUgZXZlcmdyZWVuTW9kZVRpbWVyOiBudW1iZXI7XG4gIHByaXZhdGUgY2hhcmFjdGVyaXN0aWNzID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIGRldmljZVN0YXRlID0gRGV2aWNlU3RhdGUuZGlzY29ubmVjdGVkO1xuXG4gIHB1YmxpYyBnZXRJc29tZXRyaWNEYXRhKCk6IE9ic2VydmFibGU8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuaXNvbURhdGFBc09ic2VydmFibGUuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBwdWJsaWMgb25EaXNjb25uZWN0KCk6IE9ic2VydmFibGU8RXZlbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5kaXNjb25uZWN0RXZlbnRBc09ic2VydmFibGUuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc3RhcnRJc29tZXRyaWMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy53cml0ZUNoYXJhY3RlcmlzdGljVmFsdWUodGhpcy5mb3JtYXRDb21tYW5kKERldmljZUNvbW1hbmRzLklTT00pKTtcbiAgICB0aGlzLmRldmljZVN0YXRlID0gRGV2aWNlU3RhdGUuaXNvbWV0cmljO1xuXG4gICAgY29uc3QgY2hhcmFjdGVyaXN0aWMgPSBhd2FpdCB0aGlzLnN0YXJ0Tm90aWZpY2F0aW9ucygpO1xuICAgIHRoaXMuYXR0YWNoSXNvbWV0cmljTGlzdGVuZXIoY2hhcmFjdGVyaXN0aWMpO1xuICB9XG5cbiAgcHVibGljIHRhcmUoKTogdm9pZCB7XG4gICAgdGhpcy53cml0ZUNoYXJhY3RlcmlzdGljVmFsdWUodGhpcy5mb3JtYXRDb21tYW5kKERldmljZUNvbW1hbmRzLlRBUkUpKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzdG9wKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMud3JpdGVDaGFyYWN0ZXJpc3RpY1ZhbHVlKHRoaXMuZm9ybWF0Q29tbWFuZChEZXZpY2VDb21tYW5kcy5TVE9QKSk7XG4gICAgdGhpcy5kZXZpY2VTdGF0ZSA9IERldmljZVN0YXRlLnN0b3A7XG4gIH1cblxuICBwdWJsaWMgZXZlcmdyZWVuTW9kZShpc0V2ZXJncmVlbk1vZGU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoaXNFdmVyZ3JlZW5Nb2RlKSB7XG4gICAgICB0aGlzLmV2ZXJncmVlbk1vZGVUaW1lciA9IHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5kZXZpY2VTdGF0ZSkge1xuICAgICAgICAgIGNhc2UgRGV2aWNlU3RhdGUuc3RvcDogY2FzZSBEZXZpY2VTdGF0ZS5oYW5kc2hha2U6XG4gICAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSwgNjAwMDApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbGVhckludGVydmFsKHRoaXMuZXZlcmdyZWVuTW9kZVRpbWVyKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZGlzY29ubmVjdCgpOiB2b2lkIHtcbiAgICB0aGlzLmRldmljZS5nYXR0LmRpc2Nvbm5lY3QoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmNhY2hlQ2hhcmFjdGVyaXN0aWMoRGV2aWNlVVVJRC5SRUFEKTtcbiAgICBhd2FpdCB0aGlzLmNhY2hlQ2hhcmFjdGVyaXN0aWMoRGV2aWNlVVVJRC5XUklURSk7XG5cbiAgICBhd2FpdCB0aGlzLndyaXRlQ2hhcmFjdGVyaXN0aWNWYWx1ZSh0aGlzLmZvcm1hdENvbW1hbmQoRGV2aWNlQ29tbWFuZHMuVFZHVElNRSkpO1xuXG5cbiAgICB0aGlzLmRldmljZVN0YXRlID0gRGV2aWNlU3RhdGUuaGFuZHNoYWtlO1xuICAgIHRoaXMuYXR0YWNoRGlzY29ubmVjdExpc3RlbmVyKCk7XG4gIH1cblxuICBwcml2YXRlIGF0dGFjaERpc2Nvbm5lY3RMaXN0ZW5lcigpOiB2b2lkIHtcbiAgICB0aGlzLmRldmljZS5hZGRFdmVudExpc3RlbmVyKCdnYXR0c2VydmVyZGlzY29ubmVjdGVkJywgKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgdGhpcy5kaXNjb25uZWN0RXZlbnRBc09ic2VydmFibGUubmV4dChldmVudCk7XG4gICAgICB0aGlzLmRldmljZVN0YXRlID0gRGV2aWNlU3RhdGUuZGlzY29ubmVjdGVkO1xuICAgICAgdGhpcy5kZXZpY2UgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnNlcnZlciA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuc2VydmljZSA9IHVuZGVmaW5lZDtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY2FjaGVDaGFyYWN0ZXJpc3RpYyhjaGFyYWN0ZXJpc3RpY1V1aWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNoYXJhY3RlcmlzdGljID0gYXdhaXQgdGhpcy5zZXJ2aWNlLmdldENoYXJhY3RlcmlzdGljKGNoYXJhY3RlcmlzdGljVXVpZCk7XG4gICAgdGhpcy5jaGFyYWN0ZXJpc3RpY3Muc2V0KGNoYXJhY3RlcmlzdGljVXVpZCwgY2hhcmFjdGVyaXN0aWMpO1xuICB9XG5cbiAgcHJpdmF0ZSB3cml0ZUNoYXJhY3RlcmlzdGljVmFsdWUodmFsdWU6IERhdGFWaWV3KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY2hhcmFjdGVyaXN0aWMgPSB0aGlzLmNoYXJhY3RlcmlzdGljcy5nZXQoRGV2aWNlVVVJRC5XUklURSk7XG4gICAgcmV0dXJuIGNoYXJhY3RlcmlzdGljLndyaXRlVmFsdWUodmFsdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGFydE5vdGlmaWNhdGlvbnMoKTogUHJvbWlzZTxCbHVldG9vdGhSZW1vdGVHQVRUQ2hhcmFjdGVyaXN0aWM+IHtcbiAgICBjb25zdCBjaGFyYWN0ZXJpc3RpYyA9IHRoaXMuY2hhcmFjdGVyaXN0aWNzLmdldChEZXZpY2VVVUlELlJFQUQpO1xuICAgIHJldHVybiBjaGFyYWN0ZXJpc3RpYy5zdGFydE5vdGlmaWNhdGlvbnMoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXR0YWNoSXNvbWV0cmljTGlzdGVuZXIoY2hhcmFjdGVyaXN0aWM6IEJsdWV0b290aFJlbW90ZUdBVFRDaGFyYWN0ZXJpc3RpYyk6IHZvaWQge1xuICAgIGNoYXJhY3RlcmlzdGljLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYXJhY3RlcmlzdGljdmFsdWVjaGFuZ2VkJywgZXZlbnQgPT4ge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGFzIEJsdWV0b290aFJlbW90ZUdBVFRDaGFyYWN0ZXJpc3RpYztcbiAgICAgIHRoaXMucGFyc2VEYXRhKHRhcmdldC52YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHBhcnNlRGF0YShkYXRhOiBEYXRhVmlldyk6IHZvaWQge1xuICAgIGNvbnN0IGRldmljZURhdGFBc1N0cmluZyA9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIpKTtcbiAgICBjb25zdCBpc29tRGF0YSA9IGRldmljZURhdGFBc1N0cmluZy5tYXRjaCgvSVMoLiopXFwvSVMvKVsxXTtcblxuICAgIHRoaXMuaXNvbURhdGFBc09ic2VydmFibGUubmV4dChpc29tRGF0YSk7XG4gIH1cblxuICBwcml2YXRlIGZvcm1hdENvbW1hbmQodHlwZTogc3RyaW5nKTogRGF0YVZpZXcge1xuICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcih0eXBlLmxlbmd0aCArIDIpO1xuICAgIGNvbnN0IGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlciwgMCk7XG5cbiAgICBkYXRhVmlldy5zZXRVaW50OCgwLCA2NSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHR5cGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGF0YVZpZXcuc2V0VWludDgoaSArIDEsIHR5cGUuY2hhckNvZGVBdChpKSk7XG4gICAgfVxuXG4gICAgZGF0YVZpZXcuc2V0VWludDgodHlwZS5sZW5ndGggKyAxLCAyNSk7XG5cbiAgICByZXR1cm4gZGF0YVZpZXc7XG4gIH1cblxufVxuXG5cbi8vIGV4cG9ydCBjbGFzcyBBNURldmljZU1hbmFnZXIge1xuXG4vLyAgIHByaXZhdGUgZGV2aWNlczogQmx1ZXRvb3RoRGV2aWNlW10gPSBbXTtcbi8vICAgcHJpdmF0ZSBzZXJ2ZXJzOiBCbHVldG9vdGhSZW1vdGVHQVRUU2VydmVyW10gPSBbXTtcbi8vICAgcHJpdmF0ZSBzZXJ2aWNlczogQmx1ZXRvb3RoUmVtb3RlR0FUVFNlcnZpY2VbXSA9IFtdO1xuXG4vLyAgIHByaXZhdGUgY2hhcmFjdGVyaXN0aWNzID0gWyBuZXcgTWFwKCksIG5ldyBNYXAoKSBdO1xuLy8gICBwcml2YXRlIGRldmljZXNTdGF0ZXMgPSBbIERldmljZVN0YXRlLmRpc2Nvbm5lY3RlZCwgRGV2aWNlU3RhdGUuZGlzY29ubmVjdGVkIF07XG4vLyAgIHByaXZhdGUgZGV2aWNlTnVtYmVyID0gMDtcblxuLy8gICBwcml2YXRlIGV2ZXJncmVlbk1vZGVUaW1lcnM6IG51bWJlcltdID0gW107XG5cbi8vICAgcHJpdmF0ZSBkaXNjb25uZWN0RXZlbnRzQXNPYnNlcnZhYmxlID0gbmV3IFN1YmplY3Q8RXZlbnRbXT4oKTtcbi8vICAgcHJpdmF0ZSBpc29tRGF0YXNBc09ic2VydmFibGUgPSBuZXcgU3ViamVjdDxzdHJpbmdbXT4oKTtcblxuXG4vLyAgIHB1YmxpYyBnZXRJc29tZXRyaWNEYXRhKCk6IE9ic2VydmFibGU8c3RyaW5nPiB7XG4vLyAgICAgcmV0dXJuIHRoaXMuaXNvbURhdGFBc09ic2VydmFibGUuYXNPYnNlcnZhYmxlKCk7XG4vLyAgIH1cblxuLy8gICBwdWJsaWMgb25EaXNjb25uZWN0KCk6IE9ic2VydmFibGU8RXZlbnQ+IHtcbi8vICAgICByZXR1cm4gdGhpcy5kaXNjb25uZWN0RXZlbnRBc09ic2VydmFibGUuYXNPYnNlcnZhYmxlKCk7XG4vLyAgIH1cblxuLy8gICBwdWJsaWMgYXN5bmMgY29ubmVjdCgpOiBQcm9taXNlPEJsdWV0b290aERldmljZVtdPiB7XG5cbi8vICAgICBpZiAod2luZG93Lm5hdmlnYXRvciAmJiB3aW5kb3cubmF2aWdhdG9yLmJsdWV0b290aCkge1xuLy8gICAgICAgdGhpcy5kZXZpY2VOdW1iZXIgPSB0aGlzLmRldmljZXNbMF0gPyAxIDogMDtcbiAgICAgIFxuLy8gICAgICAgbGV0IGRldmljZSA9IHRoaXMuZGV2aWNlc1t0aGlzLmRldmljZU51bWJlcl07XG4vLyAgICAgICBsZXQgc2VydmVyID0gdGhpcy5zZXJ2ZXJzW3RoaXMuZGV2aWNlTnVtYmVyXTtcbi8vICAgICAgIGxldCBzZXJ2aWNlID0gdGhpcy5zZXJ2aWNlc1t0aGlzLmRldmljZU51bWJlcl07XG4vLyAgICAgICBsZXQgZGV2aWNlU3RhdGUgPSB0aGlzLmRldmljZXNTdGF0ZXNbdGhpcy5kZXZpY2VOdW1iZXJdO1xuXG4vLyAgICAgICBkZXZpY2UgPSBhd2FpdCBuYXZpZ2F0b3IuYmx1ZXRvb3RoLnJlcXVlc3REZXZpY2UoeyBmaWx0ZXJzOiBbeyBzZXJ2aWNlczogW0RldmljZVVVSUQuU0VSVklDRV0gfV0gfSk7XG4vLyAgICAgICBzZXJ2ZXIgPSBhd2FpdCBkZXZpY2UuZ2F0dC5jb25uZWN0KCk7XG4vLyAgICAgICBzZXJ2aWNlID0gYXdhaXQgc2VydmVyLmdldFByaW1hcnlTZXJ2aWNlKERldmljZVVVSUQuU0VSVklDRSk7XG5cbi8vICAgICAgIGF3YWl0IHRoaXMuY2FjaGVDaGFyYWN0ZXJpc3RpYyhEZXZpY2VVVUlELlJFQUQpO1xuLy8gICAgICAgYXdhaXQgdGhpcy5jYWNoZUNoYXJhY3RlcmlzdGljKERldmljZVVVSUQuV1JJVEUpO1xuXG4vLyAgICAgICBhd2FpdCB0aGlzLndyaXRlQ2hhcmFjdGVyaXN0aWNWYWx1ZSh0aGlzLmZvcm1hdENvbW1hbmQoRGV2aWNlQ29tbWFuZHMuVFZHVElNRSkpO1xuXG5cbi8vICAgICAgIGRldmljZVN0YXRlID0gRGV2aWNlU3RhdGUuaGFuZHNoYWtlO1xuLy8gICAgICAgLy90aGlzLmF0dGFjaERpc2Nvbm5lY3RMaXN0ZW5lcigpO1xuXG4vLyAgICAgICByZXR1cm4gdGhpcy5kZXZpY2VzO1xuLy8gICAgIH1cbi8vICAgfVxuXG4vLyAgIHB1YmxpYyBhc3luYyBzdGFydElzb21ldHJpYygpOiBQcm9taXNlPHZvaWQ+IHtcbi8vICAgICBhd2FpdCB0aGlzLndyaXRlQ2hhcmFjdGVyaXN0aWNWYWx1ZSh0aGlzLmZvcm1hdENvbW1hbmQoRGV2aWNlQ29tbWFuZHMuSVNPTSkpO1xuLy8gICAgIHRoaXMuZGV2aWNlU3RhdGUgPSBEZXZpY2VTdGF0ZS5pc29tZXRyaWM7XG5cbi8vICAgICBjb25zdCBjaGFyYWN0ZXJpc3RpYyA9IGF3YWl0IHRoaXMuc3RhcnROb3RpZmljYXRpb25zKCk7XG4vLyAgICAgdGhpcy5hdHRhY2hJc29tZXRyaWNMaXN0ZW5lcihjaGFyYWN0ZXJpc3RpYyk7XG4vLyAgIH1cblxuLy8gICBwdWJsaWMgdGFyZSgpOiB2b2lkIHtcbi8vICAgICB0aGlzLndyaXRlQ2hhcmFjdGVyaXN0aWNWYWx1ZSh0aGlzLmZvcm1hdENvbW1hbmQoRGV2aWNlQ29tbWFuZHMuVEFSRSkpO1xuLy8gICB9XG5cbi8vICAgcHVibGljIGFzeW5jIHN0b3AoKTogUHJvbWlzZTx2b2lkPiB7XG4vLyAgICAgYXdhaXQgdGhpcy53cml0ZUNoYXJhY3RlcmlzdGljVmFsdWUodGhpcy5mb3JtYXRDb21tYW5kKERldmljZUNvbW1hbmRzLlNUT1ApKTtcbi8vICAgICB0aGlzLmRldmljZVN0YXRlID0gRGV2aWNlU3RhdGUuc3RvcDtcbi8vICAgfVxuXG4vLyAgIHB1YmxpYyBldmVyZ3JlZW5Nb2RlKGlzRXZlcmdyZWVuTW9kZTogYm9vbGVhbik6IHZvaWQge1xuLy8gICAgIGlmIChpc0V2ZXJncmVlbk1vZGUpIHtcbi8vICAgICAgIHRoaXMuZXZlcmdyZWVuTW9kZVRpbWVyID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHtcbi8vICAgICAgICAgc3dpdGNoICh0aGlzLmRldmljZVN0YXRlKSB7XG4vLyAgICAgICAgICAgY2FzZSBEZXZpY2VTdGF0ZS5zdG9wOiBjYXNlIERldmljZVN0YXRlLmhhbmRzaGFrZTpcbi8vICAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuLy8gICAgICAgICAgICAgYnJlYWs7XG4vLyAgICAgICAgICAgZGVmYXVsdDpcbi8vICAgICAgICAgICAgIGJyZWFrO1xuLy8gICAgICAgICB9XG4vLyAgICAgICB9LCA2MDAwMCk7XG4vLyAgICAgfSBlbHNlIHtcbi8vICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5ldmVyZ3JlZW5Nb2RlVGltZXIpO1xuLy8gICAgIH1cbi8vICAgfVxuXG4vLyAgIHB1YmxpYyBkaXNjb25uZWN0KCk6IHZvaWQge1xuLy8gICAgIHRoaXMuZGV2aWNlLmdhdHQuZGlzY29ubmVjdCgpO1xuLy8gICB9XG5cbi8vICAgcHJpdmF0ZSBhdHRhY2hEaXNjb25uZWN0TGlzdGVuZXIoKTogdm9pZCB7XG4vLyAgICAgdGhpcy5kZXZpY2UuYWRkRXZlbnRMaXN0ZW5lcignZ2F0dHNlcnZlcmRpc2Nvbm5lY3RlZCcsIChldmVudDogRXZlbnQpID0+IHtcbi8vICAgICAgIHRoaXMuZGlzY29ubmVjdEV2ZW50QXNPYnNlcnZhYmxlLm5leHQoZXZlbnQpO1xuLy8gICAgICAgdGhpcy5kZXZpY2VTdGF0ZSA9IERldmljZVN0YXRlLmRpc2Nvbm5lY3RlZDtcbi8vICAgICAgIHRoaXMuZGV2aWNlID0gdW5kZWZpbmVkO1xuLy8gICAgICAgdGhpcy5zZXJ2ZXIgPSB1bmRlZmluZWQ7XG4vLyAgICAgICB0aGlzLnNlcnZpY2UgPSB1bmRlZmluZWQ7XG4vLyAgICAgfSk7XG4vLyAgIH1cblxuLy8gICBwcml2YXRlIGFzeW5jIGNhY2hlQ2hhcmFjdGVyaXN0aWMoY2hhcmFjdGVyaXN0aWNVdWlkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbi8vICAgICBjb25zdCBzZXJ2aWNlID0gdGhpcy5zZXJ2aWNlc1t0aGlzLmRldmljZU51bWJlcl07XG4vLyAgICAgY29uc3QgY2hhcmFjdGVyaXN0aWNzID0gdGhpcy5jaGFyYWN0ZXJpc3RpY3NbdGhpcy5kZXZpY2VOdW1iZXJdO1xuLy8gICAgIGNvbnN0IGNoYXJhY3RlcmlzdGljID0gYXdhaXQgc2VydmljZS5nZXRDaGFyYWN0ZXJpc3RpYyhjaGFyYWN0ZXJpc3RpY1V1aWQpO1xuLy8gICAgIGNoYXJhY3RlcmlzdGljcy5zZXQoY2hhcmFjdGVyaXN0aWNVdWlkLCBjaGFyYWN0ZXJpc3RpYyk7XG4vLyAgIH1cblxuLy8gICBwcml2YXRlIHdyaXRlQ2hhcmFjdGVyaXN0aWNWYWx1ZSh2YWx1ZTogRGF0YVZpZXcpOiBQcm9taXNlPHZvaWQ+IHtcbi8vICAgICBjb25zdCBjaGFyYWN0ZXJpc3RpY3MgPSB0aGlzLmNoYXJhY3RlcmlzdGljc1t0aGlzLmRldmljZU51bWJlcl07XG4vLyAgICAgcmV0dXJuIGNoYXJhY3RlcmlzdGljcy5nZXQoRGV2aWNlVVVJRC5XUklURSkud3JpdGVWYWx1ZSh2YWx1ZSk7XG4vLyAgIH1cblxuLy8gICBwcml2YXRlIHN0YXJ0Tm90aWZpY2F0aW9ucygpOiBQcm9taXNlPEJsdWV0b290aFJlbW90ZUdBVFRDaGFyYWN0ZXJpc3RpYz4ge1xuLy8gICAgIGNvbnN0IGNoYXJhY3RlcmlzdGljID0gdGhpcy5jaGFyYWN0ZXJpc3RpY3NbdGhpcy5kZXZpY2VOdW1iZXJdLmdldChEZXZpY2VVVUlELlJFQUQpO1xuLy8gICAgIHJldHVybiBjaGFyYWN0ZXJpc3RpYy5zdGFydE5vdGlmaWNhdGlvbnMoKTtcbi8vICAgfVxuXG4vLyAgIHByaXZhdGUgYXR0YWNoSXNvbWV0cmljTGlzdGVuZXIoY2hhcmFjdGVyaXN0aWM6IEJsdWV0b290aFJlbW90ZUdBVFRDaGFyYWN0ZXJpc3RpYyk6IHZvaWQge1xuLy8gICAgIGNoYXJhY3RlcmlzdGljLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYXJhY3RlcmlzdGljdmFsdWVjaGFuZ2VkJywgZXZlbnQgPT4ge1xuLy8gICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGFzIEJsdWV0b290aFJlbW90ZUdBVFRDaGFyYWN0ZXJpc3RpYztcbi8vICAgICAgIHRoaXMucGFyc2VEYXRhKHRhcmdldC52YWx1ZSk7XG4vLyAgICAgfSk7XG4vLyAgIH1cblxuLy8gICBwcml2YXRlIHBhcnNlRGF0YShkYXRhOiBEYXRhVmlldyk6IHZvaWQge1xuLy8gICAgIGNvbnN0IGRldmljZURhdGFBc1N0cmluZyA9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIpKTtcbi8vICAgICBjb25zdCBpc29tRGF0YSA9IGRldmljZURhdGFBc1N0cmluZy5tYXRjaCgvSVMoLiopXFwvSVMvKVsxXTtcblxuLy8gICAgIHRoaXMuaXNvbURhdGFzQXNPYnNlcnZhYmxlLm5leHQoaXNvbURhdGEpO1xuLy8gICB9XG5cbi8vICAgcHJpdmF0ZSBmb3JtYXRDb21tYW5kKHR5cGU6IHN0cmluZyk6IERhdGFWaWV3IHtcbi8vICAgICBjb25zdCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIodHlwZS5sZW5ndGggKyAyKTtcbi8vICAgICBjb25zdCBkYXRhVmlldyA9IG5ldyBEYXRhVmlldyhidWZmZXIsIDApO1xuXG4vLyAgICAgZGF0YVZpZXcuc2V0VWludDgoMCwgNjUpO1xuXG4vLyAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0eXBlLmxlbmd0aDsgaSsrKSB7XG4vLyAgICAgICAgIGRhdGFWaWV3LnNldFVpbnQ4KGkgKyAxLCB0eXBlLmNoYXJDb2RlQXQoaSkpO1xuLy8gICAgIH1cblxuLy8gICAgIGRhdGFWaWV3LnNldFVpbnQ4KHR5cGUubGVuZ3RoICsgMSwgMjUpO1xuXG4vLyAgICAgcmV0dXJuIGRhdGFWaWV3O1xuLy8gICB9XG4iXX0=