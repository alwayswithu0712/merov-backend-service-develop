import {Injectable, MessageEvent} from '@nestjs/common';
import {Subject} from "rxjs";

@Injectable()
export class ServerEventsService {
    // userId => requestId => subject
    private subjects: Map<string, Map<string, Subject<MessageEvent>>> = new Map();

    add(userId: string, data: object ) {
        if (!this.subjects.has(userId)) return;

        this.subjects.get(userId).forEach(subject => {
            subject.next({ data });
        })
    }

    remove(userId: string, requestId: string) {
        if (!this.subjects.has(userId)) return;

        this.subjects.get(userId).delete(requestId);
    }
  
    send(userId: string, requestId: string) {
        if (!this.subjects.has(userId)) {
            this.subjects.set(userId, new Map());
        }
        this.subjects.get(userId).set(requestId, new Subject<MessageEvent>());
        return this.subjects.get(userId).get(requestId).asObservable();
    }

}