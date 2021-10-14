<!-- modal to list group participants -->
<div class="modal fade chat_modal" id="groupInfo" tabindex="-1" role="dialog" aria-labelledby="groupInfo" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5>Group name: <text id="group_name"></text></h5>
                <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
            </div>
            <div class="modal-body">
                <div id="group_users_list">
                    <ul class="nav nav-pills" id="pills-tab" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link active" id="pills-participants" data-toggle="pill" href="#group_participants" role="tab" aria-controls="group_participants" aria-selected="true">Participants:</a>
                        </li>
                    </ul>
                    <div id="group_participants" class="tab-pane fade active" role="tabpanel" aria-labelledby="pills-participants">
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>