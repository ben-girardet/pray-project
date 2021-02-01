import fs from 'fs';
import path from 'path';
let _version;

const version = '1.0.1';

export function getVersion() {
    if (_version) {
        return _version;
    }
    const rev = fs.readFileSync(path.join(__dirname, '../../../.git/HEAD')).toString();
    const origHash = fs.readFileSync(path.join(__dirname, '../../../.git/ORIG_HEAD')).toString().trim();
    let hash: string = '';
    let branch: string = '';
    if (rev.indexOf(':') === -1) {
        hash = rev.trim();
    } else {
        branch = rev.substring(5).trim();
        try {
            hash = fs.readFileSync(path.join(__dirname, '../../../.git/' + branch)).toString().trim()
        } catch (error) {
            // do nothing
        }
    }
    _version = {
        branch,
        hash,
        origHash,
        v: version
    };
    return _version;
}
