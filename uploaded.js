var download = {},
    request = require('request')
    concat = require('concat-files')
    config = require('./config')
    fs = require('fs');

(function (api) {

    var PARTS = config.parts;
    var cookie = request.jar();

    var tempFile = function (filename) {
        return config.tempDir + filename;
    }

    var downloadFile = function (filename) {
        return config.downloadDir + filename
    }

    var server = {
        head: function (url) {
            return request.head({
                url: url,
                jar: cookie
            })
        },

        login: function () {
            return request.post({
                url: 'http://uploaded.net/io/login',
                form: {
                    id: config.uploaded.username,
                    pw: config.uploaded.password,
                },
                jar: cookie
            })
        },

        downloadPart: function (url, part) {
            return request.get({
                url: url,
                jar: cookie,
                headers: {
                    'Range': [
                        'bytes=',
                        part.from,
                        '-',
                        part.to
                    ].join('')
                }
            })
        }
    };

    var generatePart = function (partNum, contentLength) {
        var totalPartBytes = Math.floor(contentLength / PARTS)

        return {
            tempFile: tempFile('.part'+partNum),
            number: partNum,
            from: partNum == 1 ? 0 : (totalPartBytes * (partNum-1)) + 1,
            to: partNum == PARTS ? '' : totalPartBytes * partNum
        }
    }

    var getCookies = function (callback) {
        if (cookie.getCookies.length > 0) {
            callback.call()
        }

        server.login().on('error', function (err) {
            throw "Invalid username/password"
        }).on('response', function (response) {
            callback.call()
        })
    }

    api.url = ''
    api.completedParts = []
    api.parts = []

    api.download = function (url) {
        this.url = url;
        getCookies(function () {
            server.head(url).on('response', this.startDownload.bind(this))
        }.bind(this));
    }

    api.startDownload = function (response) {
        if (response.headers['accept-ranges'] == 'bytes') {
            this.downloadInParts(response.headers['content-length']);
        }
    }

    api.downloadInParts = function (contentLength) {
        var partNum, part;
        for (partNum = 1; partNum <= PARTS; partNum++) {
            part = generatePart(partNum, contentLength)
            this.parts.push(part)
            this.downloadPart(part)
        }

        console.log(this.parts);
    },

    api.downloadPart = function (part) {
        server.downloadPart(this.url, part)
            .on('end', this.completedPart.bind(this, part))
            .pipe(fs.createWriteStream(part.tempFile))
    }

    api.completedPart = function (part, response) {
        this.completedParts.push(part);

        if (this.allPartsAreCompleted()) {
            this.joinParts();
        }
    }

    api.tempFilesInOrder = function () {
        return this.parts.map(function (part) {
            return part.tempFile;
        })
    }

    api.joinFiles = function (files) {
        concat(files, downloadFile('wat.rar'), this.removeFiles.bind(this, files))
    }

    api.removeFiles = function (files) {
        for (var index in files) {
            fs.unlink(files[index])
        }
    }

    api.joinParts = function () {
        var files = this.tempFilesInOrder()

        this.joinFiles(files)
    }

    api.allPartsAreCompleted = function () {
        return this.completedParts.length == PARTS
    }



})(download);

module.exports = download;