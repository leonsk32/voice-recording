
navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
}).then(function (stream) {
    var recorder = document.getElementById('recorder');
    var startButton = document.getElementById('startButton');
    var pauseButton = document.getElementById('pauseButton');
    var resumeButton = document.getElementById('resumeButton');
    var stopButton = document.getElementById('stopButton');
    var player = document.getElementById('player');
    var deleteButton = document.getElementById('deleteButton');
    var saveButton = document.getElementById('saveButton');
    var loadRecorder = function () {
        var mediaRecorder = new MediaRecorder(stream);
        var blob;
        mediaRecorder.addEventListener('dataavailable', function (e) {
            blob = e.data;
            player.src = window.URL.createObjectURL(blob);
        });
        startButton.addEventListener('click', function () {
            mediaRecorder.start();
            recorder.className = 'started';
        });
        pauseButton.addEventListener('click', function () {
            mediaRecorder.pause();
            recorder.className = 'paused';
        });
        resumeButton.addEventListener('click', function () {
            mediaRecorder.resume();
            recorder.className = 'started';
        });
        stopButton.addEventListener('click', function () {
            mediaRecorder.stop();
            recorder.className = 'stopped';
        });
        var saveButtonListener = function () {
            var formData = new FormData();
            var xhr = new XMLHttpRequest();
            formData.append('__REQUEST_TOKEN__', kintone.getRequestToken());
            formData.append('file', blob, moment().format('YYYY-MM-DD-HH-mm-ss') + '.' + ([
                { extension: 'aac', mimetype: 'audio/aac' },
                { extension: 'mid', mimetype: 'audio/midi' },
                { extension: 'mid', mimetype: 'audio/x-midi' },
                { extension: 'mp3', mimetype: 'audio/mpeg' },
                { extension: 'oga', mimetype: 'audio/ogg' },
                { extension: 'wav', mimetype: 'audio/wav' },
                { extension: 'weba', mimetype: 'audio/webm' },
                { extension: '3gp', mimetype: 'audio/3gpp' },
                { extension: '3g2', mimetype: 'audio/3gpp2' }
            ].find(function (format) {
                return blob.type.indexOf(format.mimetype) !== -1;
            }) || { extension: blob.type.split(/\/|;/g)[1] }).extension);
            xhr.open('POST', encodeURI('/k/v1/file.json'));
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.addEventListener('load', function () {
                kintone.api('/k/v1/record', 'POST', {
                    app: (event.type === 'app.record.index.show') ? kintone.app.getId() : kintone.mobile.app.getId(),
                    record: {
                        音声: {
                            value: [
                                { fileKey: JSON.parse(xhr.responseText).fileKey }
                            ]
                        }
                    }
                }).then(function () {
                    alert('保存しました。');
                    location.reload();
                });
            });
            xhr.send(formData);
        };
        saveButton.addEventListener('click', saveButtonListener);
        deleteButton.addEventListener('click', function () {
            recorder.className = 'default';
            saveButton.removeEventListener('click', saveButtonListener);
            loadRecorder();
        });
    };
    loadRecorder();
    document.getElementById('new').className = 'able';
}).catch(function (e) {
    document.getElementById('new').className = 'unable';
});
