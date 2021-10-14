// Setup basic express server
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
let express = require('express'),
    fs = require('fs');
let app = express(),
    path = require('path'),
    https = require('https'),
    request = require('request'),
    port = 2096,
    options = {
        key: fs.readFileSync('/etc/apache2/ssl/private/apache-selfsigned.key'),
        cert: fs.readFileSync('/etc/apache2/ssl/certs/apache-selfsigned.crt')
    },
    domain = 'socketChat.vladi';

let server = https.createServer(options, app);
let io = require('socket.io')(server);

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

let $type,
    $seen = [],
    $messages = [],
    $personal_messages = [],
    last_message_id = 0,
    handleResult = {};
global.online = {};
global.$groups = [];

async function makeControllerCall(postData, type = '', action) {
    if (type !== 'user') {
        type += '.';
    } else {
        type = '';
    }
    let url = 'https://' + type + domain + '/chat/' + action;
    let promise = new Promise((resolve, reject) => {
        request.post({url: url, form: postData}, function (err, httpResponse, body) {
            if (err) {
                return console.error('post failed:', err);
            }
            try {
                resolve(body);
            } catch (e) {
                body = {"success": false, "messages": {"errors": "Error connection"}};
            }
        });
    })
    let result = await promise;
    handleResult[action](result, postData);
}

async function setToSeen() {
    if ($seen.length > 0) {
        let url = 'https://' + domain + '/chat/seen';
        let promise = new Promise((resolve, reject) => {
            request.post({url: url, form: {seen: $seen}}, function (err, httpResponse, body) {
                if (err) {
                    return console.error('post set to seen failed:', err);
                }
                try {
                    resolve(body);
                } catch (e) {
                    body = {"success": false, "messages": {"errors": "Error connection"}};
                }
            });
        })
        $seen = [];
    }
}

setInterval(setToSeen, 10000);

async function sendMessages() {
    if ($messages.length > 0) {
        let add_msgs = $messages;
        $messages = [];
        let url = 'https://' + domain + '/chat/send';
        let promise = new Promise((resolve, reject) => {
            request.post({url: url, form: add_msgs}, function (err, httpResponse, body) {
                if (err) {
                    return console.error('post send messages failed:', err);
                }
                try {
                    resolve(body);
                } catch (e) {
                    body = {"success": false, "messages": {"errors": "Error connection"}};
                }
            });
        })
        $personal_messages = [];
    }
}

setInterval(sendMessages, 10000);

function getCurrentDate() {
    let dateCreate = Date.now(),
        dateNow = new Date(dateCreate),
        formatDate = [];
    formatDate.day = dateNow.getDate();
    formatDate.month = dateNow.getMonth() + 1;
    formatDate.year = dateNow.getFullYear();
    formatDate.hours = dateNow.getHours();
    formatDate.minutes = dateNow.getMinutes();
    formatDate.seconds = dateNow.getSeconds();
    for (let arrayIndex in formatDate) {
        if (formatDate[arrayIndex].toString().length == 1) {
            formatDate[arrayIndex] = '0' + formatDate[arrayIndex];
        }
    }
    return formatDate.day + '.' + formatDate.month + '.' + formatDate.year + ' ' + formatDate.hours + ':' + formatDate.minutes + ':' + formatDate.seconds;
}

io.on('connection', (socket) => {
    handleResult = {
        session: function (result, data) {
            socket.join('notification');
            // we store the username in the socket session for this client
            let $tunnel = data.id + $type;
            // Add the client's username to the global list
            if (typeof online[$type] === 'undefined') {
                global.online[$type] = {};
            }
            if (typeof online[$type] == 'undefined') {
                global.online[$type] = '';
            }
            global.online[$type][data.id] = JSON.parse(result).name;
            io.sockets.in('notification').emit('online', {
                id: data.id,
                type: $type,
                online,
                result
            });
            socket.join($tunnel);
        },
        index: function (result, data) {
            socket.join(data.new_id + '/' + data.new_type);
            makeControllerCall({groupId: data.new_id, groupType: data.new_type}, 'admin', "groupParticipants");
            let $tunnel = data.id + $type;
            if(typeof $personal_messages[data.new_id] != 'undefined' && typeof $personal_messages[data.new_id][data.new_type] != 'undefined'){
                result = JSON.parse(result);
                if(typeof result.msg == 'undefined'){
                    result.msg = {};
                }
                let old_messages = result.msg;
                old_messages.push($personal_messages[data.new_id][data.new_type]);
                result.msg = old_messages;
                result = JSON.stringify(result);
            }
            io.sockets.in($tunnel).emit('start chat', {
                new_id: data.new_id,
                new_type: data.new_type,
                result
            });
        },
        getLastMsgId: function (result, data) {
            last_message_id = Number(result) + 1;
        },
        send: function (result, data) {
            last_message_id = Number(last_message_id) + 1;

            // we tell the client to execute 'new message'
            let group = false,
                username = 'Unknown';

            if (result.receiver_type > 0) {
                if (typeof $groups[result.receiver_id][result.receiver_type] != 'undefined' && global.$groups[result.receiver_id][result.receiver_type]) {
                    _group = JSON.parse(global.$groups[result.receiver_id][result.receiver_type])['participants'];
                    for (let arrayIndex in _group) {
                        if (_group[arrayIndex] !== null && _group[arrayIndex].user_id != result.sender_id) {
                            if (typeof online[result.sender_type] != 'undefined' && typeof online[result.sender_type][result.sender_id] != 'undefined') {
                                username = online[result.sender_type][result.sender_id];
                            }
                            let $tunnel = _group[arrayIndex].user_id + _group[arrayIndex].type;
                            result.username = {name: username};
                            io.sockets.in($tunnel).emit('new message', {
                                name: result.name,
                                from_type: result.receiver_type,
                                from_id: result.receiver_id,
                                result
                            });
                        }
                    }
                }
            } else {
                if (typeof online[result.sender_type] != 'undefined') {
                    if (typeof online[result.sender_type][result.sender_id] != 'undefined') {
                        username = online[result.sender_type][result.sender_id]
                    }
                }
                let $tunnel = result.receiver_id + '/' + result.receiver_type;
                result.username = {name: username};
                io.sockets.in($tunnel).emit('new message', {
                    from_type: result.receiver_type,
                    from_id: result.receiver_id,
                    result
                });
            }
            $sender_tunnel = result.sender_id + result.sender_type
            io.sockets.in($sender_tunnel).emit('new message', {
                to_type: result.receiver_type,
                to_id: result.receiver_id,
                result
            });
        },
        groupParticipants: function (result, data) {
            if (typeof global.$groups[data.groupId] == 'undefined') {
                global.$groups[data.groupId] = [];
            }
            global.$groups[data.groupId][data.groupType] = result;
        },
        participants: function (result, data) {
            let $tunnel = data.id + data.type;
            io.sockets.in($tunnel).emit('participants', {
                result,
                groupId: data.groupId
            });
        },
        group: function (result, data) {
            let $tunnel = data.id + data.type;
            io.sockets.in($tunnel).emit('group', {
                result,
                data
            });
        }
    }

    if (last_message_id == 0) {
        makeControllerCall([], 'user', "getLastMsgId");
    }

    // when the client emits 'add message', this listens and executes
    socket.on('add message', ($data, msg_type, $send_to_id, $send_to_type, $name, $id, type = 'user') => {
        if ($send_to_id && $send_to_type) {
            let $current_message = {
                id: last_message_id.toString(),
                message: $data,
                sender_id: $id,
                sender_type: type,
                sent: getCurrentDate(),
                receiver_id: $send_to_id,
                receiver_type: $send_to_type,
                msg_type: msg_type,
                seen: ''
            };
            if(typeof $personal_messages[$send_to_id] == 'undefined'){
                $personal_messages[$send_to_id] = [];
            }
            let username = [];
            username['name'] = $name;
            username['type'] = type;
            $personal_messages[$send_to_id][$send_to_type] = {
                id: last_message_id.toString(),
                message: $data,
                sender_id: $id,
                sender_type: type,
                sent: getCurrentDate(),
                msg_type: msg_type,
                seen: '',
                username: username
            };
            $messages[last_message_id] = $current_message;
            $current_message.name = $name;
            handleResult['send']($current_message, '');
        } else {
            console.log('add message - credentials is not defined!');
        }
    });

    // when the client emits 'add user', this listens and executes
    socket.on('seen', ($id, $message_id, $type = 'user') => {
        if (typeof $seen[$message_id] == 'undefined') {
            $seen[$message_id] = '';
        }
        $seen[$message_id] += $type.substring(0, 1) + $id + ',';
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', ($id, type = 'user') => {
        $type = type;
        makeControllerCall({id: $id}, type, "session");
    });

    // when the client emits 'open chat', this listens and executes
    socket.on('open chat', ($data, type = 'user') => {
        if ($data.new_id && $data.new_type) {
            $type = type;
            $data.sender_id = $data.new_id;
            makeControllerCall($data, type, "index");
        } else {
            console.log('open chat - credentials is not defined!');
        }
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', ($send_to_id, $send_to_type, $id, type = 'user') => {
        if ($send_to_id == null) return;
        let username = 'Unknown'
        if (typeof online[type] != 'undefined') {
            if (typeof online[type][$id] != 'undefined') {
                username = online[type][$id];
            }
        }
        let $tunnel = $send_to_id + '/' + $send_to_type;
        io.sockets.in($tunnel).emit('typing', {
            username: {name: username},
            from_type: $send_to_type,
            from_id: $send_to_id,
            from: $id,
            type: type,
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', ($send_to_id, $send_to_type, $id, type = 'user') => {
        if ($send_to_id == null || $send_to_type == null) return;
        let username = 'Unknown'
        if (typeof online[type] != 'undefined') {
            if (typeof online[type][$id] != 'undefined') {
                username = online[type][$id];
            }
        }
        let $tunnel = $send_to_id + '/' + $send_to_type;
        io.sockets.in($tunnel).emit('stop typing', {
            username: {name: username},
            from_type: $send_to_type,
            from_id: $send_to_id,
        });
    });

    // when the client emits 'participants', this listens and executes
    socket.on('participants', ($id, $groupId, type = 'user') => {
        if (!(type == 'user' && $groupId == false)) {
            makeControllerCall({groupId: $groupId, id: $id, type: type}, type, "participants");
        }
    });

    // when the client emits 'group', this listens and executes
    socket.on('group', ($id, $group, $new_users, $deleted_users, $working_time, type = 'user') => {
        makeControllerCall({
            id: $id,
            type: type,
            group: $group,
            new_users: $new_users,
            deleted_users: $deleted_users,
            working_time: $working_time
        }, type, "group");
    });

    // When the user disconnects, perform this
    socket.on('custom disconnect', ($id, type = 'user') => {
        // echo globally that this client has left
        io.sockets.in('notification').emit('offline', {
            id: $id,
            type: type,
            online: online
        });
        // Remove the username from global online list
        if (typeof online[type] != 'undefined' && typeof online[type][$id] != 'undefined') {
            delete online[type][$id];
        }
    });
});