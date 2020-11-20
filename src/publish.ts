/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {google, androidpublisher_v3} from 'googleapis'

import {Compute} from 'google-auth-library/build/src/auth/computeclient'
import {JWT} from 'google-auth-library/build/src/auth/jwtclient'
import {UserRefreshClient} from 'google-auth-library/build/src/auth/refreshclient'

const androidPublisher: androidpublisher_v3.Androidpublisher = google.androidpublisher(
  'v3'
)

export interface Options {
  auth: Compute | JWT | UserRefreshClient
  applicationId: string
}

export async function fetchVersionCode(options: Options): Promise<Number> {
  const appEdit = await androidPublisher.edits.insert({
    packageName: options.applicationId,
    auth: options.auth
  })

  const tracks = await androidPublisher.edits.tracks.list({
    auth: options.auth,
    packageName: options.applicationId,
    editId: appEdit.data.id!
  })

  const versionCodes: number[] = []

  tracks.data.tracks?.forEach(track => {
    track.releases?.forEach(release => {
      versionCodes.push(Number(release.versionCodes![0]))
    })
  })

  if (versionCodes.length > 0) {
    return Math.max(...versionCodes)
  } else {
    return 1
  }
}
