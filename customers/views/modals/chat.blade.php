<div class="chat_container fast_chat chatcontainer d-none">
    <div class="card-box fast-chat-box">
        <div id="controls_chat" class="row chat-controls">
            <div class="col-sm-12 row">
                <button id="invertColors" type="button"
                        class="btn btn-light btn-group btn-sm"
                        aria-haspopup="true" aria-expanded="false">
                    <span class="col-sm-2 mdi mdi-invert-colors" title="Invert colors." href="#"></span>
                </button>
                <button id="muteNotifications" type="button"
                        class="btn btn-light btn-group btn-sm"
                        aria-haspopup="true" aria-expanded="false">
                    <span class="col-sm-2 mdi mdi-volume-mute" title="Mute notifications" href="#"></span>
                </button>
                <div class="col-sm-6 text-dark chattitle"><h5> Support Chat</h5></div>
                <div class="row btns-row">
                    <button title="Minimize Window" class="minify col-sm-1 text-dark chat-header-button" type="button">
                        <i class="mdi mdi-window-minimize c-pointer"></i>
                    </button>
                    <button id="close_chat" title="Exit Window" class="col-sm-1 close-chat float-right chat-header-button float-right text-dark" type="button"><i class="col-sm-2 mdi mdi-close c-pointer"></i></button>
                </div>
            </div>
<!--            <div class="col-sm-6"><h5> Fast Chat</h5></div>
            <div class="col-sm-2 float-right" style="right: -30px;">
                <button data-widget="minify" title="Minimize Window" data-toggle="collapse"
                        data-target="#chatbody" aria-expanded="true" class="minify chat-header-button" type="button">
                    <i class="mdi mdi-window-minimize" style="cursor: pointer;"></i>
                </button>
                <button data-widget="remove" title="Exit Window"
                        class="close-chat chat-header-button float-right" type="button">
                    <i class="mdi mdi-close" style="cursor: pointer;"></i>
                </button>
            </div>-->
        </div>
        <section>
            <div class="theme-layout collapse show" id="chatbody">
                <div class="gap2 no-gap">
                    <div class="container-fluid no-padding">
                        <div class="row bg-users">
                            <div class="chat_list_box">
                                @include('support/modals/list_chats')
                                @include('support/modals/chat_messages')
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</div>