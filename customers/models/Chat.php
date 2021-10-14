<?php

class Chat extends Model
{
    public function getGroups($id)
    {
        $data = $this->db->select("cg.id, cg.name, max(cm.timestamp_sent) AS sent, max(cm.message) as message, CONCAT('group', '') as type");
        $data->from('chat_groups cg');
        $data->join('chat_group_participants cgrp', 'cg.id = cgrp.group_id', 'left');
        $data->join("chat_messages cm", "cm.id = (SELECT max(cm.id) FROM chat_messages cm WHERE ((cg.id = cm.sender_id AND cm.sender_type = 'group') OR (cg.id = receiver_id AND receiver_type = 'group')))", "left");
        $data->where("cgrp.user_id", $id);
        $data->group_by("cg.id");
        $data->order_by("max(cm.timestamp_sent)", "DESC");
        $data->order_by("cg.id", "ASC");
        $result = $data->get()->result_array();
        return $result;
    }

    public function getChatInfo($id, $type)
    {
        switch ($type) {
            case 'user':
                $data = $this->db->select('firstname as name, CONCAT("user", "") as type');
                $data->from('users');
                $data->where("user_id", $id);
                $result = $data->get()->row();
                break;
            case 'admin':
                $data = $this->db->select('SUBSTRING_INDEX(user_name, "@", 1 ) as name, CONCAT("admin", "") as type, typeId');
                $data->from('admin_users');
                $data->where("user_id", $id);
                $result = $data->get()->row();
                break;
            case 'group':
                $data = $this->db->select('name, CONCAT("group", "") as type');
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

    public function getParticipants($user_id, $group_id)
    {
        $query = $this->db->select('user_id, user_type');
        $query->from("chat_group_participants");
        $query->where("group_id", $group_id);
        $query->where("user_id !=", $user_id);
        $participants = $query->get()->result_array();
        $list = array();
        foreach ($participants as $participant) {
            switch ($participant["user_type"]) {
                case 'user':
                    $data = $this->db->select('firstname as name');
                    $data->from('users');
                    $data->where("user_id", $participant['user_id']);
                    $result = $data->get()->row();
                    break;
                case 'admin':
                    $data = $this->db->select('SUBSTRING_INDEX( user_name, "@", 1 ) as name');
                    $data->from('admin_users');
                    $data->where("user_id", $participant['user_id']);
                    $result = $data->get()->row();
                    break;
            }
            array_push($list, $result);
        }
        return $list;
    }

    public function get($id, $sender_id, $sender_type, $offset = 0)
    {
        $data = $this->db->select('id, message, sender_id, sender_type, DATE_FORMAT(timestamp_sent,"%d.%m.%Y %H:%i:%s") AS sent, seen_user_id as seen, msg_type');
        $data->from('chat_messages');
        if ($sender_type == 'admin' || $sender_type == 'user') {
            $data->group_start();
            $data->or_group_start();
            $data->where("sender_id", $id);
            $data->where("sender_type", 'user');
            $data->where("receiver_type", $sender_type);
            $data->where("receiver_id", $sender_id);
            $data->group_end();
            $data->or_group_start();
            $data->where("sender_id", $sender_id);
            $data->where("sender_type", $sender_type);
            $data->where("receiver_type", 'user');
            $data->where("receiver_id", $id);
            $data->group_end();
            $data->group_end();
        } else {
            $data->where("receiver_id", $sender_id);
            $data->where("receiver_type", $sender_type);
        }
        $data->limit(20, $offset);
        $data->order_by("id", "DESC");
//        $data->limit($limit);
//        $data->offset($offset);
        $result = $data->get()->result_array();
        foreach ($result as $key => $msg) {
            $result[$key]['username'] = $this->getChatInfo($msg['sender_id'], $msg['sender_type']);
        }
        return $result;
    }

    public function getLastMsgId()
    {
        $data = $this->db->select('MAX(id) as last_id')->from('chat_messages');
        return $data->get()->row('last_id');
    }

    function saveMsg($data)
    {
        $this->db->insert('chat_messages', $data);
        return true;
    }

    public function setToSeen($msgs)
    {
        foreach ($msgs as $msg_id => $ids) {
            $this->db->set('seen_user_id', "CONCAT(seen_user_id, '{$ids}')", false)
                ->where(['id' => $msg_id])
                ->update('chat_messages');
        }
    }

    public function getNotifications($id, $groups = false)
    {
        if ($groups && count($groups) > 0) {
            $where = [];
            foreach ($groups as $group) {
                $where[] = "'" . $group['brand_id'] . "-" . $group['id'] . "'";
            }
            $data = $this->db->select('cm.receiver_id, cm.receiver_type, MAX(cm.timestamp_sent) as sent, MAX(cm.message) as message, CONCAT(cg.name, " - ", b.name) as name');
            $data->from('chat_messages cm');
            $data->join('brands b', 'b.brand_id = cm.receiver_id');
            $data->join('chat_groups cg', 'cg.id = cm.receiver_type');
            $data->where('cm.receiver_type >', 0);
            $data->where("cm.sender_id !=", $id);
            $data->where("cm.sender_type !=", 'user');
            $data->where("cm.seen_user_id NOT LIKE '%u{$id}%'");
            $data->where("CONCAT(cm.receiver_id, '-', cm.receiver_type) IN (" . implode(',', $where) . ")");
            $data->order_by("MAX(cm.timestamp_sent)", 'DESC');
            $data->group_by("cm.receiver_id, cm.receiver_type");
            $result = $data->get()->result_array();
            return $result;
        }
        return false;
    }

    public function getChatAccess($user_id)
    {
        $data = $this->db->select('p.id, up.brand_id, b.name as brand_name, p.tag, p.title');
        $data->from('user_permission up');
        $data->join('permissions p', 'p.id = up.permission_id', 'left');
        $data->join('brands b', 'b.brand_id = up.brand_id', 'left');
        $data->where('up.user_id', $user_id);
        $data->where('p.tag LIKE "chat_%"');

        $permissions = $data->get()->result_array();
        $brands = isBrandOwner($user_id);
        if ($brands) {
            $return = [];
            $removeBrand = 0;
            foreach ($permissions as $perm) {
                if ($brands && false != ($key = array_search($perm['brand_id'], $brands))) {
                    $data = $this->db->select('id, tag, title');
                    $data->from('permissions');
                    $data->where('tag LIKE "chat_%"');
                    $groups = $data->get()->result_array();
                    foreach ($groups as $group) {
                        $perm['id'] = $group['id'];
                        $perm['title'] = $group['title'];
                        $perm['tag'] = $group['tag'];
                        $return[] = $perm;

                    }
                    $removeBrand = $perm['brand_id'];
                    unset($brands[$key]);
                } else {
                    if ($perm['brand_id'] != $removeBrand) {
                        $return[] = $perm;
                    }
                }
            }
            if (count($brands) > 0) {
                foreach ($brands as $brand) {
                    $data = $this->db->select('id, tag, title');
                    $data->from('permissions');
                    $data->where('tag LIKE "chat_%"');
                    $perms = $data->get()->result_array();

                    $data = $this->db->select('name');
                    $data->from('brands');
                    $data->where('brand_id', $brand);
                    $brand_name = $data->get()->row()->name;
                    foreach ($perms as $perm) {
                        $perm['brand_id'] = $brand;
                        $perm['brand_name'] = $brand_name;
                        $return[] = $perm;
                    }
                }
            }
        } else {
            $return = $permissions;
        }

        foreach ($return as $key => $turn) {
            $data = $this->db->select('id, working_time');
            $data->from('chat_groups');
            $data->where('name', $turn['title']);
            $group = $data->get()->row();
            if($group){
                $return[$key]['id'] = $group->id;
                $return[$key]['working_time'] = $group->working_time;
            }
        }

        return $return;
    }

    public function getBrandMembers($group, $brand_id)
    {
        $data = $this->db->select('user_id');
        $data->from('user_brand');
        $data->where('brand_id', $brand_id);
        $data->where('role_id', 1);
        $members = array();
        $members[] = $data->get()->row('user_id');
        $data = $this->db->select('up.user_id');
        $data->from('user_permission up');
        $data->join('permissions p', 'p.id = up.permission_id');
        $data->where('up.brand_id', $brand_id);
        $data->where('p.tag LIKE "chat_' . $group . '%"');
        $members_array = $data->get()->result_array();
        foreach ($members_array as $value) {
            $members[] = $value['user_id'];
        }
        return $members;
    }
}