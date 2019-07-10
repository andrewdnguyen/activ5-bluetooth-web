import { __awaiter } from 'tslib';
import { Subject } from 'rxjs';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
class A5DeviceManager {
    /**
     * @return {?}
     */
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
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
class A5Device {
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
        return __awaiter(this, void 0, void 0, function* () {
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
        return __awaiter(this, void 0, void 0, function* () {
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
        return __awaiter(this, void 0, void 0, function* () {
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
        return __awaiter(this, void 0, void 0, function* () {
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