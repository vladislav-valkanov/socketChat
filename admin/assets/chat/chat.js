/**
 * @constant
 */
let chat = {};

$(function () {
    let FADE_TIME = 50; // ms
    let TYPING_TIMER_LENGTH = 500; // ms

    // Initialize variables
    let openChatButton = $("#btn-support_chat"); // Chat - open button

    let socket = io(chatUrl + ':' + chatPort, {secure: true});
    let username,
        $id,
        $type,
        typing = false,
        lastTypingTime,
        chat_id = [],
        group_id = [],
        invertColors = false,
        muteNotifications = false,
        $chats = [],
        $groups = [],
        $online = [],
        chatBox1 = 'fast_chat',
        chatBox2 = 'chat-popup',
        chatBoxWindow = 'chat_window',
        scroll_load_msg = [];

    socket.emit('add user', chatId, 'admin');

    function escapeHtml(text) {
        if (text == null) {
            return;
        }
        'use strict';
        let chr = {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'};
        return text.replace(/[\"&<>]/g, function (a) {
            return chr[a];
        });
    }

    function chatGenerateView(chat, notify) {
        let status = 'f-off',
            statusClass = 'off',
            unreadMessage = '',
            user_info;

        if (chat.type == 'group') {
            status = 'f-online';
            statusClass = '';
        } else {
            if (typeof $online[chat.type] != 'undefined' && typeof $online[chat.type][chat.id] != 'undefined') {
                status = 'f-online';
                statusClass = 'on';
            }
        }

        switch (chat.type) {
            case 'group':
                user_info = '';
                // user_info = '<button title="Add more Users in Group" id="" data-toggle="modal" ' +
                //     'data-target="#group_modal" type="button" class="btn btn-dark btn-group btn-sm edit-group" ' +
                //     'aria-haspopup="true" aria-expanded="false">' +
                //     '<i class="mdi mdi-plus text-white"><i>Edit Group</i></i>' +
                //     '</button>';
                break;
            case 'user':
                let url = "window.open('" + window.location.origin + '/brand?owner=' + chat.id + "')";
                user_info = '<button title="Go to user brands info" type="button" class="btn btn-dark btn-group btn-sm" ' +
                    'onclick="' + url + '">' +
                    '<i class="mdi mdi-plus text-white"><i>User Info</i></i>' +
                    '</button>';
                break;
            case 'admin':
                if (chat.typeId == '6') {
                    //payment
                    user_info = '<i class="mdi mdi-spin mdi-star text-success" title="Payment Team"></i>';
                } else if (chat.typeId == '7') {
                    //support
                    user_info = '<i class="mdi mdi-spin mdi-star text-warning" title="Support Team"></i>';
                } else {
                    user_info = '<i class="mdi mdi-spin mdi-star text-info" title="Support"></i>';
                }
                break;
        }

        if (notify != '') {
            unreadMessage = 'um';
        }

        let last_message = 'there are no messages yet';
        if (chat.message != null) {
            last_message = escapeHtml(chat.message);
        }

        return '<li class="nav-item ' + notify + ' ' + chat.type.charAt(0) + ' ' + statusClass + ' ' + unreadMessage + '">' +
            '<a href="' + chat.id + '" data-brand="' + chat.brand_id + '" style="padding: 10px 15px;">' +
            '<figure>' +
            '<span class="status ' + status + '"></span>' +
            '</figure>' +
            '<div class="user-name">' +
            '<h6 class="">' + escapeHtml(chat.name) + ' - (' + escapeHtml(chat.brand_name) + ')</h6>' +
            '<span>' + last_message + '</span>' +
            '</div>' +
            '<div class="user-role float-right">' +
            '<small>' + user_info + '</small>' +
            '</div>' +
            '</a>' +
            '</li>';
    }

    function chatGenerateNotifications(chat) {
        let from_type, from_id;
        if (chat.from_type && chat.from_id) {
            from_type = chat.from_type;
            from_id = chat.from_id;
        } else if (chat.id && chat.brand_id) {
            from_type = chat.id;
            from_id = chat.brand_id;
            chat.name = chat.name + ' - (' + chat.brand_name + ')';
        } else {
            from_type = chat.receiver_type;
            from_id = chat.receiver_id;
        }
        return '<a href="' + from_type + '" id="' + from_id + '" class="dropdown-item notify-item show-mesg">' +
            '<div class="notify-icon"></span><h6>' + escapeHtml(chat.name) + ' <br/><small>' + chat.sent + '</small></h6></div>' +
            '<p class="notify-details">' +
            '<i class="ti-check"></i>' + escapeHtml(chat.message) + '<small class="text-muted"></small>' +
            '</p>' +
            '</a>';
    }

    chat.listChats = function () {
        let obj = $chats;
        if (obj.chats.chatsList != false) {
            let notifications = 0;
            obj.chats.chatsList.forEach(function (chat) {
                let notify = '';
                if (chat.seen.search('a' + $id + ',') < 0) {
                    notify = "unread";
                    let notificationView = chatGenerateNotifications(chat);
                    $('#chat_notifications .list_notifications').append(notificationView);
                    notifications++;
                }
                let chatView = chatGenerateView(chat, notify);
                $('.msg-pepl-list').append(chatView);
            });
            $('#chat_notifications .count_notifications').text(notifications);
        }
    };

    chat.muteNotifications = function () {
        if (sessionStorage.getItem('muteNotifications') != 1) {
            sessionStorage.setItem('muteNotifications', 1);
            muteNotifications = 1;
            if (!$("#muteNotifications").hasClass('active')) {
                $("#muteNotifications").addClass('active');
            }
        } else {
            sessionStorage.removeItem('muteNotifications')
            muteNotifications = 0;
            if ($("#muteNotifications").hasClass('active')) {
                $("#muteNotifications").removeClass('active');
            }
        }
    };

    chat.invertColors = function () {
        if (sessionStorage.getItem('invertColors') != 1) {
            sessionStorage.setItem('invertColors', 1);
            invertColors = 1;
            if (!$("#chat_window").hasClass('inverted_colors')) {
                $("#chat_window").addClass('inverted_colors');
            }
            if (!$(".chat_container").hasClass('inverted_colors')) {
                $(".chat_container").addClass('inverted_colors');
            }
            if (!$(".chat_modal").hasClass('inverted_colors')) {
                $(".chat_modal").addClass('inverted_colors');
            }
            if (!$("#invertColors").hasClass('active')) {
                $("#invertColors").addClass('active');
            }
        } else {
            sessionStorage.removeItem('invertColors')
            invertColors = 0;
            if ($("#chat_window").hasClass('inverted_colors')) {
                $("#chat_window").removeClass('inverted_colors');
            }
            if ($(".chat_container").hasClass('inverted_colors')) {
                $(".chat_container").removeClass('inverted_colors');
            }
            if ($(".chat_modal").hasClass('inverted_colors')) {
                $(".chat_modal").removeClass('inverted_colors');
            }
            if ($("#invertColors").hasClass('active')) {
                $("#invertColors").removeClass('active');
            }
        }
    };

    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    //   all other messages (default = false)
    function addMessageElement(el, options, id, type) {
        let $el = $(el);
        // Setup default options
        if (!options) {
            options = {};
        }
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        // Apply options
        if (options.fade) {
            $el.fadeIn(FADE_TIME);
        }
        if(options.prepend){
            $('#' + id + '.stream[data-id="' + type + '"] .conversations').prepend($el);
        }else{
            $('#' + id + '.stream[data-id="' + type + '"] .conversations').append($el);
        }
        let message_box = $('#' + id + '.stream[data-id="' + type + '"] .conversations'),
            message_area = $('#' + id + '.stream[data-id="' + type + '"] .mesge-area');
        scrollHeight = true;
        if (message_box.length > 0) {
            if(message_area.scrollTop() + message_area.height() - message_box[0].scrollHeight < - 500){
                scrollHeight = false;
            }
        }
        if (scrollHeight && options.init) {
            chat.goToEnd(id, type);
        }
    }

    // Gets the 'X is typing' messages of a user
    function getTypingMessages(data) {
        return $('#' + data.from_id + '[data-id=' + data.from_type + '] .typingMessage').filter(function (i) {
            return $(this).data('username') === data.username.name;
        });
    }

    // Prevents input from having injected markup
    function cleanInput(input) {
        return $('<div/>').text(input).text();
    }

    function changeChatHeader(id, type, data) {
        if ($('#' + id + '.stream[data-id="' + type + '"]').find('.active-user h6').length > 0) {
            $('#' + id + '.stream[data-id="' + type + '"]').find('.active-user h6').text(escapeHtml(data.name));
        } else {
            $('#' + id + '.chat-popup[data-id="' + type + '"] .active-user h6').text(escapeHtml(data.name));
        }
        let status = 'Offline';
        if (typeof $online[data.type] != 'undefined') {
            if (typeof $online[data.type][id.substr(1)] != 'undefined') {
                status = 'Online'
            }
        }
        switch (data.type) {
            case 'group':
                let group_type = 'Group Chat';
                if (data.group) {
                    group_type = data.group;
                }
                if (data.time) {
                    group_type = data.group;
                }
                $('#' + id + '[data-id="' + type + '"] .active-user>div>span>small')
                    .html(status + ' / <b class="text-info"> <i class="mdi mdi-account-group text-info"></i> ' + group_type + '</b>');
                break;
            case 'admin':
                switch (data.typeId) {
                    case '6':
                        $('#' + id + '.stream[data-id="' + type + '"] .active-user>div>span>small')
                            .html(status + ' / <b class="text-success"> <i class="mdi mdi-spin mdi-star text-success"></i> Payment Team</b>');
                        break;
                    case '7':
                        $('#' + id + '.stream[data-id="' + type + '"] .active-user>div>span>small')
                            .html(status + ' / <b class="text-warning"> <i class="mdi mdi-spin mdi-star text-warning"></i> Support Team</b>');
                        break;
                    default:
                        $('#' + id + '.stream[data-id="' + type + '"] .active-user>div>span>small')
                            .html(status + ' / <b class="text-info"> <i class="mdi mdi-spin mdi-star text-info"></i> Support</b>');
                        break;
                }
                break;
            case 'user':
                $('#' + id + '.stream[data-id="' + type + '"] .active-user>div>span>small')
                    .html(status + ' / <b class="text-info"> <i class="mdi mdi-account-user text-info"></i> Customer User</b>');
                break;
        }
    }

    // Sends a chat message
    chat.sendMessage = function (send_to_id, send_to_type, message) {
        let name;
        if ($('#' + send_to_id + '.stream[data-id="' + send_to_type + '"]').length > 0) {
            name = $('#' + send_to_id + '.stream[data-id="' + send_to_type + '"] .text-info').text() + ' - ' + $('#' + send_to_id + '.stream[data-id="' + send_to_type + '"] .active-user h6').text();
        } else {
            name = $('#' + send_to_id + '.chat-popup[data-id="' + send_to_type + '"] .text-info').text() + ' - ' + $('#' + send_to_id + '.stream[data-id="' + send_to_type + '"] .active-user h6').text();
        }
        message = cleanInput(message);
        typing = false;
        socket.emit('stop typing', send_to_id, send_to_type, chatId, 'admin');
        socket.emit('add message', message, 'text', send_to_id, send_to_type, name, chatId, 'admin');
    };


    chat.uploadImage = function (myFile, send_to_id, send_to_type) {
        let name = $('#' + send_to_id + '.stream[data-id="' + send_to_type + '"] .text-info').text() + ' - (' + $('#' + send_to_id + '.stream[data-id="' + send_to_type + '"] .active-user h6').text(),
            formData = new FormData();
        formData.append('id', send_to_id);
        formData.append('file', myFile.files[0]);
        $.ajax({
            url: window.location.origin + "/chat/uploadImage",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function (data) {
                let obj = jQuery.parseJSON(data);
                if (typeof obj.error != 'undefined') {
                    alert(obj.error);
                } else {
                    $('#default_message').hide();
                    $('#add_file').val('');
                    // if there is a non-empty message and a socket connection
                    // tell server to execute 'add message' and send along one parameter
                    socket.emit('add message', obj, 'image', send_to_id, send_to_type, name, chatId, 'admin');
                }
            }
        });
    };

    // Adds the visual chat message to the message list
    let reporter = false;
    chat.addMessage = function (data, options, id, type) {
        // Don't fade the message in if there is an 'X was typing'
        let $typingMessages = getTypingMessages(data);
        options = options || {};
        if (options.fade) {
            $typingMessages.remove();
        }
        let $usernameDiv = '',
            msg_content = '',
            $messageBodyDiv = ''


        if (data.sender_type == 'user') {
            reporter = data.sender_id;
        }
        if (data.typing) {
            $messageBodyDiv = $('<li class="you typingMessage">' +
                '<div class="text-box">' +
                '<div class="wave">' +
                '<span class="dot"></span>' +
                '<span class="dot"></span>' +
                '<span class="dot"></span>' +
                '</div>' +
                '</div>' +
                '</li>').data('username', data.username.name)
            // .text(data.username + ' ' + data.message);
        } else if (options.incomming) {
            let notSeen = '',
                data_r = '';
            if (typeof data.seen != 'undefined') {
                if (typeof data.seen.split(',').find(element => element === options.id) == 'undefined') {
                    notSeen = 'not_seen_msg';
                    data_r = 'data_r="' + data.id + '"';
                }
            }

            $usernameDiv = escapeHtml(data.username.name) + ' - ' + data.sent;
            if (data.msg_type == 'image') {
                msg_content = '<a href="#" class="img_pop"><img alt="image message" src="' + data.message + '"></a>';
            } else if (data.msg_type == 'text') {
                msg_content = data.message;
            }
            $messageBodyDiv = $('<li class="you ' + notSeen + '" ' + data_r + '>' +
                '<div class="text-box">' +
                '<p>' + msg_content + '</p>' +
                '</div>' +
                '<span style="font-size: 11px;" class="d-block"><span onclick="chat.supportCase(' + type + ', ' + id + ', ' + reporter + ', \'' + data.message + '\', ' + data.id + ')" ' +
                'data-toggle="modal" data-target="#support_case_modal" aria-haspopup="true" ' +
                'aria-expanded="false"><i class="fas fa-info-circle"></i>' + $usernameDiv + '</span><i class="ti-check"></i><i class="ti-check"></i></span>' +
                '</li>');
        } else {
            if (data.msg_type == 'image') {
                msg_content = '<a href="#" class="float-right img_pop"><img alt="image message" src="' + data.message + '"></a>';
            } else if (data.msg_type == 'text') {
                msg_content = data.message;
            }
            $messageBodyDiv = $('<li class="me" >' +
                '<div style="width: 100%" class="text-box d-block">' +
                '<p class="float-right">' + msg_content + '</p>' +
                '</div><br/>' +
                '<span style="font-size: 11px;" class="d-block float-right" onclick="chat.supportCase(' + type + ', ' + id + ', ' + reporter + ', \'' + data.message + '\', ' + data.id + ')" ' +
                'data-toggle="modal" data-target="#support_case_modal" aria-haspopup="true" ' +
                'aria-expanded="false"><i class="fas fa-info-circle"></i>' + data.sent + '<i class="ti-check"></i><i class="ti-check"></i></span>' +
                '</li>');
        }
        if ($('#' + id + '[data-id=' + type + '] .conversations').hasClass('d-none')) {
            $('#' + id + '[data-id=' + type + '] .conversations').removeClass('d-none')
            $('#' + id + '[data-id=' + type + '] .empty-chat').addClass('d-none');
        }
        let $messageDiv;
        if(options.prepend){
            $messageDiv = $('#' + id + '[data-id=' + type + '] .conversations')
                .prepend($messageBodyDiv);
        }else{
            $messageDiv = $('#' + id + '[data-id=' + type + '] .conversations')
                .append($messageBodyDiv);
        }
        addMessageElement($messageDiv, options, id, type);
    };

    chat.showImage = function (element) {
        $('#imagepreview').attr('src', element.children('img').attr('src')); // here assign the image to the modal when the user click the enlarge link
        $('#imagemodal').modal('show'); // imagemodal is the id attribute assigned to the bootstrap modal, then i use the show function
    };

    // Adds the visual chat typing message
    chat.addTyping = function (data) {
        if (!(data.from == chatId && data.type == 'admin')) {
            data.typing = true;
            data.message = 'is typing';
            chat.addMessage(data, {fade: true, init: true}, data.from_id, data.from_type);
        }
    };

    // Removes the visual chat typing message
    chat.removeTyping = function (data) {
        getTypingMessages(data).fadeOut(function () {
            $(this).remove();
        });
    };

    chat.mouseover = function () {
        if (openChatButton.hasClass('button-notification')) {
            openChatButton.removeClass('button-notification');
        }
    };

    // Updates the typing event
    chat.updateTyping = function (send_to_id, send_to_type) {
        if (!typing) {
            typing = true;
            socket.emit('typing', send_to_id, send_to_type, chatId, 'admin');
        }
        lastTypingTime = (new Date()).getTime();

        setTimeout(function () {
            let typingTimer = (new Date()).getTime(),
                timeDiff = typingTimer - lastTypingTime;
            if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                socket.emit('stop typing', send_to_id, send_to_type, chatId, 'admin');
                typing = false;
            }
        }, TYPING_TIMER_LENGTH);
    };

    chat.readMessages = function (id, type) {
        chat.mouseover();
        let not_seen_messages = '#' + id + '.stream[data-id="' + type + '"] .not_seen_msg';
        if ($(not_seen_messages).length == 0) {
            not_seen_messages = '#' + id + '.chat-popup[data-id="' + type + '"] .not_seen_msg';
        }
        if ($(not_seen_messages).length > 0) {
            let viewportHeight, viewportBottom;
            if ($('#' + id + '.chat-popup[data-id="' + type + '"]').length > 0) {
                viewportHeight = $('#' + id + '.chat-popup[data-id="' + type + '"]').offset().top;
                viewportBottom = viewportHeight + $('#' + id + '.chat-popup[data-id="' + type + '"]').height();
            } else {
                viewportHeight = $('#' + id + '.stream[data-id="' + type + '"]').offset().top;
                viewportBottom = viewportHeight + $('#' + id + '.stream[data-id="' + type + '"]').height();
            }
            $(not_seen_messages).each(function () {
                let messageBottom = $(this).offset().top;
                if (viewportBottom > messageBottom) {
                    let seenId = $(this).attr('data_r');
                    socket.emit('seen', chatId, seenId, 'admin');
                    $(this).removeAttr('data_r');
                    $(this).removeClass('not_seen_msg');
                }
            });
            if ($(not_seen_messages).length == 0) {
                $('.chat_container .mesg-peple>ul>li>a[data-brand="' + id + '"][href="' + type + '"]').parent('li').removeClass('unread um');
            }
        }
    };

    chat.openConversation = function (element, chat_box = false) {
        let _id, _group_id, msg_box;
        if (typeof element.attr('data-brand') !== 'undefined') {
            _id = element.attr('data-brand');
            _group_id = element.attr('href');
        } else {
            _id = element.attr('id');
            _group_id = element.attr('href');
        }
        if ($('#' + _id + '.stream[data-id="' + _group_id + '"]').find('.mesge-area').length > 0 || $('#' + _id + '.chat-popup[data-id="' + _group_id + '"]').find('.mesge-area').length > 0) {
            return;
        }
        if (!chat_box) {
            if (element.closest('.chat_container').hasClass(chatBox1)) {
                chat_box = chatBox1;
            } else {
                chat_box = chatBoxWindow;
            }
            msg_box = element.closest('.chat_container').find('.stream');
            if (!msg_box.hasClass('active fade show')) {
                msg_box.addClass('active fade show');
            }
        } else {
            msg_box = $('.' + chat_box);
            if (!msg_box.hasClass('popup-box-on')) {
                msg_box.addClass('popup-box-on');
            }
        }
        chat_id[chat_box] = _id;
        group_id[chat_box] = _group_id;
        msg_box.attr('id', chat_id[chat_box]);
        msg_box.attr('data-id', group_id[chat_box]);
        sessionStorage.setItem(chat_box, chat_id[chat_box]);
        sessionStorage.setItem("brand" + chat_box, group_id[chat_box]);
        scroll_load_msg[chat_id[chat_box] + "/" + group_id[chat_box]] = 0;
        chat.loadMessages(chat_id[chat_box], group_id[chat_box]);
    }

    chat.loadMessages = function (brand_id, group_id, messages_offset = 0){
        if(scroll_load_msg[brand_id + "/" + group_id] !== 1){
            socket.emit('open chat', {id: chatId, new_id: brand_id, new_type: group_id, messages_offset: messages_offset }, 'admin');
            scroll_load_msg[brand_id + "/" + group_id] = 1;
        }
    }

    chat.open = function (e) {
        if (typeof e != 'undefined') {
            e.preventDefault();
        }
        $('.chat_container').removeClass('d-none');
    };

    chat.close = function (element) {
        let chat_box;
        if (element.closest('.chat_container').hasClass(chatBox1)) {
            chat_box = chatBox1;
            $('.' + chat_box).addClass('d-none');
            $('.' + chat_box).find('.stream').attr('id', '');
        } else {
            chat_box = chatBox2;
            $('.' + chat_box).removeClass('popup-box-on');
            $('.' + chat_box).attr('id', '');
        }
        sessionStorage.removeItem(chat_box);
        sessionStorage.removeItem("brand" + chat_box);
        if (element.parent('.chat_container').attr('id') != 'undefined') {
            chat_id[chat_box] = false;
        }
    };

    chat.goToEnd = function (id, type) {
        let message_box = $('#' + id + '.stream[data-id="' + type + '"] .conversations'),
            message_area = $('#' + id + '.stream[data-id="' + type + '"] .mesge-area');
        if ($('#' + id + '.stream[data-id="' + type + '"]').length == 0) {
            message_box = $('#' + id + '.chat-popup[data-id="' + type + '"] .conversations'),
                message_area = $('#' + id + '.chat-popup[data-id="' + type + '"] .mesge-area');
        }
        if (message_box.length > 0) {
            message_area.animate({scrollTop: message_box[0].scrollHeight}, 1000);
        }
    };

    // Socket events
    socket.on('online', function (data) {
        let result = JSON.parse(data.result);
        if (result.chats.groups) {
            for (key in result.chats.groups) {
                $groups[result.chats.groups[key]['id']] = result.chats.groups[key];
                $("div.editGroups").append('<a class="btn text-dark dropdown-item" data-toggle="modal" data-target="#group_modal" aria-haspopup="true" aria-expanded="false" id="' + result.chats.groups[key]['id'] + '" disabled="true">' + result.chats.groups[key]['name'] + '</a>');
            }
        }
        $online = data.online;
        $chats = result.chats;
        username = escapeHtml(result.name);
        $id = result.id;
        $type = result.type;
        invertColors = sessionStorage.getItem('invertColors');
        if (invertColors == 1) {
            $('#invertColors').addClass('active')
            $('.chat_container').addClass('inverted_colors')
            $('#chat_window').addClass('inverted_colors')
            $('.chat_modal').addClass('inverted_colors')
        }
        muteNotifications = sessionStorage.getItem('muteNotifications');
        if (muteNotifications == 1) {
            $('#muteNotifications').addClass('active')
        }
        if ($(".msg-pepl-list>li").length == 0) {
            chat.listChats();
        } else {
            let chat_container = $(".chat_container .mesg-peple>ul>li");
            let online_icon = chat_container.children("a[href$='" + data.type.charAt(0) + data.id + "']").find("figure>span"),
                user_line = chat_container.children("a[href$='" + data.type.charAt(0) + data.id + "']").parent('li');
            if (online_icon.hasClass('f-off')) {
                online_icon.removeClass('f-off');
                online_icon.addClass('f-online');
                user_line.addClass('on');
                user_line.removeClass('off');
            }
        }
        let url = new URL(window.location.href);
        let brand = url.searchParams.get("b"),
            group = url.searchParams.get("g");
        if (group != null && brand != null) {
            $("." + chatBoxWindow + " .mesg-peple>ul>li>a[data-brand='" + brand + "'][href='" + group + "']").click();
        } else {
            if (sessionStorage.getItem(chatBox1) != null) {
                $(openChatButton).click();
                $("." + chatBox1 + " .mesg-peple>ul>li>a[data-brand='" + sessionStorage.getItem(chatBox1) + "'][href='" + sessionStorage.getItem('brand' + chatBox1) + "']").click();
            }
            if (sessionStorage.getItem(chatBox2) != null) {
            }
            if (sessionStorage.getItem(chatBoxWindow) != null) {
                $("." + chatBoxWindow + " .mesg-peple>ul>li>a[data-brand='" + sessionStorage.getItem(chatBoxWindow) + "'][href='" + sessionStorage.getItem('brand' + chatBoxWindow) + "']").click();
            }
        }
    });

    window.addEventListener("beforeunload", function (e) {
        socket.emit('custom disconnect', chatId, 'admin');
    }, false);

    // Whenever the server emits 'offline', log it in the chat body
    socket.on('offline', function (data) {
        // sessionStorage.clear();
        $online = data.online;
        let online_icon = $("a[href$='" + data.type.charAt(0) + data.id + "']>figure>span"),
            user_line = $("a[href$='" + data.type.charAt(0) + data.id + "']").parent('li');
        if (online_icon.hasClass('f-online')) {
            online_icon.removeClass('f-online');
            online_icon.addClass('f-off');
            user_line.addClass('off');
            user_line.removeClass('on');
        }
    });

    socket.on('start chat', function (data) {
        let $messages = $('#' + data.new_id + '.stream[data-id="' + data.new_type + '"]').find('.mesge-area'),
            obj = jQuery.parseJSON(data.result),
            prepend = false;
        if ($messages.length == 0) {
            $messages = $('#' + data.new_id + '.chat-popup[data-id="' + data.new_type + '"]').find('.mesge-area');
        }
        if(obj.messages_offset == 0){
            changeChatHeader(data.new_id, data.new_type, obj.chatInfo);
            $messages.find('.conversations').text('');
        }else{
            prepend = true;
        }
        if (obj.msg != false) {
            $messages.find('.conversations').removeClass('d-none');
            $messages.find('.empty-chat').addClass('d-none');
            obj.msg.forEach(function (element) {
                let incomming = false;
                if (!(element.sender_id == $id && element.sender_type == $type)) {
                    incomming = true;
                }
                chat.addMessage(element, {incomming: incomming, id: obj.id, prepend: prepend}, data.new_id, data.new_type);
            });
            if(obj.messages_offset == 0) {
                let first_unseen_mesg = $('#' + data.new_id + '.stream[data-id="' + data.new_type + '"] .conversations li.not_seen_msg');
                if (first_unseen_mesg == 'undefined') {
                    first_unseen_mesg = $('#' + data.new_id + '.chat-popup[data-id="' + data.new_type + '"] .conversations li.not_seen_msg');
                }
                if (first_unseen_mesg.length > 0) {
                    $messages.animate({
                        scrollTop: first_unseen_mesg.offset().top - $messages.offset().top + $messages.scrollTop()
                    });
                } else {
                    chat.goToEnd(data.new_id, data.new_type);
                }
            }
            scroll_load_msg[data.new_id + "/" + data.new_type] = 0;
        } else {
            if(obj.messages_offset == 0) {
                $messages.find('.empty-chat').removeClass('d-none');
                $messages.find('.conversations').addClass('d-none');
            }
            scroll_load_msg[data.new_id + "/" + data.new_type] = 1;
        }
    });

    // Adds the notifications of incoming messages
    chat.addNotification = function (data) {
        data.sent = data.result.sent;
        data.message = escapeHtml(data.result.message);
        if (!($('.list_notifications>a#' + data.from_id + '.show-mesg[href="' + data.from_type + '"]').length > 0)) {
            let notificationView = chatGenerateNotifications(data),
                notificationsNum = $('#chat_notifications .count_notifications').text();
            $('#chat_notifications .count_notifications').text(parseInt(notificationsNum) + 1);
            $('#chat_notifications .list_notifications').prepend(notificationView);
        }
    };

    socket.on('new message', function (data) {
        if (typeof data.from_id == 'undefined' && typeof data.from_id == 'undefined') {
            data.result.from = data.result.sender_type.charAt(0) + data.result.sender_id;
            chat.addMessage(data.result, {init: true}, data.to_id, data.to_type);
        } else {
            if (typeof data.group != 'undefined') {
                data.from = data.group;
            }
            $chat_list_items = $('a[href="' + data.from_type + '"][data-brand="' + data.from_id + '"]').parent("li");
            $chat_list_items.each(function ($chat_list_index) {
                $($(this).parent('ul')).prepend($(this));
                $(this).addClass('unread um');
                $(this).children("a").find("div.user-name>span").text(data.result.message);
            });
            if ($('#' + data.from_id + '.stream[data-id="' + data.from_type + '"] .conversations').length > 0) {
                chat.addMessage(data.result, {incomming: true, init: true, id: $id}, data.from_id, data.from_type);
            } else {
                chat.addNotification(data);
            }
            if (muteNotifications != 1) {
                $('#chatAudio')[0].play();
            }
        }
    });

    socket.on('typing', function (data) {
        chat.addTyping(data);
    });

    socket.on('stop typing', function (data) {
        chat.removeTyping(data);
    });

    // *** GROUP START ***
    socket.on('participants', function (data) {
        let obj = jQuery.parseJSON(data.result);
        $('#group_users_list>#group_participants').html('');
        $('#group_users_list>#group_users').html('');
        if($('table.editChatGroupSchedule input.working_time').hasClass('off')){
            $('table.editChatGroupSchedule th.working_time_header').removeClass('off');
            $('table.editChatGroupSchedule input.working_time').removeClass('off');
            $('table.editChatGroupSchedule th.working_time_header').addClass('on');
            $('table.editChatGroupSchedule input.working_time').addClass('on');
        }
        obj.users.forEach(function (user) {
            let info = '';
            if (user.type == 'user') {
                let url = "window.open('" + window.location.origin + '/brand?owner=' + user.id + "')";
                info = '<button data-clicked="no" title="Go to user brands info" type="button" class="btn btn-dark btn-group btn-sm" ' +
                    'onclick="$(this).data(\'clicked\', \'yes\');' + url + '">' +
                    '<i class="mdi mdi-plus text-white"><i>User Info</i></i>' +
                    '</button>';
            }
            $('#group_users_list>#group_users').append('<a href="' + user.id + '" data-type="' + user.type + '" >' + escapeHtml(user.name) + info + '</a>');
        });
        if (data.groupId != false) {
            if (obj.participants) {
                obj.participants.forEach(function (participant) {
                    let $added_user = $("#group_users_list>#group_users a[href='" + participant.user_id + "']");
                    if ($added_user.length > 0 && $added_user.attr('data-type') == participant.type) {
                        $added_user.remove();
                    }
                    $('#group_users_list>#group_participants').append('<a href="' + participant.user_id + '" data-type="' + participant.type + '" >' + escapeHtml(participant.name) + '</a>');
                });
            }
            if (obj.working_time) {
                jQuery.parseJSON(obj.working_time[0].working_time).forEach(function (time) {
                    if (time.time == '') {
                        if($('table.editChatGroupSchedule input.working_time[name="' + time.type + '"]').hasClass('on')){
                            $('table.editChatGroupSchedule th.working_time_header[data-name="' + time.type + '"]').removeClass('on');
                            $('table.editChatGroupSchedule input.working_time[name="' + time.type + '"]').removeClass('on');
                        }
                        $('table.editChatGroupSchedule th.working_time_header[data-name="' + time.type + '"]').addClass('off');
                        $('table.editChatGroupSchedule input.working_time[name="' + time.type + '"]').addClass('off');
                    } else {
                        $('table input[name="' + time.type + '"]').val(time.time);
                    }
                });
                $("#group_name").val(obj.working_time[0].name);
                $("#group_description").val(obj.working_time[0].description);
                $("#group_modal").attr('data-id', data.groupId);
            }
        } else {
            $("#group_name").val('');
            $("#group_description").val('');
            $("#group_modal").attr('data-id', '');
        }
    });

    socket.on('group', function (data) {
        $('#group_modal').modal('hide');
        // let newChat = chatGenerateView({id: data.result, name: data.data.group.name, type: 'group'}, '');
        // $(".chat_container .mesg-peple>ul").prepend(newChat);
    });

    //update chat group info and participants
    chat.changeGroup = function ($delete = 0) {
        let new_users = [],
            deleted_users = [],
            working_time = [],
            group = {
                delete: $delete,
                name: $("div.chat_modal#group_modal #group_name").val(),
                id: $('div.chat_modal#group_modal').attr('data-id'),
                description: $("div.chat_modal#group_modal #group_description").val()
            };
        $('#group_users_list>#group_participants>a').each(function (row) {
            new_users[row] = {type: $(this).attr("data-type"), id: $(this).attr("href")};
        });
        $('#group_users_list>#group_users>div.deleted>a').each(function (row) {
            deleted_users[row] = {type: $(this).attr("data-type"), id: $(this).attr("href")};
        });
        $('#group_modal table td>label>input').each(function (row) {
            if ($(this).hasClass('off')) {
                working_time[row] = {type: $(this).attr("name"), time: ''};
            } else {
                working_time[row] = {type: $(this).attr("name"), time: $(this).val()};
            }
        });
        socket.emit('group', chatId, group, new_users, deleted_users, working_time, 'admin');
    };

    chat.listParticipants = function (groupId = false) {
        socket.emit('participants', chatId, groupId, 'admin');
    };

    //add participant to chat group
    chat.addParticipats = function (element) {
        $("#group_users_list>#group_participants").append(element);
    };

    //remove participant from chat group
    chat.removeParticipats = function (element) {
        if (!$("#group_users_list>#group_users>.deleted").length > 0) {
            $("#group_users_list>#group_users").append('<div class="deleted"></div>')
        }
        $("#group_users_list>#group_users>.deleted").append(element);
    };
    // *** GROUP END ***
    // *** SUPPORT CASES START ***
    chat.supportCase = function (group_id, brand_id, merchant_id, msg_content = '', msg_id = '') {
        let modal_body = $('#support_case_modal .modal-body');
        $.ajax({
            url: window.location.origin + "/support/supportCaseFromChat",
            type: "POST",
            data: {
                group_id: group_id,
                brand_id: brand_id,
                merchant_id: merchant_id
            },
            success: function (data) {
                modal_body.find($('div:not([d-none])')).addClass('d-none');
                try {
                    JSON.parse(data);
                } catch (e) {
                    if (modal_body.find($('.errorCase'))) {
                        modal_body.find($('.errorCase')).removeClass('d-none');
                    }
                    return;
                }
                let obj = jQuery.parseJSON(data),
                    fill_data = 0;
                switch (obj.action) {
                    case 'create':
                        fill_data = 1;
                        if (modal_body.find($('.createCase'))) {
                            modal_body.find($('.createCase')).removeClass('d-none');
                        }
                        modal_body.find($('.dataCase textarea')).attr("disabled", false);
                        modal_body.find($('.dataCase select')).attr("disabled", false);
                        break;
                    case 'close':
                        fill_data = 2;
                        if (modal_body.find($('.closeCase'))) {
                            modal_body.find($('.closeCase')).removeClass('d-none');
                        }
                        modal_body.find($('.dataCase textarea')).attr("disabled", true);
                        modal_body.find($('.dataCase select')).attr("disabled", true);
                        break;
                    case 'error1':
                        if (modal_body.find($('.errorCase1'))) {
                            modal_body.find($('.errorCase1')).removeClass('d-none');
                        }
                        break;
                    default:
                        if (modal_body.find($('.errorCase'))) {
                            modal_body.find($('.errorCase')).removeClass('d-none');
                        }
                }
                if(fill_data > 0){
                    if (modal_body.find($('.dataCase'))) {
                        modal_body.find($('.dataCase')).removeClass('d-none');
                    }
                    if(fill_data == 1){
                        modal_body.attr('data-case', '');
                        modal_body.attr('data-id', msg_id);
                        modal_body.attr('data-brand', brand_id);
                        modal_body.attr('data-group', group_id);
                        modal_body.attr('data-merchant', merchant_id);
                        modal_body.find('.dataCase .summary>textarea').text(msg_content);
                        modal_body.find(".dataCase .status").parent("tr").show();
                        modal_body.find(".dataCase .topic").parent("tr").show();
                        obj.supportStatusCases.forEach(function (status) {
                            modal_body.find(".dataCase .status>select").append('<option value="' + status.support_case_status_id + '">' + status.name + '</option>');
                        })
                        obj.supportTopics.forEach(function (topic) {
                            modal_body.find(".dataCase .topic>select").append('<option value="' + topic.support_topic_id + '">' + topic.name + '</option>');
                        })
                    }else if(fill_data == 2){
                        modal_body.attr('data-brand', '');
                        modal_body.attr('data-group', '');
                        modal_body.attr('data-merchant', '');
                        modal_body.attr('data-id', msg_id);
                        modal_body.attr('data-case', obj.case.support_case_id);
                        modal_body.find('.dataCase .summary>textarea').text(msg_content);
                        modal_body.find(".dataCase .status").parent("tr").hide();
                        modal_body.find(".dataCase .topic").parent("tr").hide();
                    }
                }
            }
        });
    }

    chat.createSupportCase = function () {
        let modal_body = $('#support_case_modal .modal-body');
        $.ajax({
            url: window.location.origin + "/support/createCaseFromChat",
            type: "POST",
            data: {
                message_id: modal_body.attr('data-id'),
                brand_id: modal_body.attr('data-brand'),
                group_id: modal_body.attr('data-group'),
                merchant_id: modal_body.attr('data-merchant'),
                summary: modal_body.find('.dataCase .summary>textarea').val(),
                comment: modal_body.find('.dataCase .comment>textarea').val(),
                topic: modal_body.find('.dataCase .topic>select>option:selected').val(),
                status: modal_body.find('.dataCase .status>select>option:selected').val()
            },
            success: function (data) {
                if(data){
                    $('#support_case_modal').modal('hide');
                }
            }
        });
    };

    chat.closeSupportCase = function () {
        let modal_body = $('#support_case_modal .modal-body');
        $.ajax({
            url: window.location.origin + "/support/closeCaseFromChat",
            type: "POST",
            data: {
                message_id: modal_body.attr('data-id'),
                case_id: modal_body.attr('data-case'),
            },
            success: function (data) {
                if(data){
                    $('#support_case_modal').modal('hide');
                }
            }
        });
    };
    // *** SUPPORT CASES END ***
});