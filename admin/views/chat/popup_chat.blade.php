<div class="popup-box chat-popup chat_container">
    <div class="popup-head stream">
        <div class="row">
            <div class="col-sm-8 text-center">
                <div class="active-user" style="margin-left: 10px;">
                    <figure>
                        <span class="status f-online"></span>
                    </figure>
                    <div>
                        <h6 class="unread text-left" style="margin-bottom: 0px; padding: 0px;"></h6>
                        <span style="margin-bottom:5px;">
                            <small></small>
                        </span>
                    </div>
                </div>
            </div>
            <div class="col-sm-4 float-right">
                <button data-widget="minify" class="chat-header-button minify" type="button">
                    <i class="mdi mdi-window-minimize" style="cursor: pointer;"></i>
                </button>
                <button data-widget="remove" class="close-chat float-right chat-header-button float-right"
                        type="button">
                    <i class="mdi mdi-close" style="cursor: pointer;"></i>
                </button>
            </div>
        </div>
    </div>
    <div class="popup-messages">
        <div class="direct-chat-messages">
            <div class="mesge-area">
                <ul class="conversations">
                </ul>
            </div>
        </div>
        <div class="popup-messages-footer message-writing-box">
            <form class="mb-0">
                <input type="text" placeholder="Write here..." class="message_box" style="height: 50px; width:100%;"/>
                <div id="buttons" style="height: 49px;">
                    <a style="color: #4fb448;" class="send_msg btn btn-white waves-effect waves-light">
                        <span class="fas fa-paper-plane"></span>
                    </a>
                    <a id="upload_file" style="color: #535165;" class="btn waves-effect waves-light" onclick="$('#add_file').trigger('click');">
                        <span class="fas fa-paperclip"></span>
                    </a>
                    <input id="add_file" type="file" class="d-none" accept=".jpg,.png">
                </div>
            </form>
        </div>
    </div>
</div>