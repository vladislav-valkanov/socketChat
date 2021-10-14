<?php
//defined('BASEPATH') OR exit('No direct script access allowed');

use App\Core\BaseController;

class ChatController extends BaseController
{
    protected $user;

    public function __construct()
    {
        parent::__construct();
        $this->load->model('Chat');
        $this->load->model('Users_model');
    }

    public function window()
    {
        $this->base_auth->protect();
        $this->rbac_auth->protect();
        $this->load->model('Brand');
        if (getChatAccess() || isBrandOwner()) {
            echo $this->blade->view()->make('support/window_chat');
        } else {
            redirect('/');
        }
    }

    public function index()
    {
        $sender_id = $this->input->post('sender_id');
        $sender_type = $this->input->post('new_type');
        $messages_offset = $this->input->post('messages_offset');
        $id = $this->input->post('id');
        $chat_name = $this->Chat->getChatInfo($sender_id, $sender_type);
        if ($sender_id > 0) {
            if ($message = $this->Chat->get($id, $sender_id, $sender_type, $messages_offset)) {
                exit(json_encode(['id' => 'u' . $id, 'msg' => $messages_offset == 0 ? array_reverse($message) : $message, 'messages_offset' => $messages_offset, 'chatInfo' => $chat_name]));
            }
        }
        exit(json_encode(['id' => 'u' . $id, 'msg' => false, 'messages_offset' => $messages_offset, 'chatInfo' => $chat_name]));
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
        $chats['chats']['chatsList'] = $this->Chat->getChatAccess($id);
        $chats['chats']['notices'] = $this->Chat->getNotifications($id, $chats['chats']['chatsList']);
        $this->array_sort_by_column($chats['chats']['chatsList'], 'brand_id', SORT_DESC);
        $return['name'] = $this->Users_model->get_users_by_id($id)['firstname'];
        $return["id"] = $id;
        $return["type"] = "user";
        $return['chats'] = $chats;
        exit(json_encode($return));
    }

    private function getGroupsList($id)
    {
        if ($groups = $this->Chat->getGroups($id)) {
            return ['groupsList' => $groups, 'notices' => $this->Chat->getNotifications($id, $groups)];
        } else {
            return ['groupsList' => [], 'notices' => []];
        }
    }

    public function getParticipants()
    {
        $id = $this->input->post('id');
        if ($participants = $this->Chat->getParticipants($id, substr($this->input->post('groupId'), 1))) {
            exit(json_encode(['participants' => $participants]));
        } else {
            exit(json_encode(['participants' => false]));
        }
    }

    public function getLastMsgId()
    {
        if ($last_id = $this->Chat->getLastMsgId()) {
            exit($last_id);
        }
        exit(json_encode(false));
    }

    function send()
    {
        $msgs = $this->input->post();
        $exit = true;
        foreach ($msgs as $msg) {
            var_dump($msg);
            $data['sender_id'] = $msg['sender_id'];
            $data['receiver_id'] = $msg['receiver_id'];
            $data['sender_type'] = $msg['sender_type'];
            $data['receiver_type'] = $msg['receiver_type'];
            $data['message'] = $msg['message'];
            $data['msg_type'] = $msg['msg_type'];
            $data['timestamp_sent'] = date("Y-m-d H:i:s", strtotime($msg['sent']));
            $msgType = $this->Chat->saveMsg($data);
            if ($msgType) {
                if (env('APP_ENV') == 'production' && $data['sender_type'] == 'user') {
                    $chat_info = $this->Chat->getChatInfo($data['receiver_id'], $data['receiver_type']);
                    $chat_url = str_replace('://', '://admin.', env('APP_URL')) . '/index.php/chat/window?b=' . $data['receiver_id'] . '&g=' . $data['receiver_type'];

                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, 'https://hooks.slack.com/services/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');
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                    curl_setopt($ch, CURLOPT_USERAGENT, 'BetsatBrowser');
                    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                        "cache-control: no-cache",
                        "content-type: application/json"
                    ));
                    curl_setopt($ch, CURLOPT_POST, 1);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, '{
                "text": "' . $data['message'] . '",
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text":"' . $data['message'] . '"
                        }
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "mrkdwn",
                                "text": "Message to: ' . $chat_info['group'] . ' - (' . $chat_info['name'] . ') <' . $chat_url . '|go to chat>"
                            }
                        ]
                    },
                    {
                        "type": "divider"
                    }
                ]}');
                    curl_exec($ch);
                    curl_close($ch);
                }

            } else {
                $exit = false;
            }
        }
        exit($exit);
    }

    public function seen()
    {
        $msgs = $this->input->post('seen');
        $this->Chat->setToSeen($msgs);
    }

    function base64_encode_image($filename)
    {
        if ($filename) {
            $imgbinary = fread(fopen($filename, "r"), filesize($filename));
            return base64_encode($imgbinary);
        }
    }

    public function uploadImage()
    {
        $tmp_path = $_FILES['file']['tmp_name'];
        if (!(bool)getimagesize($tmp_path)) {
            exit(json_encode(["error" => "Wrong type of file!"]));
        }

        $client_id = "390e8a50faf3479";

        $pvars = array('image' => $this->base64_encode_image($tmp_path));
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
            CURLOPT_POSTFIELDS => $pvars,
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