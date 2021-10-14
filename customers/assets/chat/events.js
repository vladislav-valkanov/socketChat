$(function () {
    let inputMessage = ".message-writing-box input", // Input message input box
        messages = ".stream", // Messages area
        sendButton = ".send_msg", // Send Button
        chat_container = ".chat_container";

    function sendMessage($this, e) {
        e.preventDefault();
        let id = $this.closest('.chat_container').find('.stream').attr('id'),
            type = $this.closest('.chat_container').find('.stream').attr('data-id');
        if (typeof id == 'undefined') {
            id = $this.closest('.chat_container').attr('id');
            type = $this.closest('.chat_container').attr('data-id');
        }
        let message = $('#' + id + '.stream[data-id="' + type + '"] .message-writing-box .message_box').val();
        $('#' + id + '.stream[data-id="' + type + '"] .message-writing-box .message_box').val('');
        if(message != ''){
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
        if ($(this).closest('.chat_container').find('.stream').attr('id').length > 0) {
            id = $(this).closest('.chat_container').find('.stream').attr('id');
            type = $(this).closest('.chat_container').find('.stream').attr('data-id');
        } else {
            id = $(this).closest('.chat_container').attr('id');
            type = $(this).closest('.chat_container').attr('data-id');
        }
        chat.updateTyping(id, type);
    });

    //read new messages
    $(document).on('wheel', messages, function () {
        chat.readMessages($(this).attr('id'), $(this).attr('data-id'));
    });

    $(document).on('mouseover', messages, function () {
        chat.readMessages($(this).attr('id'), $(this).attr('data-id'));
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

    $(document).on("click", ".mesg-peple>ul>li>a", function (e) {
        e.preventDefault();
        if ($(this).children('.brand_groups').hasClass('d-none')) {
            $(this).children('.brand_groups').removeClass('d-none');
        } else {
            $(this).children('.brand_groups').addClass('d-none');
        }
    });

    $(document).on("click", ".mesg-peple>ul>li.nav-item>div.brand_groups>button", function (e) {
        e.preventDefault();
        chat.openConversation($(this));
    });

    $(document).on("click", ".mesg-peple>ul>li.nav-item>a", function (e) {
        e.preventDefault();
        if ($(this).parent($('li.nav-item')).children('div.brand_groups').hasClass('d-none')) {
            $(this).parent($('li.nav-item')).children('div.brand_groups').removeClass('d-none');
        }
    });

    $(document).on("click", "#chat_notifications .list_notifications>a", function (e) {
        e.preventDefault();
        chat.openConversation($(this));
        $(this).remove();
        $('#chat_notifications .count_notifications').text($('#chat_notifications .count_notifications').text() - 1);
    });

    //mute/unmute notifications
    $(document).on("click", "#muteNotifications", function () {
        chat.muteNotifications();
    });
    //invert colors
    $(document).on("click", "#invertColors", function () {
        chat.invertColors();
    });
    //list chats
    $(document).on("click", "#listChats", function () {
        chat.listChatBrands();
    });

    //show working time
    $(document).on("hover", "#invertColors", function () {
    });

    $('.chat_container .minify').on("click", function () {
        if ($(this).children('button>i').hasClass('mdi-window-maximize')) {
            $(this).children('button>i').addClass('mdi-window-minimize');
            $(this).children('button>i').removeClass('mdi-window-maximize');
            $(".chat_container").css('height', '');
            $(".chat_container").css('min-height', '415px');
        } else {
            $(this).children('button>i').addClass('mdi-window-maximize');
            $(this).children('button>i').removeClass('mdi-window-minimize');
            $(".chat_container").css('height', '45px');
            $(".chat_container").css('min-height', '0px');
        }
    });
});