<div class="chat_container fast_chat chatcontainer d-none">
    <div class="card-box">
        <div id="controls_chat" class="row">
            <div class="col-sm-4 row">
                <button id="invertColors" type="button"
                        class="btn btn-dark btn-group btn-sm"
                        aria-haspopup="true" aria-expanded="false">
                    <span class="col-sm-2 mdi mdi-invert-colors" title="Invert colors." href="#"></span>
                </button>
                <button id="muteNotifications" type="button"
                        class="btn btn-dark btn-group btn-sm"
                        aria-haspopup="true" aria-expanded="false">
                    <span class="col-sm-2 mdi mdi-volume-mute" title="Mute notifications" href="#"></span>
                </button>
                <h5></h5>
            </div>
            <div class="col-sm-6"><h5> Fast Chat</h5></div>
            <div class="col-sm-2 float-right" style="right: -30px;">
                <button data-widget="minify" title="Minimize Window" data-toggle="collapse"
                        data-target="#chatbody" aria-expanded="true" class="minify chat-header-button" type="button">
                    <i class="mdi mdi-window-minimize" style="cursor: pointer;"></i>
                </button>
                <button data-widget="remove" title="Exit Window"
                        class="close-chat chat-header-button float-right" type="button">
                    <i class="mdi mdi-close" style="cursor: pointer;"></i>
                </button>
            </div>
        </div>
        <section>
            <div class="theme-layout collapse show" id="chatbody">
                <div class="gap2 no-gap">
                    <div class="container-fluid no-padding">
                        <div class="row" style="background: #3f4759;">
                            <div class="" style="border: 1px solid #676666;border-top: none;width:100%;">
                                @include('support/chat/list_chats')
                                @include('support/chat/chat_messages')
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</div>
@include('support/image')
@include('support/chat/chat_group')
@include('support/chat/chat_support_case')
<audio id="chatAudio">
    <source src="{{base_url()}}assets/assetsV2/chat/chatSound.ogg" type="audio/ogg">
    <source src="{{base_url()}}assets/assetsV2/chat/chatSound.mp3" type="audio/mpeg">
</audio>
<script>
    let chatUrl = "{{CHAT_URL}}";
    let chatPort = "{{CHAT_PORT}}";
    let chatId = "{{ $_SESSION['userId'] }}";
</script>
<link href="{{base_url()}}assets/assetsV2/chat/style.css?v=1.2" rel="stylesheet"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js"></script>
<script src="{{base_url()}}assets/assetsV2/chat/chat.js?v=2"></script>
<script src="{{base_url()}}assets/assetsV2/chat/events.js?v=2"></script>