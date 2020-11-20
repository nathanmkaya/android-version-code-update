import {google} from 'googleapis';
import {androidpublisher_v3} from 'googleapis'

import AndroidPublisher = androidpublisher_v3.Androidpublisher;

const androidPublisher: AndroidPublisher = google.androidpublisher('v3');

import {Compute} from "google-auth-library/build/src/auth/computeclient";
import {JWT} from "google-auth-library/build/src/auth/jwtclient";
import {UserRefreshClient} from "google-auth-library/build/src/auth/refreshclient";

export interface Options {
    auth: Compute | JWT | UserRefreshClient;
    applicationId: string;
}

export async function fetchVersionCode(options: Options): Promise<Number> {
    const appEdit = await androidPublisher.edits.insert({
        packageName: options.applicationId,
        auth: options.auth
    });

    const tracks = await androidPublisher.edits.tracks.list({
        auth: options.auth,
        packageName: options.applicationId,
        editId: appEdit.data.id!
    })

    var versionCodes: number[] = []

    tracks.data.tracks?.forEach((track) => {
        track.releases?.forEach((release) => {
            versionCodes.push(Number(release.versionCodes![0]));
        });
    })

    if(versionCodes.length > 0){
        return Math.max.apply(Math, versionCodes);
    } else {
        return 1;
    }
}