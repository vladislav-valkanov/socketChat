<li id="chat_notifications">
    <a class="nav-link dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" title="Notifications" aria-haspopup="false" aria-expanded="true">
        <i class="dripicons-inbox noti-icon"></i>
        <span class="badge badge-info noti-icon-badge count_notifications"></span>
    </a>
    <div class="dropdown-menu dropdown-menu-right dropdown-lg" style="width:auto;" x-placement="bottom-end">
        <!-- item-->
        <div class="dropdown-item noti-title">
            <h5 class="m-0">
                Messages
            </h5>
        </div>

        <div class="slimScrollDiv" style="max-height: 300px;overflow: scroll">
            <div class="slimscroll noti-scroll list_notifications">
            </div>
        </div>
        <!-- All-->
        <a href="{{base_url()}}index.php/chat/window" class="dropdown-item text-center text-primary notify-item notify-all">
            View all
        </a>
    </div>
</li>