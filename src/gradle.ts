import * as fs from "fs";
import * as path from "path"
import * as core from '@actions/core'

async function* walk(dir: string): AsyncIterable<string> {
    for await (const d of await fs.promises.opendir(dir)) {
        const entry = path.join(dir, d.name);
        if (d.isDirectory()) yield* walk(entry);
        else if (d.isFile()) yield entry;
    }
}


async function getGradleFiles(): Promise<string[]> {
    var paths: string[] = []
    for (const p in walk(".")) {
        var file = path.parse(p)
        if (file.ext == ".gradle" || file.ext == ".kts") {
            paths.push(p)
        }
    }
    return paths
}

export async function UpdateVersionCode(versionCode: Number) {
    for (const path of await getGradleFiles()) {
        var data = fs.readFile(path, (err, data) => {
            if (err) core.error(err)
            const lines = data.toString("utf-8").split(/\r?\n/);
            for (let index = 0; index < lines.length; index++) {
                const line = lines[index];
                if (line.includes("versionCode")) {
                    var re = /[\d]+/g
                    var temp = line.replace(re, String(versionCode))
                    lines[index] = temp
                }
            }
            var file = fs.createWriteStream(path);
            file.on('error', function (err) { 
                core.error(err)
             });
            lines.forEach( (v) => { file.write(v + '\n'); });
            file.end();
        })
    }
}