import {createHash} from 'node:crypto'
import {readdir, readFile, rename, writeFile} from 'node:fs/promises'
import path from 'node:path'

const distDirectory = path.resolve('dist')
const rootFiles = (await readdir(distDirectory, {withFileTypes: true}))
    .filter((entry) => entry.isFile() && entry.name !== 'index.html' && !entry.name.startsWith('.'))

async function collectFiles(directory) {
    const entries = await readdir(directory, {withFileTypes: true})
    const files = []

    for (const entry of entries) {
        if (entry.name.startsWith('.')) {
            continue
        }

        const filePath = path.join(directory, entry.name)
        if (entry.isDirectory()) {
            files.push(...await collectFiles(filePath))
        } else {
            files.push(filePath)
        }
    }

    return files
}

const renamedFiles = new Map()

for (const entry of rootFiles) {
    const filePath = path.join(distDirectory, entry.name)
    const content = await readFile(filePath)
    const hash = createHash('sha256').update(content).digest('hex').slice(0, 8)
    const extension = path.extname(entry.name)
    const name = path.basename(entry.name, extension)
    const hashedName = `${name}-${hash}${extension}`

    await rename(filePath, path.join(distDirectory, hashedName))
    renamedFiles.set(entry.name, hashedName)
}

const textExtensions = new Set(['.html', '.js', '.json', '.css', '.webmanifest'])
const filesToUpdate = await collectFiles(distDirectory)

for (const filePath of filesToUpdate) {
    if (!textExtensions.has(path.extname(filePath))) {
        continue
    }

    let content = await readFile(filePath, 'utf8')
    for (const [originalName, hashedName] of renamedFiles) {
        content = content.replaceAll(originalName, hashedName)
    }
    await writeFile(filePath, content)
}