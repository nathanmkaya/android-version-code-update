import * as fs from 'fs'
import * as path from 'path'
import * as core from '@actions/core'

async function* walk(dir: string): AsyncIterable<string> {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name)
    if (d.isDirectory()) yield* walk(entry)
    else if (d.isFile()) yield entry
  }
}

async function getGradleFiles(): Promise<string[]> {
  const paths: string[] = []
  for (const p in walk('.')) {
    const file = path.parse(p)
    if (file.ext === '.gradle' || file.ext === '.kts') {
      paths.push(p)
    }
  }
  return paths
}

export async function UpdateVersionCode(versionCode: Number): Promise<void> {
  for (const file_path of await getGradleFiles()) {
    fs.readFile(file_path, (err, data) => {
      if (err) core.error(err)
      const lines = data.toString('utf-8').split(/\r?\n/)
      for (let index = 0; index < lines.length; index++) {
        const line = lines[index]
        if (line.includes('versionCode')) {
          const re = /[\d]+/g
          const temp = line.replace(re, String(versionCode))
          lines[index] = temp
        }
      }
      const file = fs.createWriteStream(file_path)
      file.on('error', function (error) {
        core.error(error)
      })
      for (const v of lines) {
        file.write(`${v}\n`)
      }
      file.end()
    })
  }
}
