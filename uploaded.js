var uploaded = {},
    request = require('request'),
    concat = require('concat-files'),
    config = require('./config'),
    fs = require('fs')
    ;

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

    var callCallbacks = function (callbacks, api, args) {
        callbacks.forEach(function (callback) {
            callback.apply(api, args)
        })
    }

    var generatePart = function (partNum, contentLength) {
        var totalPartBytes = Math.floor(contentLength / PARTS);

        return {
            downloaded: 0,
            tempFile: tempFile('.part'+partNum),
            number: partNum,
            from: partNum == 1 ? 0 : (totalPartBytes * (partNum-1)) + 1,
            to: partNum == PARTS ? contentLength : totalPartBytes * partNum
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

    var download = {
        url: '',
        completedParts: [],
        parts: [],
        contentLength: 0,
        attachmentName: '',
        callbacks: {
            partCreated: [],
            partTick: [],
            complete: []
        }
    }


    download.start = function (url) {
        this.url = url;
        getCookies(function () {
            server.head(url).on('response', this.startDownload.bind(this))
        }.bind(this));

        return this;
    }

    download.on = function (what, callback) {
        this.callbacks[what].push(callback)

        return this;
    }

    download.startDownload = function (response) {
        var disposition, matches;

        if (disposition = response.headers['content-disposition']) {
            var matches = disposition.match(/filename="([^"]+)"/);
            if (matches.length && response.headers['accept-ranges'] == 'bytes') {
                this.attachmentName = matches[1]
                this.contentLength = parseInt(response.headers['content-length']);
                this.downloadInParts();
            }
        }
    }

    download.downloadInParts = function () {
        var partNum, part;
        multi.charm.reset();
        multi.write('Progress:\n\n');
        for (partNum = 1; partNum <= PARTS; partNum++) {
            part = generatePart(partNum, this.contentLength)
            this.parts.push(part)
            callCallbacks(this.callbacks.partCreated, this, [part])
            this.downloadPart(part)
        }
    },

    download.progress = function (part, chunk) {
        part.downloaded += chunk.length;
        callCallbacks(this.callbacks.partTick, this, [part, chunk])
    },

    download.downloadPart = function (part) {
        multi.write(part.number + ":\n");
        server.downloadPart(this.url, part)
            .on('end', this.completedPart.bind(this, part))
            .on('data', this.progress.bind(this, part))
            .pipe(fs.createWriteStream(part.tempFile))
    }

    download.completedPart = function (part, response) {
        this.completedParts.push(part);

        if (this.allPartsAreCompleted()) {
            this.joinParts();

            callCallbacks(this.callbacks.complete, this, [])
        }
    }

    download.tempFilesInOrder = function () {
        return this.parts.map(function (part) {
            return part.tempFile;
        })
    }

    download.joinFiles = function (files) {
        concat(files, downloadFile(this.attachmentName), this.removeFiles.bind(this, files))
    }

    download.removeFiles = function (files) {
        for (var index in files) {
            fs.unlink(files[index])
        }
    }

    download.joinParts = function () {
        var files = this.tempFilesInOrder()

        this.joinFiles(files)
    }

    download.allPartsAreCompleted = function () {
        return this.completedParts.length == PARTS
    }

    api.download = function (url) {
        return download.start(url);
    }

})(uploaded);

module.exports = uploaded;