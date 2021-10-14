<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Chat extends CI_Controller
{
    protected $user;

    public function __construct()
    {
        parent::__construct();
        $this->load->model('User_model');
        $this->load->model('Chat_model');
    }

    public function window()
    {
        $data['open'] = false;
        if(isset($_GET['b']) && isset($_GET['g'])){
            $data['open'] = ['id' => $this->input->get('b'), 'type' => $this->input->get('g')];
        }
        if (!isset($_SESSION['userLogged'])) {
            $this->session->set_flashdata("error", "Please login!");
            redirect("auth/login");
        }
        $this->user = $this->session->userdata;
        $this->load->helper('permissions_helper');
        if (!checkPermission("chatCreateGroups") && count(getChatGroups()) == 0) {
            exit;
        }
        $this->load->helper('view_helper');
        bladeView('support/chat/window_chat', $data);
    }

    public function index()
    {
        $sender_id = $this->input->post('sender_id');
        $sender_type = $this->input->post('new_type');
        $messages_offset = $this->input->post('messages_offset');
        $id = $this->input->post('id');
        $chat_name = $this->Chat_model->getChatInfo($sender_id, $sender_type);
        if ($sender_id > 0) {
            if ($message = $this->Chat_model->get($id, $sender_id, $sender_type, false, false, $messages_offset)) {
                exit(json_encode(['id' => 'a' . $id, 'msg' => $messages_offset == 0 ? array_reverse($message) : $message, 'messages_offset' => $messages_offset, 'chatInfo' => $chat_name]));
            }
        }
        exit(json_encode(['id' => 'a' . $id, 'msg' => false, 'messages_offset' => $messages_offset, 'chatInfo' => $chat_name]));
    }

    private function array_sort_by_column(&$arr, $col, $dir = SORT_ASC)
    {
        $sort_col = array();
        foreach ($arr as $key => $row) {
            $sort_col[$key] = $row[$col];
        }
        array_multisort($sort_col, $dir, $arr);
    }

    public function session()
    {
        $id = $this->input->post('id');

        $this->load->helper('permissions_helper');
        $chats['groups'] = false;
        if (checkPermissionById('chatCreateGroups', $id)) {
            $chats['groups'] = $this->Chat_model->getGroupsToEdit();
        }
        $chats['chats']['chatsList'] = $this->Chat_model->getGroups($id);
        $this->array_sort_by_column($chats['chats']['chatsList'], 'sent', SORT_DESC);
        $chats['chats']['notices'] = $chats['chats']['chatsList'];
        $return['name'] = $this->User_model->findAdmin($id)->user_name;
        $return["id"] = $id;
        $return["type"] = "admin";
        $return['chats'] = $chats;
        exit(json_encode($return));
    }

    public function admins($id, $group = false)
    {
        if ($admins = $this->Chat_model->getAdmins($id, $group)) {
            return ['usersList' => $admins];
        } else {
            return ['usersList' => []];
        }
    }

    public function group()
    {
        $group = $this->input->post('group');
        $groupId = $group['id'];
        $return = false;

        if($group['delete'] == 1){
            if($groupId != '' && $this->Chat_model->deleteCustomerChatGroupAndPermission($groupId)){
                return true;
            }
            return false;
        }

        if ($group['name'] == '') {
            $group['name'] = 'group' . time();
        }

        if ($groupId == '') {
            if($groupId = $this->Chat_model->createGroup($group['name'], json_encode($this->input->post('working_time')))){
                $this->Chat_model->createCustomerPermission($group['name'], $group['description']);
                $return = true;
            }
        } else {
            if (is_array($this->input->post('deleted_users'))) {
                foreach ($this->input->post('deleted_users') as $user) {
                    $this->Chat_model->deleteParticipant($user, $groupId);
                }
            }
            if(($group_old_name = $this->Chat_model->getGroupName($groupId)) && $this->Chat_model->changeGroup($group['name'], json_encode($this->input->post('working_time')), $groupId)){
                $this->Chat_model->changeCustomerPermission($group['name'], $group['description'], $group_old_name);
            }
        }

        if (is_array($this->input->post('new_users'))) {
            foreach ($this->input->post('new_users') as $user) {
                $this->Chat_model->addParticipant($user, $groupId);
            }
        }

        if ($return) {
            exit(json_encode($groupId));
        }
    }

    public function groupParticipants()
    {
        $working_time = $this->Chat_model->getGroupsToEdit($this->input->post('groupType'));
        $userParticipants = $this->Chat_model->getUsersParticipants($this->input->post('groupType'), $this->input->post('groupId'));
        $adminParticipants = $this->Chat_model->getAdminParticipants($this->input->post('groupType'));
        if ($userParticipants || $adminParticipants) {
            $adminParticipants = is_array($adminParticipants) ? $adminParticipants : [];
            $userParticipants = is_array($userParticipants) ? $userParticipants : [];
            $participants = array_merge($adminParticipants, $userParticipants);
            exit(json_encode(['participants' => $participants, 'working_time' => isset($working_time) ? $working_time : []]));
        } else {
            exit(json_encode(['participants' => false, 'working_time' => isset($working_time) ? $working_time : []]));
        }
    }

    public function participants()
    {
        $working_time = $this->Chat_model->getGroupsToEdit($this->input->post('groupId'));
        $id = $this->input->post('id');
        $admins = $this->admins($id);
        if ($participants = $this->Chat_model->getAdminParticipants($this->input->post('groupId'))) {
            exit(json_encode(['participants' => $participants, 'users' => isset($admins) ? $admins['usersList'] : [], 'working_time' => isset($working_time) ? $working_time : []]));
        } else {
            exit(json_encode(['participants' => false, 'users' => isset($admins) ? $admins['usersList'] : [], 'working_time' => isset($working_time) ? $working_time : []]));
        }
    }

    function base64_encode_image($filename)
    {
        if ($filename) {
            $imgbinary = fread(fopen($filename, "r"), filesize($filename));
            return base64_encode($imgbinary);
        }
        return false;
    }

    public function uploadImage()
    {
        $tmp_path = $_FILES['file']['tmp_name'];
        if (!(bool)getimagesize($tmp_path)) {
            exit(json_encode(["error" => "Wrong type of file!"]));
        }

        $client_id = "390e8a50faf3479";

        $post_vars = array('image' => $this->base64_encode_image($tmp_path));
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => "https://api.imgur.com/3/image",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS => $post_vars,
            CURLOPT_HTTPHEADER => array(
                "Authorization: Client-ID {$client_id}"
            ),
        ));

        $out = curl_exec($curl);
        curl_close($curl);
        $pms = json_decode($out, true);
        $url = $pms['data']['link'];
        if ($url != "") {
            exit(json_encode($url));
        }

        exit(json_encode(["error" => "Error uploading file!"]));
    }
}