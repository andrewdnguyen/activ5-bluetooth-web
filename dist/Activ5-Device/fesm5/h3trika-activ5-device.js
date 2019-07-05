import { __awaiter, __generator } from 'tslib';
import { Injectable, defineInjectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
        return __awaiter(this, void 0, void 0, function () {
            var device, _a, _b;
            return __generator(this, function (_c) {
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
        return __awaiter(this, void 0, void 0, function () {
            var characteristic;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var characteristic;
            return __generator(this, function (_a) {
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
    /** @nocollapse */ A5DeviceManager.ngInjectableDef = defineInjectable({ factory: function A5DeviceManager_Factory() { return new A5DeviceManager(); }, token: A5DeviceManager, providedIn: "root" });
    return A5DeviceManager;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

export { A5DeviceManager };

//# sourceMappingURL=h3trika-activ5-device.js.map