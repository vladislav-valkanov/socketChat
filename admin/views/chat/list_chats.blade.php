<div class="message-users">
    <div class="message-head">
        <h4>Chats</h4>
        <button id="muteNotifications" class="btn btn-dark btn-group btn-sm float-right"
                type="button" aria-haspopup="true" aria-expanded="false">
            <span class="col-sm-2 mdi mdi-volume-mute" title="Mute notifications" href="#"></span>
        </button>
    </div>
    <div class="message-people-srch">
        <form method="post">
            <input type="text" placeholder="Search User/Group...">
            <button type="submit"><i class="fa fa-search"></i></button>
        </form>
        @php get_instance()->load->helper('permissions_helper'); @endphp
        @if(checkPermission('chatCreateGroups'))
            <div class="btn-group" role="group">
                <button id="editGroup" class="btn btn-dark btn-sm dropdown-toggle user-filter p-0"
                        type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Edit
                </button>
                <div class="dropdown-menu editGroups" aria-labelledby="editGroup">
                </div>
            </div>
            <div class="btn-group add-group align-right" role="group">
                <button type="button" class="btn btn-dark btn-group btn-sm p-0"
                        data-toggle="modal" data-target="#group_modal" aria-haspopup="true" aria-expanded="false">
                    Create Group +
                </button>
            </div>
        @endif
    </div>
    <div class="mesg-peple" style="overflow-y: scroll;">
        <ul class="nav nav-tabs nav-tabs--vertical msg-pepl-list">
        </ul>
    </div>
</div>