import { EventEmitter} from 'events';

declare interface CommunicatorEmitter {
    on(event: 'load', listener: () => void): this;
}


class CommunicatorEmitter extends EventEmitter {
    public SharedData : {[x:string]:any}
    constructor() {
        super();
        this.SharedData = {}
    }
}

export const Communicator = new CommunicatorEmitter();