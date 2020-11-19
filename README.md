# Upload Android release to the Play Store

This action will help you update the version code of your app using the Google Play Developer API v3.

## Inputs

_You must provide one of either `serviceAccountJson` or `serviceAccountJsonPlainText`_

### `serviceAccountJson`

The service account json private key file to authorize the upload request

### `serviceAccountJsonPlainText`

The service account json in plain text, provided via a secret, etc.

### `packageName`

**Required:** The package name, or Application Id


## Example usage

```yaml
uses: nathanmkaya/android-version-code-update@v1
with:
  serviceAccountJson: ${{ SERVICE_ACCOUNT_JSON }}
  packageName: com.example.MyApp
```
