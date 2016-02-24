var download = {},
    request = require('request'),
    concat = require('concat-files'),
    config = require('./config'),
    multimeter = require('multimeter'),
    fs = require('fs'),
    multi = multimeter(process)
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

    var generatePart = function (partNum, contentLength) {
        var totalPartBytes = Math.floor(contentLength / PARTS),
            from = partNum == 1 ? 0 : (totalPartBytes * (partNum-1)) + 1,
            to = partNum == PARTS ? null : totalPartBytes * partNum,
            progressBar = multi(4, partNum + 2, {
                width: 20,
                solid: {
                    text: '-'
                },
                empty: {
                    text: ' '
                }
            });

        return {
            downloaded: 0,
            progressBar: progressBar,
            tempFile: tempFile('.part'+partNum),
            number: partNum,
            from: from,
            to: to
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
    api.contentLength = 0
    api.attachmentName = ''

    api.download = function (url) {
        this.url = url;
        getCookies(function () {
            server.head(url).on('response', this.startDownload.bind(this))
        }.bind(this));
    }

    api.startDownload = function (response) {
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

    api.downloadInParts = function () {
        var partNum, part;
        multi.charm.reset();
        multi.write('Progress:\n\n');
        for (partNum = 1; partNum <= PARTS; partNum++) {
            part = generatePart(partNum, this.contentLength)
            this.parts.push(part)
            this.downloadPart(part)
        }
    },

    api.progress = function (part, asdf) {
        var to = (part.to === null ? this.contentLength : part.to);
        part.downloaded += asdf.length;
        part.progressBar.percent(part.downloaded / (to - part.from) * 100);
    },

    api.downloadPart = function (part) {
        multi.write(part.number + ":\n");
        server.downloadPart(this.url, part)
            .on('end', this.completedPart.bind(this, part))
            .on('data', this.progress.bind(this, part))
            .pipe(fs.createWriteStream(part.tempFile))
    }

    api.completedPart = function (part, response) {
        this.completedParts.push(part);

        if (this.allPartsAreCompleted()) {
            multi.destroy();
            this.joinParts();
            console.log("complete! " + this.attachmentName);
        }
    }

    api.tempFilesInOrder = function () {
        return this.parts.map(function (part) {
            return part.tempFile;
        })
    }

    api.joinFiles = function (files) {
        concat(files, downloadFile(this.attachmentName), this.removeFiles.bind(this, files))
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