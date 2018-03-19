"use strict";
const orient = require("orientjs");
function register(NodeRed) {
    function RemoteServer(config) {
        NodeRed.nodes.createNode(this, config);
        this.host = config.host;
        this.port = config.port;
        const username = 'root';
        const password = 'root';
        console.log(password);
        const node = this;
        this.createServer = () => {
            return new orient.Server({
                host: this.host,
                port: this.port,
                username: username,
                password: password
            });
        };
        this.getServer = function () {
            console.log(this.port);
            if (!this.server) {
                this.server = this.createServer();
            }
            console.log('get server ' + this.server);
            return this.server;
        }.bind(this);
        this.on('close', function (removed, done) {
            console.log('close ' + this.server);
            if (removed) {
                this.server.shutdown().then(() => {
                    console.log('removed');
                    done();
                }).catch(done);
            }
            else {
                this.server.shutdown().then(() => {
                    console.log('shotdown');
                    done();
                }).catch(done);
            }
        });
    }
    NodeRed.nodes.registerType('remote-server', RemoteServer, {
        credentials: {
            username: { type: 'text' },
            password: { type: 'password' }
        }
    });
}
module.exports = register;
//# sourceMappingURL=remote-server.js.map