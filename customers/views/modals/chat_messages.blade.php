<div class="tab-content messenger card-box p-0 m-0">
    <div class="tab-pane no-stream active fade show">
        <div class="row merged">
            <div class="col-lg-12 m-4">
                <div class="no-messages">
                    <i class="ti-comments mdi mdi-wechat"></i>
                    <p>To chat with the teams please select type under the brand from the list on left.</p>
                </div>
            </div>
        </div>
    </div>
    <div class="tab-pane stream">
        <div class="row merged">
            <div class="col-lg-12">
                <div class="mesg-area-head">
                    <div class="active-user">
                        <figure>
                            <span class="status f-online"></span>
                        </figure>
                        <div>
                            <h6 class="unread"></h6>
                            <span>
                                <small></small>
                            </span>
                        </div>
                    </div>
{{--                    <ul class="live-calls">--}}
{{--                        <li class="uzr-info"><span class="fa fa-info-circle"></span></li>--}}
{{--                    </ul>--}}
                </div>
            </div>
            <div class="col-lg-12">
                <div class="mesge-area">
                    <!--default message -->
                    <div class="empty-chat">
                        <div class="no-messages">
                            <i class="ti-comments mdi mdi-wechat"></i>
                            <p>Seems people are shy to start the chat. Break the ice send the first message.</p>
                        </div>
                    </div>
                    <!-- conversation messages -->
                    <ul class="conversations"></ul>
                </div>
                <div class="message-writing-box" style="margin-top: 0px;">
                    <form>
                        <div class="text-area">
                            <input type="text" class="message_box" placeholder="Write your message here..">
                            <button class="btn btn-lg send_msg" style="color: #4fb448;">
                                <i class="mdi mdi-send"></i></button>
                            <div class="attach-file">
                                <label class="fileContainer" style="background: none; color: #535165; height: auto;">
                                    <i class="mdi mdi-file-outline"></i>
                                    <input type="file" id="add_file">
                                </label>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>