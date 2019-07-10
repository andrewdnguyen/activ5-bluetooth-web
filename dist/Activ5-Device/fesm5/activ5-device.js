import { __awaiter, __generator } from 'tslib';
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
    }
    /**
     * @return {?}
     */
    A5DeviceManager.prototype.connect = /**
     * @return {?}
     */
    function () {
        return __awaiter(this, void 0, void 0, function () {
            var device, server, service;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

export { A5DeviceManager, A5Device };

//# sourceMappingURL=activ5-device.js.map