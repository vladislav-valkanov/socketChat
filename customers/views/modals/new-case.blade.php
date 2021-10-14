<style>
    /* note-editor fix */
.note-editor.note-frame {
-webkit-user-select: initial;
user-select: initial;
}
</style>

<div class="modal fade" id="submit_new_case" tabindex="-1" role="dialog" aria-labelledby="submit_new_case_label">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title" id="submit_new_case_label">Submit New Case</h4>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <p>Please state your issue as much <strong>detailed</strong> as possible. Our Support team will give you a responce within <strong>24h </strong>.</p>
                <form>
                    <select name="support_topic_id" id="support_topic_id" class="form-control select2">
                        <option value="0">Select a Help Topic</option>
                        @foreach($topicsWithoutCats as $topic)
                            <option value="{{ $topic['support_topic_id'] }}">{{ $topic['name'] }}</option>
                        @endforeach
                        @foreach($cats as $cat)
                            <optgroup label="{{ $cat['name'] }}">
                                @foreach($cat['topics'] as $topic)
                                    <option value="{{ $topic['support_topic_id'] }}">{{ $topic['name'] }}</option>
                                @endforeach
                            </optgroup>
                        @endforeach
                    </select><br>
                    <div class="form-group">
                        <input name="summary" id="summary" type="text" class="form-control" placeholder="Issue Summary *">
                    </div>
                    <div class="form-group reply-box">
                        <textarea id="comment" class="summernote" placeholder="State your issue here (example: I can`t see my past Integrations listed!)"></textarea>
                    </div>
                    <div class="form-group">
                        <hr>
                        <div id="supportCaseFilesList"></div>
                        <div class="clearfix"></div>
                        <hr>
                        <input id="support_case_files" type="file" multiple onchange="populateUploadedFiles();" style="display:none;" accept=".<?=implode(', .', $file_types)?>">
                        <button type="button" class="btn btn-primary" onclick="$('#support_case_files').trigger('click');">
                            <span>Add</span><i class="mdi mdi-file ml-2"></i>
                        </button>
                        <span>*.png, *.jpeg, *.jpg, *.pdf, *.doc, *.docx</span>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary waves-effect waves-light btn-lg" onclick="addCase();">
                    <span>Submit</span><i class="mdi mdi-send ml-2"></i>
                </button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="success-submit" tabindex="-1" role="dialog" aria-labelledby="success-submit_label">
    <div class="modal-dialog" role="document">
        <div class="modal-content gradient-success">
            <div class="modal-header">
                <h4 class="modal-title text-white" id="submit_new_case_label">Your Submission is Successful !</h4>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <p class="text-white">Thank you for submitting a new case. Your case number is <strong class="support_case_id">485976591</strong></p>
                <p class="text-white">Our Support team will post and update within 24h.</p>
            </div>
        </div>
    </div>
</div>
