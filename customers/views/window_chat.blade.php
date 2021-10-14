@extends('layouts.main')
@section('title', 'Support')
@section('title-box', 'Support Chat')

@section('content')
    <div class="chat_window chat_container">
        <div class="theme-layout">
            <div class="row">
                <!-- Users in chat -->
                <div class="col-lg-4">
                    <!-- CHAT USERS -->
                    <div class="chat-windows-buttons">
                        <button id="listChats" type="button" class="btn btn-light btn-group btn-sm active">
                            <span class="col-sm-2 mdi mdi-arrow-down-bold" title="List all chats." href="#"></span>
                        </button>
                    </div>
                    <div class="chat_list_box" style="min-height: 55vh;">
                        @include('support/modals/list_chats')
                    </div>
                </div>
                <div class="col-lg-8">
                    <div class="chat-windows-buttons">
                        <button id="invertColors" type="button" class="btn btn-light btn-group btn-sm">
                            <span class="col-sm-2 mdi mdi-invert-colors" title="Invert colors." href="#"></span>
                        </button>
                        <button id="muteNotifications" type="button" class="btn btn-light btn-group btn-sm">
                            <span class="col-sm-2 mdi mdi-volume-mute" title="Mute notifications" href="#"></span>
                        </button>
                    </div>
                    @include('support/modals/chat_messages')
                </div>
            </div>
        </div>
    </div>
@endsection