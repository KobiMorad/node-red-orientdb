
import * as http from 'http';
import * as express from 'express';
import {Red} from 'node-red';
export interface RED extends Red {
    httpAdmin: express.Router;
    httpNode: express.Router;
    server: http.Server;
}

