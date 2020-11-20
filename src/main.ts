import * as core from '@actions/core'
import * as fs from 'fs'
import {google} from 'googleapis'
import {UpdateVersionCode} from './gradle'
import {fetchVersionCode} from './publish'

const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/androidpublisher']
})

async function run(): Promise<void> {
  try {
    const serviceAccountJson = core.getInput('serviceAccountJson', {
      required: false
    })
    const serviceAccountJsonRaw = core.getInput('serviceAccountJsonPlainText', {
      required: false
    })
    const packageName = core.getInput('packageName', {required: true})

    // Validate that we have a service account json in some format
    if (!serviceAccountJson && !serviceAccountJsonRaw) {
      core.setFailed(
        "You must provide one of 'serviceAccountJson' or 'serviceAccountJsonPlainText' to use this action"
      )
      return
    }

    // If the user has provided the raw plain text via secrets, or w/e, then write to file and
    // set appropriate env variable for the auth
    if (serviceAccountJsonRaw) {
      const serviceAccountFile = './serviceAccountJson.json'
      fs.writeFileSync(serviceAccountFile, serviceAccountJsonRaw, {
        encoding: 'utf8'
      })

      // Insure that the api can find our service account credentials
      core.exportVariable('GOOGLE_APPLICATION_CREDENTIALS', serviceAccountFile)
    }

    if (serviceAccountJson) {
      // Insure that the api can find our service account credentials
      core.exportVariable('GOOGLE_APPLICATION_CREDENTIALS', serviceAccountJson)
    }

    const authClient = await auth.getClient()
    const versionCode = await fetchVersionCode({
      auth: authClient,
      applicationId: packageName
    })
    await UpdateVersionCode(versionCode)
  } catch (error) {
    core.debug(error)
    core.setFailed(error.message)
  }
}

run()
