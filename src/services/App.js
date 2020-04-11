
class App {

    constructor({ server }) {
        this.server = server;
    }

    listenUserData(service) {
        return this.server.post('/app/:id/data', (req, res) => {
            console.log(`Received HTTP message: ${JSON.stringify(req.body)}`);
            const errors = this.checkInvalidData(req.body, ['temperature']);
           
            if (errors.length > 0)
                return res.status(400).json({ 'messages': errors });

            const deviceId = req.params.id;
            const timestamp = req.body.timestamp ? req.body.timestamp : new Date().getTime();

            service.handleDeviceMessage(timestamp, req.body, deviceId);
            return res.status(204).send();
        });
    }

    checkInvalidData(payload, attributes) {
        return attributes.map(attribute => !payload.hasOwnProperty(attribute) ? "Missing mandatory field: " + attribute : undefined)
            .filter(error => error);
    }

}

module.exports = App;