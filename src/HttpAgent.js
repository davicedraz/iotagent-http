
class HttpAgent {

    constructor({ server, port, service, tenants }) {
        this.devices = {};
        this.server = server;
        this.service = service;
        this.tenants = tenants;
        this.port = port;
    }

    init() {
        this._handleCreateDevice();
        this._handleUpdateDevice();
        this._handleDeleteDevice();

        this.service.messenger.generateDeviceCreateEventForActiveDevices();

        console.log('Succeeded to start the HTTP IoT Agent ');
        return new Promise((resolve, reject) => {
            this.server.listen(this.port, () => {
                console.log(`Http IotAgent listening on port ${this.port}...`);
                resolve();
            });
        });
    }

    handleDeviceMessage(timestamp, data, deviceId) {
        const device = this.devices[deviceId];
        if (!device) return;

        console.log(`Received HTTP message: ${JSON.stringify(data)} from device ${JSON.stringify(deviceId)} with  timestamp ${timestamp} and tenant ${device.tenant}`);
        this.service.updateAttrs(deviceId, device.tenant,
            data, {} // metadata
        );
    }

    _handleCreateDevice() {
        this.service.messenger.on('iotagent.device', 'device.create', (tenant, event) => {
            if (this.tenants.includes(tenant)) {
                const { id, label } = event.data;
                this.devices[id] = { tenant, label };
            }
        });
    }

    _handleUpdateDevice() {
        this.service.messenger.on('iotagent.device', 'device.update', (tenant, event) => {
            if (this.tenants.includes(tenant)) {
                const { id, label } = event.data;
                if (this.devices[id].label == label) return;
                this.devices[id].label = label;
            }
        });
    }

    _handleDeleteDevice() {
        this.service.messenger.on('iotagent.device', 'device.remove', (tenant, event) => {
            if (this.tenants.includes(tenant)) {
                const { id } = event.data;
                if (Object.keys(this.devices).includes(id)) {
                    delete this.devices[id];
                }
            }
        });
    }

}

module.exports = HttpAgent;