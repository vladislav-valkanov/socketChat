<!-- modal to create support case -->
<div class="modal fade chat_modal" id="support_case_modal" tabindex="-1" role="dialog"
     aria-labelledby="support_case_modal" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header pb-0">
                <h4 class="center-block">Support Case</h4>
                <button type="button" class="close" data-dismiss="modal">
                    <span aria-hidden="true">&times;</span><span class="sr-only">Close</span>
                </button>
            </div>
            <div class="modal-body">
                <div class="dataCase">
                    <table style="width: 100%">
                        <tr>
                            <td><label for="summary">Summary:</label></td>
                            <td class="summary"><textarea id="summary" class="form-control"></textarea></td>
                        </tr>
                        <tr>
                            <td><label for="comment">Comment:</label></td>
                            <td class="comment"><textarea id="comment" class="form-control"></textarea></td>
                        </tr>
                        <tr>
                            <td><label for="label">Topic:</label></td>
                            <td class="topic"><select id="label" class="form-control"></select></td>
                        </tr>
                        <tr>
                            <td><label for="status">Status:</label></td>
                            <td class="status"><select id="status" class="form-control"></select></td>
                        </tr>
                    </table>
                    <br/>
                </div>
                <div class="createCase">
                    <button id="createSupportCaseFromChat" class="btn btn-success">Create The Support Case</button>
                </div>
                <div class="closeCase">
                    <button id="closeSupportCaseFromChat" class="btn btn-success">Close The Support Case</button>
                </div>
                <div class="errorCase">You can not create a support case!</div>
                <div class="errorCase1">You can not create a support case from admin's message!</div>
            </div>
        </div>
    </div>
</div>