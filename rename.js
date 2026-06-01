import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach((file) => {
    if (file.endsWith('.tsx')) {
        fs.renameSync(file, file.replace(/\.tsx$/, '.jsx'));
    } else if (file.endsWith('.ts')) {
        fs.renameSync(file, file.replace(/\.ts$/, '.js'));
    }
});

console.log('Renamed all .ts and .tsx files to .js and .jsx');
