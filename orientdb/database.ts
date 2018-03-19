import {Node} from 'node-red';
import {RED} from '../index';
import {ServerNode} from './orientdb';

const connectedTxt = 'connected';
const disconnectedTxt = 'disconnected';
const reconnectedTxt = 'reconnected';
const reconnectingTime = 5000;
function  registerDatabase(NodeRED: RED) {
    function open(node: Node) {
        const db = node.context().get('db');
        if (db) {
            db.open().then((database) => {
                node.status({fill: 'green', shape: 'dot', text: connectedTxt});
            }).catch((ee) => {
                console.log(ee);
                reconnected(node);
            });
        }
    }

    function reconnected(node) {
        node.status({fill: 'red', shape: 'dot', text: disconnectedTxt});
        setTimeout(() => {
            node.status({fill: 'orange', shape: 'dot', text: reconnectedTxt});
            open(node);
        }, reconnectingTime);
    }

    function Database(config) {
        NodeRED.nodes.createNode(this, config);
        const node: Node = this;
        const errorCallback = (error) => {
            console.log('socket error %s', error.code);
            reconnected(node);
        };

        const closeCallback = (error) => {
            console.log('socket error %s', error.code);
            reconnected(node);
        };

        function closeDb(done) {
            node.context().set('db', null);
            if (db) {
                db.server.transport.connection.removeAllListeners('error');
                db.server.transport.connection.removeAllListeners('reconnectNow');
                console.log('close');
                db.close().then(() => {
                    console.log('done');
                    done();

                })
                    .catch(() => {
                        done();
                        console.log('done');
                    });
            }
        }
        NodeRED.httpAdmin.get('/database/', function (req, res) {
            const server2 = node.context().get('server');
            server2.list()
                .then(
                    function(list) {
                        const result: Array<{ name: String }> = [];
                        list.forEach((c) => {
                            result.push({name: c.name});
                        });
                        console.log(result);
                        res.send(JSON.stringify(result));
                    }
                ).catch(() => {
                res.send(JSON.stringify([]));
            });
        });


        NodeRED.httpAdmin.get('/refresh/:id', function (req, res) {
            console.log('server ' +  req.params.id);
            const remoteServer2: any = NodeRED.nodes.getNode(req.params.id);
            if (remoteServer2) {
                const remoteServer3 = (remoteServer2 as ServerNode).getServer();
                remoteServer3.list().then(list => {
                    const result: Array<{ name: String }> = [];
                    list.forEach((c) => {
                        result.push({name: c.name});
                    });
                    console.log(result);
                    res.send(JSON.stringify(result));
                }).catch(() => {
                    res.send(JSON.stringify({}));
                });
                open(node);
            }
        });
        node.on('input', function (msg) {
            if (msg.payload) {
                db.query(msg.payload.cmd).then((result) => {
                    console.log(result);
                    msg.payload = result;
                    node.send([msg]);
                }).catch((err) => {
                    console.log(err);
                });
            }
        });

        const remoteServer: any = NodeRED.nodes.getNode(config.server);
        if (remoteServer === null) {
            return'';
        }
       const server = (remoteServer as ServerNode).getServer();
        node.context().set('server', server);
        console.log(config.db);
        const db = server.use({name: config.db});
        this.db = db;
        node.context().set('db', db);

        console.log(config.db);

        db.server.transport.connection.on('error', errorCallback.bind(this));
        db.server.transport.connection.on('reconnectNow', closeCallback.bind(this));
        open(node);



        this.on('close', function (removed, done) {
            closeDb(done);
        });


    }

    NodeRED.nodes.registerType('database', Database, {
        sampleNodeColour: {
            value: 'red',
            exportable: true
        }
    });
}

export  = registerDatabase;
