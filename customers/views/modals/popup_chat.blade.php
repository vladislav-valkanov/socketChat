<div class="popup-box chat-popup chat_container">
    <div class="popup-head stream">
        <div class="col-md-12">
            <div class="row">
                <div class="col-9 text-center">
                    <div class="active-user">
                        <figure>
                            <span class="status f-online"></span>
                        </figure>
                        <div>
                            <h6 class="unread text-left text-dark"></h6>
                            <span style="margin-bottom:5px;">
                                <small></small>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="float-right col-3">
                    <div class="row">
                        <button data-widget="minify" class="col-6 chat-header-button" type="button">
                            <i class="text-dark mdi mdi-window-minimize c-pointer"></i>
                        </button>
                        <button class="col-6 close-chat float-right chat-header-button float-right text-dark"
                                data-widget="remove" type="button">
                            <i class="mdi mdi-close c-pointer"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="popup-messages">
        <div class="direct-chat-messages">
            <div class="mesge-area chat-area2">
                <ul class="conversations">
                </ul>
            </div>
        </div>
    </div>
    <div class="popup-messages-footer">
        <div class="message-writing-box">
            <form>
                <div class="text-area w-100 col-md-10">
                    <input type="text" placeholder="Write here..." class="message_box"/>
                    <button class="btn btn-lg send_msg" type="submit">
                        <h3><i class="text-success mdi mdi-send"></i></h3>
                    </button>
                </div>
                <div class="attach-file col-md-2 col-lg-1">
                    <!--<a id="upload_file" style="color: #535165;" class="btn waves-effect waves-light" onclick="$('#add_file').trigger('click');">
                        <span class="fas fa-paperclip"></span>
                    </a>
                    <input id="add_file" type="file" onchange="chat.uploadFile(this);" class="d-none" accept=".jpg,.png">-->
                    <label class="fileContainer">
                        <h3><i class="mdi mdi-paperclip text-dark"></i></h3>
                        <input type="file">
                    </label>
                </div>
            </form>
        </div>
    </div>
    <br><br>
</div>