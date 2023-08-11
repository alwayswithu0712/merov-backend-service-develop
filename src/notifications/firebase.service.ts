import { Injectable } from '@nestjs/common';
import firebaseAdmin from 'firebase-admin';
import {UserService} from "../user/user.service";

@Injectable()
export class FirebaseService {
    constructor(private readonly userService: UserService) {

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const serviceAccount = require('../firebase.json')
        firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(serviceAccount)
        })
    }

    public async send(userId: string, data: { title: string, message?: string }) {
        const devices = await this.userService.getUserDevices(userId);
        const firebaseTokens = devices.map((device) => device.firebaseToken);

        if (firebaseTokens.length > 0) {
            firebaseAdmin
                .messaging()
                .sendMulticast({
                    tokens: firebaseTokens,
                    notification: {
                        title: data.title,
                        body: data.message,
                    },
                    data: {
                        message: JSON.stringify(data)
                    }
                })
                .then((response) => {
                    console.log('Successfully sent message:', response);
                })
                .catch((error) => {
                    console.log('Error sending message:', error);
                });
        }
    }
}
