@extends('layouts.main')
@section('title', 'Support')
@section('title-box', ' Chats Statistics')
@section('content')
    <div class="col-lg-12">
        <div class="row">
            <div class="col-lg-12 text-center"><h3 class="pageTitle text-center"> Chats Statistics</h3></div>
        </div>
    </div>
    <br>
    <div class="col-lg-12">
        <form action="" method="get" class="row">
            <div class="col-md-3">
                <label for="dateFrom"><span>Date range:</span></label>
                <div class="input-group " id="dateRange">
                    <input type="text" id="dateFrom" name="dateFrom" placeholder="&#128467 Date From" class="form-control" autocomplete="off" value="{{isset($dateFrom) ? date('d M Y', $dateFrom) : ''}}">
                    <label for="dateTo" class="input-group-addon btn-sm">to</label>
                    <input type="text" id="dateTo" name="dateTo" placeholder="&#128467 Date To" class="form-control" autocomplete="off" value="{{isset($dateTo) ? date('d M Y', $dateTo) : ''}}">
                </div>
            </div>
            <div class="form-group col-sm-2">
                <label for="brandId">Brand:</label>
                <select name="brandId" id="brandId" class="form-control searchableBrandSelector">
                    <option value="0" {{isset($_GET['brandId']) && $_GET['brandId'] == 'all' ? 'selected' : ''}}>All</option>
                    @foreach($brands as $brand)
                        <option value="{{$brand['brand_id']}}" {{isset($_GET['brandId']) && $_GET['brandId'] == $brand['brand_id'] ? 'selected' : ''}}>{{$brand['name'] . " - (" . $brand['brand_id'] . ")"}}</option>
                    @endforeach
                </select>
            </div>
            <div class="form-group col-sm-2">
                <label for="chatGroup">Chat groups:</label>
                <select name="chatGroup" id="chatGroup" class="form-control">
                    <option value="all" {{isset($_GET['chatGroup']) && $_GET['chatGroup'] == 'all' ? 'selected' : ''}}>All</option>
                    @foreach($groups as $group)
                        <option value="{{$group['id']}}" {{isset($_GET['chatGroup']) && $_GET['chatGroup'] == $group['id'] ? 'selected' : ''}}>{{$group['name']}}</option>
                    @endforeach
                </select>
            </div>
            <div class="form-group col-sm-3">
                <label for="admin">Admin users:</label>
                <select name="admin" id="admin" class="form-control">
                    <option value="0">All users:</option>
                    @foreach($admin_users as $admin)
                        <option value="{{$admin['user_id']}}" {{isset($_GET['admin']) && $_GET['admin'] == $admin['user_id'] ? 'selected' : ''}}>{{$admin['user_name'] . " - (" . $admin['user_id'] . ")"}}</option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-2">
                <label for="timeInterval"><span>Time interval (minutes):</span></label>
                <input type="text" id="timeInterval" name="timeInterval" placeholder="&#128467 Time Interval" class="form-control" autocomplete="off" value="{{isset($timeInterval) ? $timeInterval : 180}}">
            </div>
            <div class="form-group col-sm-12">
                <label for="brandId">&nbsp;</label>
                <button class="btn btn-info btn-block" name="search"><span class="fa fa-search" aria-hidden="true" ></span> Show</button>
            </div>
        </form>
        @if(isset($statistics))
            @if($statistics != '')
                <div class="card-box">
                    <table id="statistics" class="dt-responsive table table-striped table-bordered table-hover brands-table width-100">
                        <thead>
                            <tr>
                                <th>Start</th>
                                <th>End</th>
                                <th title="Maximum time between messages">Max Pause</th>
                                <th title="Average time between messages">Mid Pause</th>
                                <th>Messages</th>
                                <th>Admins</th>
                                <th>Merchants</th>
                                <th>Brand</th>
                                <th>Group</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($statistics as $brands => $brand)
                                @foreach ($brand as $group => $chat)
                                    @foreach ($chat as $row)
                                        @php
                                            $maxhours = floor($row['max_time'] / 3600);
                                            $row['maxdays'] = intval($maxhours / 24);
                                            $row['maxhours'] = $maxhours % 24;
                                            $row['maxmins'] = floor($row['max_time'] / 60 % 60);
                                            $row['maxsecs'] = floor($row['max_time'] % 60);
                                            $row['mid_hours'] = floor($row['mid_time'] / 3600);
                                            $row['mid_mins'] = floor($row['mid_time'] / 60 % 60);
                                            $row['mid_secs'] = floor($row['mid_time'] % 60);
                                        @endphp
                                        <tr>
                                            <td>{{$row['beginning']}}</td>
                                            <td>{{$row['end']}}</td>
                                            <td>{{$row['maxdays']>0 ? $row['maxdays'].' days' : ''}}  {{sprintf('%02d:%02d:%02d', $row['maxhours'], $row['maxmins'], $row['maxsecs'])}}</td>
                                            <td>{{sprintf('%02d:%02d:%02d', $row['mid_hours'], $row['mid_mins'], $row['mid_secs'])}}</td>
                                            <td>{{$row['count']}}</td>
                                            <td>
                                                @foreach($row['admins'] as $row['admin'])
                                                    {{$row['admin']}}
                                                @endforeach
                                            </td>
                                            <td>
                                                @foreach($row['merchants'] as $row['merchant'])
                                                    <a href="{{site_url("/user/editMerchant/" . $row['merchant'])}}" target="_blank">{{$row['merchant']}}</a>
                                                @endforeach
                                            </td>
                                            <td>{{$brand == 0 ? 'Undefined' : $brands_list[$brands] . " - (" . $brands . ")"}}</td>
                                            <td>{{$group == 0 ? 'Undefined' : $row['group_name']}}</td>
                                        </tr>
                                    @endforeach
                                @endforeach
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @else
                <h3 style="text-align: center">There are no messages for this period.</h3>
            @endif
        @endif
    </div>

    <script>
        $("#dateTo, #dateFrom").datepicker({
            format: "d M yyyy",
            viewMode: "days",
            minViewMode: "days",
            orientation: "bottom"
        });
        $('#statistics').DataTable({
            responsive: true,
            pageLength: -1,
            aLengthMenu: [[8, 10, 25, 50, 100, -1], [8, 10, 25, 50, 100, "All"]],
        });
    </script>

    <script src="{{base_url()}}assets/js/jquery.modal.min.js"></script>
    <link href="{{base_url()}}assets/css/jquery.modal.min.css" rel="stylesheet">
@endsection