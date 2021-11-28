const versionInfo = {abi: process.versions.modules, platform: process.platform, arch: process.arch};

_fs.default.writeFileSync('FILENAMEHERE', JSON.stringify(versionInfo), 'utf-8');