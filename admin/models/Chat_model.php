<?php

class Chat_model extends CI_Model
{

    public function __construct()
    {
        $this->load->database();
        $this->customerdb = $this->load->database('customerdb', TRUE);
        parent::__construct();
    }

    public function get($id, $sender_id, $sender_type, $start_id = false, $end_id = false, $offset = false)
    {
        $data = $this->customerdb->select('id, message, sender_id, sender_type, DATE_FORMAT(timestamp_sent,"%d.%m.%Y %H:%i:%s") AS sent, seen_user_id as seen, msg_type');
        $data->from('chat_messages');
        if ($sender_type == 'admin' || $sender_type == 'user') {
            $data->group_start();
            $data->or_group_start();
            $data->where("sender_id", $id);
            $data->where("sender_type", 'admin');
            $data->where("receiver_type", $sender_type);
            $data->where("receiver_id", $sender_id);
            $data->group_end();
            $data->or_group_start();
            $data->where("sender_id", $sender_id);
            $data->where("sender_type", $sender_type);
            $data->where("receiver_type", 'admin');
            $data->where("receiver_id", $id);
            $data->group_end();
            $data->group_end();
        } else {
            $data->where("receiver_id", $sender_id);
            $data->where("receiver_type", $sender_type);
        }
        if($offset !== false){
            $data->limit(20, $offset);
        }
        if($start_id){
            $data->where("id >=", (int)$start_id);
        }
        if($end_id){
            $data->where("id <=", (int)$end_id);
        }
        $data->order_by("id", "DESC");
//        $data->limit($limit);
//        $data->offset($offset);
        $result = $data->get()->result_array();
        foreach ($result as $key => $msg) {
            $result[$key]['username'] = $this->getChatInfo($msg['sender_id'], $msg['sender_type']);
        }
        return $result;
    }

    public function getAdmins($id, $group)
    {
        if ($group) {
            $data = $this->customerdb->select("user_id");
            $data->from('chat_group_participants');
            $data->where("user_type", "admin");
            $data->where("group_id", $group);
            $in_group = $data->get()->result_array();
            $except_users = implode(",", array_map(function ($entry) {
                return $entry['user_id'];
            }, $in_group));
        }
        $data = $this->customerdb->select("au.user_id AS id, SUBSTRING_INDEX( au.user_name, '@', 1 ) as name, au.typeId, max(cm.timestamp_sent) AS sent, max(cm.message) as message ,CONCAT('admin', '') as type");
        $data->from('admin_users au');
        $data->join("chat_messages cm", "cm.id = (SELECT max(id) FROM chat_messages WHERE (au.user_id = sender_id AND sender_type = 'admin' AND receiver_id = {$id} AND receiver_type = 'admin') OR (au.user_id = receiver_id AND receiver_type = 'admin' AND sender_id = {$id} AND sender_type = 'admin'))", "left");
//        $data->where("au.user_id !=", $id);
        if (!empty($except_users)) {
            $data->where("au.user_id NOT IN ({$except_users})");
        }
        $data->group_by("au.user_id");
        $data->order_by("max(cm.timestamp_sent)", "DESC");
        $data->order_by("au.user_name", "ASC");
        return $data->get()->result_array();
    }

    public function getUsers($id, $group)
    {
        if ($group) {
            $data = $this->customerdb->select("user_id");
            $data->from('chat_group_participants');
            $data->where("user_type", "user");
            $data->where("group_id", $group);
            $in_group = $data->get()->result_array();
            $except_users = implode(",", array_map(function ($entry) {
                return $entry['user_id'];
            }, $in_group));
        }
        $data = $this->customerdb->select("u.user_id AS id, u.firstname as name, max(cm.timestamp_sent) AS sent, max(cm.message) as message, CONCAT('user', '') as type");
        $data->from("users u");
        $data->join("chat_messages cm", "cm.id = (SELECT max(id) FROM chat_messages WHERE (u.user_id = sender_id AND sender_type = 'user' AND receiver_id = {$id} AND receiver_type = 'admin') OR (u.user_id = receiver_id AND receiver_type = 'user' AND sender_id = {$id} AND sender_type = 'admin'))", "left");
        $data->where("u.activated", 1);
        if (!empty($except_users)) {
            $data->where("u.user_id NOT IN ({$except_users})");
        }
        $data->group_by("u.user_id");
        $data->order_by("max(cm.timestamp_sent)", "DESC");
        $data->order_by("u.firstname", "ASC");
        return $data->get()->result_array();
    }

    public function getChatInfo($id, $type)
    {
        switch ($type) {
            case 'user':
                $data = $this->customerdb->select('firstname as name, CONCAT("user", "") as type');
                $data->from('users');
                $data->where("user_id", $id);
                $result = $data->get()->row();
                break;
            case 'admin':
                $data = $this->customerdb->select('SUBSTRING_INDEX( user_name, "@", 1 ) as name, CONCAT("admin", "") as type, typeId');
                $data->from('admin_users');
                $data->where("user_id", $id);
                $result = $data->get()->row();
                break;
            case 'group':
                $data = $this->customerdb->select('name, CONCAT("group", "") as type');
                $data->from('chat_groups');
                $data->where("id", $id);
                $result = $data->get()->row();
                break;
            default:
                if ($type > 1) {
                    $data = $this->db->select('name');
                    $data->from('brands');
                    $data->where("brand_id", $id);
                    $brand_name = $data->get()->row();

                    $data = $this->db->select('name');
                    $data->from('chat_groups');
                    $data->where("id", $type);
                    $group_name = $data->get()->row();
                    $result['type'] = 'group';
                    $result['name'] = $brand_name->name;
                    $result['group'] = $group_name->name;
                } else {
                    $result = 'Chat';
                }
        }
        return $result;
    }

    public function getGroups($id = false)
    {
        if($id) {
            $data = $this->customerdb->select("cg.id, b.name as brand_name, b.brand_id, cg.name, max(cm.timestamp_sent) AS sent, max(cm.message) as message, CONCAT('group', '') as type, MIN(cm.seen_user_id) as seen");
        }else{
            $data = $this->customerdb->select("cg.id, cg.name, CONCAT('group', '') as type");
        }
        $data->from('chat_groups cg');
        if($id) {
            $data->join('chat_group_participants cgrp', 'cg.id = cgrp.group_id', 'left');
            $data->join("chat_messages cm", "cm.receiver_type = cg.id");
            $data->join('brands b', 'b.brand_id = cm.receiver_id', 'left');
        }
        $data->where("cg.working_time !=", '');
        if($id){
            $data->where("CONCAT(cm.sender_type, cm.sender_id) != ", 'admin' . $id);
            $data->where("cgrp.user_id", $id);
            $data->where("cgrp.user_type", "admin");
            $data->order_by("max(cm.timestamp_sent)", "DESC");
        }
        $data->order_by("cg.id", "ASC");
        if($id) {
            $data->group_by("cm.receiver_type, cm.receiver_id");
        }
        return $data->get()->result_array();
    }

    public function getChatsStatistics($input = array())
    {
        $data = $this->customerdb->select("cm.id, cm.timestamp_sent, cm.sender_type, cm.sender_id , b.name as brand_name, b.brand_id, cg.name as group_name, cg.id as group_id");
        $data->from('chat_messages cm');
        $data->join("chat_groups cg", "cm.receiver_type = cg.id", 'left');
        $data->join('brands b', 'b.brand_id = cm.receiver_id', 'left');
        $data->where("cg.working_time !=", '');
        if($input['admin'] && $input['admin'] != 0){
            $data->where("CONCAT(cm.sender_type, cm.sender_id) = ", 'admin' . $input['admin']);
        }
        if($input['chatGroup'] && $input['chatGroup'] != 0){
            $data->where("cm.receiver_type", $input['chatGroup']);
        }
        if($input['brandId'] && $input['brandId'] != 0) {
            $data->where("cm.receiver_id", $input['brandId']);
        }
        $data->where("cm.timestamp_sent >", $input['dateFrom']);
        $data->where("cm.timestamp_sent <", $input['dateTo']);
        $data->order_by("cm.id", "ASC");

        return $data->get()->result_array();
    }

    public function getGroupName($group_id){
        return $this->customerdb->select('name')->from("chat_groups")->where("id", $group_id)->get()->row('name');
    }

    public function getGroupsToEdit($group_id = false)
    {
        $query = $this->customerdb->select('cg.id, cg.name, p.description, cg.working_time');
        $query->from("chat_groups cg");
        $query->join("permissions p", "(p.title = cg.name COLLATE utf8_general_ci) AND p.type = 'Chat'", 'left');
        if ($group_id) {
            $query->where("cg.id", $group_id);
        }
        $query->where("cg.working_time !=", "");
        return $query->get()->result();
    }

    public function createGroup($name, $working_time)
    {
        $this->customerdb->insert('chat_groups', array('name' => $name, 'created' => date('Y-m-d H:i:s'), 'working_time' => $working_time));
        return $this->customerdb->insert_id();
    }

    public function changeGroup($name, $working_time, $chat_id)
    {
        $this->customerdb->set(array("name" => $name, 'working_time' => $working_time))->where("id", $chat_id)->update("chat_groups");
        return $chat_id;
    }

    public function createCustomerPermission($name, $description)
    {
        if ($this->customerdb->insert('permissions', array('type' => 'Chat', 'tag' => str_replace(" ", "_", 'chat_' . strtolower($name)), 'title' => $name, 'description' => $description))) {
            return true;
        }
        return false;
    }

    public function changeCustomerPermission($name, $description, $group_old_name)
    {
        if($this->customerdb->set(array('tag' => str_replace(" ", "_", 'chat_' . strtolower($name)), "title" => $name, 'description' => $description))->where("type", 'Chat')->where('title', $group_old_name)->update("permissions")){
            return true;
        }
        return false;
    }

    public function deleteCustomerChatGroupAndPermission($group_id)
    {
        $group_name = $this->getGroupName($group_id);
        if($this->customerdb->where('id', $group_id)->delete('chat_groups')){
            if($this->customerdb->where('type', 'Chat')->where('title', $group_name)->delete('permissions')){
                return true;
            }
        }
        return false;
    }

    public function getUsersParticipants($group_type, $group_id)
    {
        $owner = $this->db->select('user_id');
        $owner->from('user_brand');
        $owner->where('brand_id', $group_id);
        $owner->where('role_id', 1);
        $members = array();
        $owner = $owner->get()->row();
        if ($owner) {
            $owner->type = 'user';
            $members[] = $owner;
        }

        $group = $this->db->select('name');
        $group->from('chat_groups');
        $group->where('id', $group_type);
        $group_name = $group->get()->row('name');
        $group = str_replace(' ', '_', strtolower($group_name));

        $data = $this->db->select('up.user_id');
        $data->from('user_permission up');
        $data->join('permissions p', 'p.id = up.permission_id');
        $data->where('up.brand_id', $group_id);
        $data->where('p.tag LIKE "chat_' . $group . '"');
        $members_array = $data->get()->result_array();
        foreach ($members_array as $key => $value) {
            $member = (object)[];
            if (!$owner || $value['user_id'] != $owner->user_id) {
                $member->user_id = $value['user_id'];
                $member->type = 'user';
                $members[] = $member;
            }
        }
        return $members;
    }

    public function getAdminParticipants($group_id)
    {
        if ($group_id == 'false') {
            return [];
        }
        $query = $this->customerdb->select('user_id, user_type');
        $query->from("chat_group_participants");
        $query->where("group_id", $group_id);
        $participants = $query->get()->result_array();
        $list = array();
        foreach ($participants as $participant) {
            $data = $this->customerdb->select('SUBSTRING_INDEX( user_name, "@", 1 ) as name, user_id, "admin" as type');
            $data->from('admin_users');
            $data->where("user_id", $participant['user_id']);
            $result = $data->get()->row();
            array_push($list, $result);
        }
        return $list;
    }

    public function addParticipant($participant, $groupId)
    {
        $query = $this->db->get_where('chat_group_participants', array('group_id' => $groupId, 'user_id' => $participant['id'], 'user_type' => $participant['type']));
        $user = $query->row();
        if (!isset($user)) {
            $date = date('Y-m-d H:i:s');
            $this->customerdb->insert('chat_group_participants', array('group_id' => $groupId, 'user_id' => $participant['id'], 'user_type' => $participant['type'], 'added' => $date));
        }
    }

    public function deleteParticipant($participant, $groupId)
    {
        $this->customerdb->delete('chat_group_participants', ['group_id' => $groupId, 'user_id' => $participant['id'], 'user_type' => $participant['type']]);
    }
}