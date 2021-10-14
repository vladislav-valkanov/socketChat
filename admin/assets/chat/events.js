$(function () {
    let inputMessage = ".message-writing-box input", // Input message input box
        messages = ".stream", // Messages area
        sendButton = ".send_msg", // Send Button
        chat_container = ".chat_container";

    function sendMessage($this, e) {
        e.preventDefault();
        let id = $this.closest('.chat_container').find('.stream').attr('id'),
            type = $this.closest('.chat_container').find('.stream').attr('data-id'),
            message = '';
        if (typeof id == 'undefined') {
            id = $this.closest('.chat_container').attr('id');
            type = $this.closest('.chat_container').attr('data-id');
        }
        if ($('#' + id + '.stream[data-id="' + type + '"]').length > 0) {
            message = $('#' + id + '.stream[data-id="' + type + '"] .message-writing-box .message_box').val();
            $('#' + id + '.stream[data-id="' + type + '"] .message-writing-box .message_box').val('');
        } else {
            message = $('#' + id + '.chat-popup[data-id="' + type + '"] .message-writing-box .message_box').val();
            $('#' + id + '.chat-popup[data-id="' + type + '"] .message-writing-box .message_box').val('');
        }
        if(message != '') {
            chat.sendMessage(id, type, message);
            chat.goToEnd(id, type);
        }
    }

    // Key events
    $(inputMessage).keypress(inputMessage, function (e) {
        if (e.key == 'Enter') {
            sendMessage($(this), e);
        }
    });

    $(document).on('click', sendButton, function (e) {
        sendMessage($(this), e);
    });

    $(document).on('change', '#add_file', function (e) {
        e.preventDefault();
        let id = $(this).closest('.chat_container').find('.stream').attr('id'),
            type = $(this).closest('.chat_container').find('.stream').attr('data-id');
        if (typeof id == 'undefined') {
            id = $(this).closest('.chat_container').attr('id');
            type = $(this).closest('.chat_container').attr('data-id');
        }
        chat.uploadImage(this, id, type);
    });

    $(document).on("click", "#btn-support_chat", function () {
        chat.open();
    });

    $(document).on('click', '.img_pop', function () {
        // let id = $(this).parent('.stream').attr('id');
        chat.showImage($(this));
    });

    $(document).on("click", ".close-chat", function () {
        chat.close($(this));
    });

    $(document).on('input', inputMessage, function () {
        let id, type;
        if ($(this).closest('.chat_container').find('.stream').attr('id') > 0) {
            id = $(this).closest('.chat_container').find('.stream').attr('id');
            type = $(this).closest('.chat_container').find('.stream').attr('data-id');
        } else {
            id = $(this).closest('.chat_container').attr('id');
            type = $(this).closest('.chat_container').attr('data-id');
        }
        chat.updateTyping(id, type);
    });

    function readMessage(element){
        let id = element.attr('id'),
            type = element.attr('data-id');
        if(typeof id == 'undefined' && typeof type == 'undefined'){
            id = $(element).parent('.chat-popup').attr('id')
            type = $(element).parent('.chat-popup').attr('data-id');
        }
        chat.readMessages(id, type);
    }

    $(document).on('wheel', messages, function () {
        readMessage($(this));
    });

    $(document).on('mouseover', messages, function () {
        readMessage($(this));
    });

    //search chats
    $(document).on("input", ".message-people-srch>form>input", function () {
        let search = $(this).val(),
            list = $(this).closest('.message-users').find('.mesg-peple>ul>li');
        list.each(function () {
            if (!$(this).find('.user-name h6').text().includes(search)) {
                if (!$(this).hasClass('d-none')) {
                    $(this).addClass('d-none');
                }
            } else {
                if ($(this).hasClass('d-none')) {
                    $(this).removeClass('d-none');
                }
            }
        });
    });

    //load chat

    //loading previous messages
    $(document).on('wheel', "ul.conversations", function () {
        let $this = $(this).closest($('.mesge-area'));
        if($this[0].scrollTop <= 200){
            let offset = $(this).children('li').length;
            chat.loadMessages($this.closest('.stream').attr('id'), $this.closest('.stream').attr('data-id'), offset);
        }
    });

    //append to group users
    $(document).on("click", "#add_users_list>#add_admins>.chat_with, #add_users_list>#add_users>.chat_with", function (e) {
        e.preventDefault();
        chat.addParticipats($(this));
    });

    $(document).on("click", "#group_users_list>#group_admins>.chat_with, #group_users_list>#group_users>.chat_with", function (e) {
        e.preventDefault();
        chat.addParticipats($(this));
    });

    $(document).on("click", "#group_users_list>#group_participants>a", function (e) {
        e.preventDefault();
        if ($(this).children('button').data('clicked') == 'yes') {
            $(this).children('button').data('clicked', 'no');
        } else {
            chat.removeParticipats($(this));
        }
    });

    $(document).on("click", "#group_users_list>#group_users>a", function (e) {
        e.preventDefault();
        if ($(this).children('button').data('clicked') == "yes") {
            $(this).children('button').data('clicked', 'no');
        } else {
            chat.addParticipats($(this));
        }
    });

    //load chat
    $(document).on("click", ".mesg-peple>ul>li>a", function (e) {
        e.preventDefault();
        chat.openConversation($(this));
    });

    $(document).on("click", "#chat_notifications .list_notifications>a", function (e) {
        e.preventDefault();
        chat.openConversation($(this), 'chat-popup');
        $(this).remove();
        $('#chat_notifications .count_notifications').text($('#chat_notifications .count_notifications').text() - 1);
    });

    //create or edit group
    $(document).on("click", "#change_group", function () {
        chat.changeGroup();
    });

    //delete group
    $(document).on("click", "#delete_group", function () {
        chat.changeGroup(1);
    });

    //call the view to create group
    $(document).on("click", ".chat_container .add-group>button", function () {
        chat.listParticipants();
    });

    //call the view to edit group
    $(document).on("click", ".chat_container div.editGroups>a", function () {
        chat.listParticipants($(this).attr('id'));
    });

    //mute/unmute notifications
    $(document).on("click", "#muteNotifications", function () {
        chat.muteNotifications();
    });

    //invert colors
    $(document).on("click", "#invertColors", function () {
        chat.invertColors();
    });

    //turn off/on working days
    $(document).on("click", 'table.editChatGroupSchedule th.working_time_header', function () {
        let day_id = $(this).attr('data-name');
        $(this).toggleClass('off');
        $('table.editChatGroupSchedule input.working_time[name="' + day_id + '"]').toggleClass('off');
        $('table.editChatGroupSchedule input.working_time[name="' + day_id + day_id + '"]').toggleClass('off');
    });

    $('.chat_container .minify').on("click", function () {
        if ($(this).children('button>i').hasClass('mdi-window-maximize')) {
            $(this).children('button>i').addClass('mdi-window-minimize');
            $(this).children('button>i').removeClass('mdi-window-maximize');
            $(this).closest('.chat_container').css('height', '');
            $(this).closest('.chat_container').css('min-height', '415px');
        } else {
            $(this).children('button>i').addClass('mdi-window-maximize');
            $(this).children('button>i').removeClass('mdi-window-minimize');
            $(this).closest('.chat_container').css('height', '45px');
            $(this).closest('.chat_container').css('min-height', '0px');
        }
    });

    //support cases start
    $(document).on("click", '#support_case_modal #createSupportCaseFromChat', function () {
        chat.createSupportCase();
    });
    $(document).on("click", '#support_case_modal #closeSupportCaseFromChat', function () {
        chat.closeSupportCase();
    });
    //support cases end
});