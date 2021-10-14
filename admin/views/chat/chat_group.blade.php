<!-- modal to create group -->
<div class="modal fade chat_modal" id="group_modal" tabindex="-1" role="dialog" aria-labelledby="group_modal" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header pb-0">
                <h5><label for="group_name">Group name:
                        <input type="text" id="group_name" class="form-control" placeholder="Group Name"/>
                    </label>
                </h5>
                <h5><label for="group_description">Description:
                        <input type="text" id="group_description" class="form-control" placeholder="Description"/>
                    </label>
                </h5>
                <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
            </div>
            <div class="modal-header pt-0 d-block">
                <h5>Schedule:</h5>
                <table class="editChatGroupSchedule">
                    <tr>
                        <th></th>
                        <th class="working_time_header" data-name="1" title="Monday">Mon</th>
                        <th class="working_time_header" data-name="2" title="Tuesday">Tue</th>
                        <th class="working_time_header" data-name="3" title="Wednesday">Wed</th>
                        <th class="working_time_header" data-name="4" title="Thursday">Thu</th>
                        <th class="working_time_header" data-name="5" title="Friday">Fri</th>
                        <th class="working_time_header" data-name="6" title="Saturday">Sat</th>
                        <th class="working_time_header" data-name="7"  title="Sunday">Sun</th>
                    </tr>
                    <tr>
                        <td>From:</td>
                        <td>
                            <label>
                                <input type="text" autocomplete="off" class="form-control working_time" name="1" required="required" placeholder="🕒🕒Choose Time" value="">
                            </label>
                        </td>
                        <td>
                            <label>
                                <input type="text" autocomplete="off" class="form-control working_time" name="2" required="required" placeholder="🕒🕒Choose Time" value="">
                            </label>
                        </td>
                        <td>
                            <label>
                                <input type="text" autocomplete="off" class="form-control working_time" name="3" required="required" placeholder="🕒🕒Choose Time" value="">
                            </label>
                        </td>
                        <td>
                            <label>
                                <input type="text" autocomplete="off" class="form-control working_time" name="4" required="required" placeholder="🕒🕒Choose Time" value="">
                            </label>
                        </td>
                        <td>
                            <label>
                                <input type="text" autocomplete="off" class="form-control working_time" name="5" required="required" placeholder="🕒🕒Choose Time" value="">
                            </label>
                        </td>
                        <td>
                            <label>
                                <input type="text" autocomplete="off" class="form-control working_time" name="6" required="required" placeholder="🕒🕒Choose Time" value="">
                            </label>
                        </td>
                        <td>
                            <label>
                                <input type="text" autocomplete="off" class="form-control working_time" name="7" required="required" placeholder="🕒🕒Choose Time" value="">
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <td>To:</td>
                        <td>
                            <label>
                                <input type="text" autocomplete="off" class="form-control working_time" name="11" required="required" placeholder="🕒🕒Choose Time" value="">
                            </label>
                        </td>
                        <td>
                            <label>
                                <input type="text" autocomplete="off" class="form-control working_time" name="22" required="required" placeholder="🕒🕒Choose Time" value="">
                            </label>
                        </td>
                        <td>
                            <label>
                                <input type="text" autocomplete="off" class="form-control working_time" name="33" required="required" placeholder="🕒🕒Choose Time" value="">
                            </label>
                        </td>
                        <td>
                            <label>
                                <input type="text" autocomplete="off" class="form-control working_time" name="44" required="required" placeholder="🕒🕒Choose Time" value="">
                            </label>
                        </td>
                        <td>
                            <label>
                                <input type="text" autocomplete="off" class="form-control working_time" name="55" required="required" placeholder="🕒🕒Choose Time" value="">
                            </label>
                        </td>
                        <td>
                            <label>
                                <input type="text" autocomplete="off" class="form-control working_time" name="66" required="required" placeholder="🕒🕒Choose Time" value="">
                            </label>
                        </td>
                        <td>
                            <label>
                                <input type="text" autocomplete="off" class="form-control working_time" name="77" required="required" placeholder="🕒🕒Choose Time" value="">
                            </label>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="modal-body">
                <div id="group_users_list">
                    <ul class="nav nav-pills" id="pills-tab3" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link active" id="pills-group_users" data-toggle="pill" href="#group_users" role="tab" aria-controls="group_users" aria-selected="true">Users</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="pills-group_participants" data-toggle="pill" href="#group_participants" role="tab" aria-controls="group_participants" aria-selected="true">Participants</a>
                        </li>
                    </ul>
                    <div id="group_users" class="tab-pane fade show active" role="tabpanel" aria-labelledby="pills-group_users"></div>
                    <div id="group_participants" class="tab-pane fade" role="tabpanel" aria-labelledby="pills-group_participants"></div>
                </div>
            </div>
            <div class="row">
                <div class="col-6">
                    <a class="btn btn-danger" id="delete_group">DELETE</a>
                </div>
                <div class="col-6">
                    <a class="btn btn-success" id="change_group">SAVE</a>
                </div>
                <br/>
                <br/>
            </div>
        </div>
    </div>
</div>
<script>
    $(document).ready(function() {
        $('.working_time').timepicker({
            defaultTime: '00:00',
            icons:{
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down'
            }
        });
    });
</script>