/**
 * @constant
 */
let chat = {};
let listChatBrands = false;

$(function () {
    let FADE_TIME = 50; // ms
    let TYPING_TIMER_LENGTH = 500; // ms

    // Initialize variables
    let socket = io(chatUrl + ':' + chatPort, {secure: true}),
        working_time = [],
        username,
        $id,
        $type,
        typing = false,
        lastTypingTime,
        chat_id = [],
        group_id = [],
        invertColors = false,
        muteNotifications = false,
        $chats = [],
        $online = [],
        chatBox1 = 'fast_chat',
        chatBox2 = 'chat-popup',
        chatBoxWindow = 'chat_window',
        scroll_load_msg = [];

    socket.emit('add user', chatId);
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

    function chatGenerateNotifications(chat) {
        let from_type, from_id;
        if (chat.from_type && chat.from_id) {
            from_type = chat.from_type;
            from_id = chat.from_id;
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

    function getCurrentTime() {
        let dateCreate = Date.now(),
            dateNow = new Date(dateCreate),
            formatDate = [];
        formatDate.hours = dateNow.getHours();
        formatDate.minutes = dateNow.getMinutes();
        formatDate.seconds = dateNow.getSeconds();
        formatDate.day = dateNow.getDay();
        if(formatDate.day == 0){
            formatDate.day = 7;
        }
        return formatDate;
    }

    let weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    function getWorkingTime(_working_time) {
        let current_time = getCurrentTime(),
            onlineStatus = "Offline",
            $working_time_info = '<i class="working_time_info alert alert-dark"><ul>';
        if(_working_time[current_time.day - 1].time != ''){
            let today_hours_start = _working_time[current_time.day - 1].time.split(':')[0],
                today_minnutes_start = _working_time[current_time.day - 1].time.split(':')[1].split(" ")[0],
                today_hours_end = _working_time[current_time.day + 6].time.split(':')[0],
                today_minnutes_end = _working_time[current_time.day + 6].time.split(':')[1].split(" ")[0];
            if(_working_time[current_time.day - 1].time.split(':')[1].split(" ")[1] == 'PM'){
                if(today_hours_start != 12) {
                    today_hours_start = parseInt(today_hours_start) + 12;
                }
            }else if(today_hours_start == 12){
                today_hours_start = 0;
            }
            if(_working_time[current_time.day + 6].time.split(':')[1].split(" ")[1] == 'PM'){
                if(today_hours_end != 12){
                    today_hours_end = parseInt(today_hours_end) + 12;
                }
            }else if(today_hours_end == 12){
                today_hours_end = 24;
            }
            if(parseInt(today_hours_start) < parseInt(current_time.hours) && parseInt(current_time.hours) < parseInt(today_hours_end)){
                onlineStatus = "Online";
            }
            if(parseInt(current_time.minutes) > parseInt(today_minnutes_start)
                && parseInt(current_time.minutes) < parseInt(today_minnutes_end)){
                onlineStatus = "Online";
            }
        }

        _working_time.forEach(function (time, index){
            if(!(time.type > 7)){
                let full_time = time.time + " - " + _working_time[parseInt(index) + 7].time;
                if(time.time == ''){
                    full_time = "<i style='margin-top:-13px;color:red'>NOT WORKING</i>";
                }
                $working_time_info += '<li>' + weekdays[index] + ': <text>' +  full_time + '</text></li>';
            }
        });
        $working_time_info += '</ul></i>';

        return [$working_time_info, onlineStatus];
    }

    chat.listChats = function () {
        let obj = $chats;
        if (obj.chats.chatsList != false) {
            obj.chats.chatsList.forEach(function (chat) {
                if(typeof working_time[chat.id] == 'undefined'){
                    working_time[chat.id] = getWorkingTime(jQuery.parseJSON(chat.working_time));
                }
                let statusClass = "list-group-item-success";
                if(working_time[chat.id][1] == 'Offline'){
                    statusClass = "list-group-item-danger";
                }
                if (listChatBrands == 1) {
                    $("#listChats>span").removeClass('mdi-arrow-down-bold');
                    $("#listChats>span").addClass('mdi-arrow-up-bold');
                }
                if ($('li.nav-item>a[href="' + chat.brand_id + '"]').length == 0) {
                    let listBrands = 'd-none';
                    if(listChatBrands == 1){
                        listBrands = '';
                    }
                    let chatView = '<li class="nav-item">' +
                        '<a href="' + chat.brand_id + '" style="padding: 1px 15px;">' +
                        '<figure>' +
                        '<span class="status f-online"></span>' +
                        '</figure>' +
                        '<div class="user-name">' +
                        '<h6 class="">' + escapeHtml(chat.brand_name) + '</h6>' +
                        '</div>' +
                        '</a>' +
                        '<div class="brand_groups ' + listBrands     + '">' +
                        '<button class="btn list-group-item-action ' + statusClass + ' btn-block" value="' + chat.id + '">' + '<i class="mdi mdi-timetable">' + working_time[chat.id][0] + '</i>' + chat.title  + '</button>'  +
                        '</div>' +
                        '</li>';
                    $('.msg-pepl-list').append(chatView);
                } else {
                    $('li.nav-item>a[href="' + chat.brand_id + '"]').parent('li').children('.brand_groups').append('<button class="btn list-group-item-action ' + statusClass + ' btn-block" value="' + chat.id + '">' + '<i class="mdi mdi-timetable">' + working_time[chat.id][0] + '</i>' + chat.title + '</button>');
                }
            });
        }
    };

    chat.listParticipants = function (groupId = false) {
        socket.emit('participants', chatId, groupId);
    };

    chat.muteNotifications = function () {
        if (sessionStorage.getItem('customerMuteNotifications') != 1) {
            sessionStorage.setItem('customerMuteNotifications', 1);
            muteNotifications = 1;
            if (!$("#muteNotifications").hasClass('active')) {
                $("#muteNotifications").addClass('active');
            }
        } else {
            sessionStorage.removeItem('customerMuteNotifications')
            muteNotifications = 0;
            if ($("#muteNotifications").hasClass('active')) {
                $("#muteNotifications").removeClass('active');
            }
        }
    };

    chat.invertColors = function () {
        if (sessionStorage.getItem('customerInvertColors') != 1) {
            sessionStorage.setItem('customerInvertColors', 1);
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
            sessionStorage.removeItem('customerInvertColors')
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

    chat.listChatBrands = function () {
        if (sessionStorage.getItem('customerListChatBrands') != 1) {
            sessionStorage.setItem('customerListChatBrands', 1);
            listChatBrands = 1;
            if ($(".mesg-peple .brand_groups").hasClass('d-none')) {
                $($(".mesg-peple .brand_groups")).removeClass('d-none');
            }
            if ($("#listChats>span").hasClass('mdi-arrow-down-bold')) {
                $("#listChats>span").removeClass('mdi-arrow-down-bold');
                $("#listChats>span").addClass('mdi-arrow-up-bold');
            }
        } else {
            sessionStorage.removeItem('customerListChatBrands')
            listChatBrands = 0;
            if (!$(".mesg-peple .brand_groups").hasClass('d-none')) {
                $($(".mesg-peple .brand_groups")).addClass('d-none');
            }
            if ($("#listChats>span").hasClass('mdi-arrow-up-bold')) {
                $("#listChats>span").addClass('mdi-arrow-down-bold');
                $("#listChats>span").removeClass('mdi-arrow-up-bold');
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

    // function refreshChats(id, message) {
    //     if(typeof $('.' + chatBoxWindow) != 'undefined'){
    //         let chat1 = $("." + chatBoxWindow + ".chat_container .mesg-peple>ul>li");
    //         chat1.children("a[href='" + id + "']").parent('li').addClass("um unread");
    //         chat1.children("a[href='" + id + "']").find("div.user-name>span").text(message);
    //         $("." + chatBoxWindow + ".chat_container .mesg-peple>ul").prepend(chat1.children("a[href='" + id + "']").parent("li"));
    //     }
    //     let chat = $("." + chatBox1 + ".chat_container .mesg-peple>ul>li");
    //     chat.children("a[href='" + id + "']").parent('li').addClass("um unread");
    //     chat.children("a[href='" + id + "']").find("div.user-name>span").text(message);
    //     $("." + chatBox1 + ".chat_container .mesg-peple>ul").prepend(chat.children("a[href='" + id + "']").parent("li"));
    // }

    function changeChatHeader(id, type, data) {
        $('#' + id + '.stream[data-id="' + type + '"]').find('.active-user h6').text(escapeHtml(data.name));
        let status = working_time[type][1];
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
                let info = '';
                if(typeof working_time[type] != 'undefined'){
                    info = '<i class="mdi mdi-timetable">' + working_time[type][0];
                }
                $('#' + id + '.stream[data-id="' + type + '"] .active-user>div>span>small')
                    .html(status + ' / <b class="text-info"> <i class="mdi mdi-account-group text-info"></i> ' + group_type + '</b>' + info);
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
        let name = $('#' + send_to_id + '.stream[data-id="' + send_to_type + '"] .text-info').text() + ' - (' + $('#' + send_to_id + '.stream[data-id="' + send_to_type + '"] .active-user h6').text();
        message = cleanInput(message);
        typing = false;
        socket.emit('stop typing', send_to_id, send_to_type, chatId);
        socket.emit('add message', message, 'text', send_to_id, send_to_type, name, chatId);
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
                    socket.emit('add message', obj, 'image', send_to_id, send_to_type, name, chatId);
                }
            }
        });
    };

    // Adds the visual chat message to the message list
    chat.addMessage = function (data, options, id, type) {
        // Don't fade the message in if there is an 'X was typing'
        let $typingMessages = getTypingMessages(data);
        options = options || {};
        if (options.fade) {
            $typingMessages.remove();
        }
        let $usernameDiv = '',
            msg_content = '',
            $messageBodyDiv = '';
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
                '<span><i class="ti-check"></i><i class="ti-check"></i>' + $usernameDiv + '</span>' +
                '</div>' +
                '</li>');
        } else {
            if (data.msg_type == 'image') {
                msg_content = '<a href="#" class="img_pop"><img alt="image message" src="' + data.message + '"></a>';
            } else if (data.msg_type == 'text') {
                msg_content = data.message;
            }
            $messageBodyDiv = $('<li class="me">' +
                '<div class="text-box">' +
                '<p>' + msg_content + '</p>' +
                '<span><i class="ti-check"></i><i class="ti-check"></i>' + data.sent + '</span>' +
                '</div>' +
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
        if(!(data.from == chatId && data.type == 'user')){
            data.typing = true;
            data.message = 'is typing';
            chat.addMessage(data, {fade: true, init:true}, data.from_id, data.from_type);
        }
    };

    // Removes the visual chat typing message
    chat.removeTyping = function (data) {
        getTypingMessages(data).fadeOut(function () {
            $(this).remove();
        });
    };

    // Updates the typing event
    chat.updateTyping = function (send_to_id, send_to_type) {
        if (!typing) {
            typing = true;
            socket.emit('typing', send_to_id, send_to_type, chatId);
        }
        lastTypingTime = (new Date()).getTime();

        setTimeout(function () {
            let typingTimer = (new Date()).getTime(),
                timeDiff = typingTimer - lastTypingTime;
            if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                socket.emit('stop typing', send_to_id, send_to_type, chatId);
                typing = false;
            }
        }, TYPING_TIMER_LENGTH);
    };

    chat.readMessages = function (id, type) {
        if ($('#' + id + '.stream[data-id="' + type + '"] .not_seen_msg').length > 0) {
            let viewportHeight = $('#' + id + '.stream[data-id="' + type + '"]').offset().top,
                viewportBottom = viewportHeight + $('#' + id + '.stream[data-id="' + type + '"]').height();
            $('#' + id + '.stream[data-id="' + type + '"] .not_seen_msg').each(function () {
                let messageBottom = $(this).offset().top;
                if (viewportBottom > messageBottom) {
                    // let chat = $(".chat_container .mesg-peple>ul>li");
                    // chat.children("a[href='" + id + "']").parent('li').removeClass("um unread");
                    let seenId = $(this).attr('data_r');
                    socket.emit('seen', chatId, seenId);
                    $(this).removeAttr('data_r');
                    $(this).removeClass('not_seen_msg');
                }
            });
        }
    };

    chat.openConversation = function (element, chat_box = false) {
        let msg_box;
        if (!chat_box) {
            if (element.attr('href') != 'undefined') {
                msg_box = $('.chat_container').find('.stream');
            } else {
                msg_box = element.closest('.chat_container').find('.stream');
            }
            let url = window.location.href;
            if ($('.chat_container').hasClass('d-none') && url.search('/chat/window') < 0) {
                $('.chat_container').removeClass('d-none')
            }
            if (element.closest('.chat_container').hasClass(chatBox1)) {
                chat_box = chatBox1;
            } else {
                chat_box = chatBoxWindow;
            }
            if (!msg_box.hasClass('active fade show')) {
                msg_box.addClass('active fade show');
                element.closest('.chat_container').find('.no-stream').removeClass('active fade show');
            }
        } else {
            msg_box = $('.' + chat_box);
            if (!msg_box.hasClass('popup-box-on')) {
                msg_box.addClass('popup-box-on');
            }
        }
        if (typeof element.attr('href') !== 'undefined') {
            chat_id[chat_box] = element.attr('id');
            group_id[chat_box] = element.attr('href');
        } else {
            chat_id[chat_box] = element.closest('li.nav-item').children('a').attr('href');
            group_id[chat_box] = element.val();
        }
        msg_box.attr('id', chat_id[chat_box]);
        msg_box.attr('data-id', group_id[chat_box]);
        sessionStorage.setItem("customerChat", group_id[chat_box]);
        sessionStorage.setItem("customerBrandChat", chat_id[chat_box]);
        scroll_load_msg[chat_id[chat_box] + "/" + group_id[chat_box]] = 0;
        chat.loadMessages(chat_id[chat_box], group_id[chat_box]);
    }

    chat.loadMessages = function (brand_id, group_id, messages_offset = 0){
        if(scroll_load_msg[brand_id + "/" + group_id] !== 1){
            socket.emit('open chat', {id: chatId, new_id: brand_id, new_type: group_id, messages_offset: messages_offset });
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
        sessionStorage.removeItem("customerChat");
        sessionStorage.removeItem("customerBrandChat");
        if (element.parent('.chat_container').attr('id') != 'undefined') {
            chat_id[chat_box] = false;
        }
    };

    chat.goToEnd = function (id, type) {
        let message_box = $('#' + id + '.stream[data-id="' + type + '"] .conversations'),
            message_area = $('#' + id + '.stream[data-id="' + type + '"] .mesge-area');
        if (typeof message_box != 'undefined') {
            message_area.animate({ scrollTop: message_box[0].scrollHeight }, 1000);
        }
    };

    // Socket events
    socket.on('online', function (data) {
        let result = JSON.parse(data.result);
        $online = data.online;
        $chats = result.chats;
        username = escapeHtml(result.name);
        $id = result.id;
        $type = result.type;
        invertColors = sessionStorage.getItem("customerInvertColors");
        if (invertColors == 1) {
            $('#invertColors').addClass('active')
            $('.chat_container').addClass('inverted_colors')
            $('#chat_window').addClass('inverted_colors')
            $('.chat_modal').addClass('inverted_colors')
        }

        listChatBrands = sessionStorage.getItem('customerListChatBrands');
        muteNotifications = sessionStorage.getItem('customerMuteNotifications');
        if (muteNotifications == 1) {
            $('#muteNotifications').addClass('active')
        }
        if ($(".msg-pepl-list>li").length == 0) {
            chat.listChats();
            let notifications = 0;
            if ($chats.chats.notices.length > 0) {
                for (notyId in $chats.chats.notices) {
                    let notificationView = chatGenerateNotifications($chats.chats.notices[notyId]);
                    $('#chat_notifications .list_notifications').append(notificationView);
                    notifications++;
                }
            }
            $('#chat_notifications .count_notifications').text(notifications);
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
        if (sessionStorage.getItem("customerChat") != null && sessionStorage.getItem("customerBrandChat") != null) {
            $(".mesg-peple>ul>li>a[href='" + sessionStorage.getItem("customerBrandChat") + "']").click();
            $(".mesg-peple>ul>li>a[href='" + sessionStorage.getItem("customerBrandChat") + "']").parent($('li.nav-item')).children("div.brand_groups").children("button[value='" + sessionStorage.getItem("customerChat") + "']").click();
        }
    });

    window.addEventListener("beforeunload", function (e) {
        socket.emit('custom disconnect', chatId);
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

    socket.on('participants', function (data) {
        let obj = jQuery.parseJSON(data.result);
        $('#group_users_list>#group_participants').html('');
        if (data.groupId != false) {
            obj.participants.forEach(function (participant) {
                $('#group_users_list>#group_participants').append('<a>' + escapeHtml(participant.name) + '</a>');
            });
            $("#group_name").text($(".fast_chat .mesg-peple>ul>li>a[href='" + data.groupId + "'] h6").text());
        }
    });

    socket.on('start chat', function (data) {
        let $messages = $('#' + data.new_id + '.stream[data-id="' + data.new_type + '"]').find('.mesge-area'),
            obj = jQuery.parseJSON(data.result),
            prepend = false;
        if('u' + $id != obj.id){
            return;
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
                if ($('#' + data.new_id + '.stream[data-id="' + data.new_type + '"] .not_seen_msg').length > 0) {
                    $messages.animate({
                        scrollTop: $('#' + data.new_id + '.stream[data-id="' + data.new_type + '"] .conversations li.not_seen_msg')
                            .offset().top - $messages.offset().top + $messages.scrollTop()
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
            // refreshChats(data.from, data.result.message);
            if ($('#' + data.from_id + '.stream[data-id="' + data.from_type + '"] .conversations').length > 0) {
                chat.addMessage(data.result, {incomming: true, init:true, id: $id}, data.from_id, data.from_type);
            }
            chat.addNotification(data);
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
});