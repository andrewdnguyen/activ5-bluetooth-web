(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs')) :
    typeof define === 'function' && define.amd ? define('activ5-device', ['exports', 'rxjs'], factory) :
    (factory((global['activ5-device'] = {}),global.rxjs));
}(this, (function (exports,rxjs) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

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
                                if (!(window.navigator && window.navigator.bluetooth))
                                    return [3 /*break*/, 4];
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
            this.disconnectEventAsObservable = new rxjs.Subject();
            this.isomDataAsObservable = new rxjs.Subject();
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
                    this.evergreenModeTimer = window.setInterval(( /**
                     * @return {?}
                     */function () {
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
                this.device.addEventListener('gattserverdisconnected', ( /**
                 * @param {?} event
                 * @return {?}
                 */function (event) {
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
                characteristic.addEventListener('characteristicvaluechanged', ( /**
                 * @param {?} event
                 * @return {?}
                 */function (event) {
                    /** @type {?} */
                    var target = ( /** @type {?} */(event.target));
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

    exports.A5DeviceManager = A5DeviceManager;
    exports.A5Device = A5Device;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=activ5-device.umd.js.map