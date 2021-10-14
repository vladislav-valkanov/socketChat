@extends('layouts.main')
@section('title', 'Support')
@section('title-box', 'Support Chat')

<link href="<?php echo base_url(); ?>assets/assetsV2/chat/newchatsupportfiles/css/main.min.css" rel="stylesheet" type="text/css"/>
<link href="<?php echo base_url(); ?>assets/assetsV2/chat/newchatsupportfiles/css/style.css" rel="stylesheet" type="text/css"/>
<link href="<?php echo base_url(); ?>assets/assetsV2/chat/newchatsupportfiles/css/color.css" rel="stylesheet" type="text/css"/>
<link href="<?php echo base_url(); ?>assets/assetsV2/chat/newchatsupportfiles/css/responsive.css" rel="stylesheet" type="text/css"/>

@section('content')
    <div class="col-lg-12">
        <div class="row">
            <div class="col-lg-12 text-center">
                <h3 class="pageTitle text-center">
                    <span class="mdi mdi-lightbulb-on-outline" aria-hidden="true"></span> Support Chat
                </h3>
            </div>
        </div>
        <br>
    </div>

    <div class="col-lg-12 chat_window chat_container">
        <div class="theme-layout">
            <div class="row">
                <!-- Users in chat -->
                <div class="col-lg-4">
                    <!-- CHAT USERS -->
                    <div class="">
                        @include('support/chat/list_chats')
                    </div>
                </div>
                <div class="col-lg-8">
                    @include('support/chat/chat_messages')
                </div>
            </div>
        </div>
    </div>
@endsection