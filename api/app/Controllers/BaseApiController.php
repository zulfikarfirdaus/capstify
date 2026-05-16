<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class BaseApiController extends ResourceController
{
    protected $format = 'json';

    protected function success($data, int $code = 200)
    {
        return $this->respond(['status' => 'success', 'data' => $data], $code);
    }

    protected function error(string $message, int $code = 400)
    {
        return $this->respond(['status' => 'error', 'message' => $message], $code);
    }

    protected function isAdmin(): bool
    {
        $token = $this->request->getHeaderLine('Authorization');
        if (!$token) return false;
        $token = str_replace('Bearer ', '', $token);
        return $token === session()->get('admin_token');
    }

    protected function requireAuth()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        if (!$authHeader) {
            return $this->error('Unauthorized', 401);
        }
        $token = str_replace('Bearer ', '', $authHeader);
        $db = \Config\Database::connect();
        $stored = $db->table('admin_users')->where('session_token', $token)->get()->getRow();
        if (!$stored) {
            return $this->error('Unauthorized', 401);
        }
        return null;
    }
}
