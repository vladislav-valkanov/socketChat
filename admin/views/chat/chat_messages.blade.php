<div class="tab-content messenger card-box">
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
                <div class="message-writing-box" style="margin-top: -5px;">
{{--                    <form>--}}
{{--                        <div class="text-area">--}}
{{--                            <input type="text" class="message_box" placeholder="Write your message here..">--}}
{{--                            <button class="btn btn-lg send_msg" style="color: #4fb448;">--}}
{{--                                <i class="fas fa-paper-plane"></i></button>--}}
{{--                        </div>--}}
{{--                        <div class="attach-file" style="margin-left: 10px;">--}}
{{--                            <label class="fileContainer" style="background: none; color: #535165; height: auto;">--}}
{{--                                <i class="fas fa-paperclip"></i>--}}
{{--                                <input type="file">--}}
{{--                            </label>--}}
{{--                        </div>--}}
{{--                    </form>--}}
                    <form>
                        <input type="text" placeholder="Write here..." class="message_box" style="height: 50px; width:100%;"/>
                        <div id="buttons" style="height: 49px;">
                            <a style="color: #4fb448;height: 30px;" class="send_msg btn btn-white waves-effect waves-light">
                                <span class="fas fa-paper-plane"></span>
                            </a>
                            <a id="upload_file" style="color: #535165;margin-top: -5px" class="btn waves-effect waves-light" onclick="$('#add_file').trigger('click');">
                                <span class="fas fa-paperclip"></span>
                            </a>
                            <input id="add_file" type="file" class="d-none" accept=".jpg,.png">
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>