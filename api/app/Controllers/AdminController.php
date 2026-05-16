<?php

namespace App\Controllers;

class AdminController extends BaseApiController
{
    private function db() { return \Config\Database::connect(); }

    private function checkToken(): bool
    {
        $auth  = $this->request->getHeaderLine('Authorization');
        $token = trim(str_replace('Bearer', '', $auth));
        if (!$token) return false;
        $row = $this->db()->table('admin_users')->where('session_token', $token)->get()->getRow();
        return (bool) $row;
    }

    // ── Auth ────────────────────────────────────────────────
    public function login()
    {
        $data     = $this->request->getJSON(true) ?? $this->request->getPost();
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        $user = $this->db()->table('admin_users')->where('username', $username)->get()->getRow();
        if (!$user || !password_verify($password, $user->password)) {
            return $this->error('Invalid credentials', 401);
        }

        $token = bin2hex(random_bytes(32));
        $this->db()->table('admin_users')->where('id', $user->id)->update(['session_token' => $token]);
        return $this->success(['token' => $token, 'username' => $user->username]);
    }

    public function logout()
    {
        $auth  = $this->request->getHeaderLine('Authorization');
        $token = trim(str_replace('Bearer', '', $auth));
        $this->db()->table('admin_users')->where('session_token', $token)->update(['session_token' => null]);
        return $this->success(['message' => 'Logged out']);
    }

    // ── Settings ─────────────────────────────────────────────
    public function getSettings()
    {
        if (!$this->checkToken()) return $this->error('Unauthorized', 401);
        $rows = $this->db()->table('settings')->get()->getResultArray();
        $data = [];
        foreach ($rows as $r) $data[$r['key']] = $r['value'];
        return $this->success($data);
    }

    public function saveSettings()
    {
        if (!$this->checkToken()) return $this->error('Unauthorized', 401);
        $data = $this->request->getJSON(true) ?? $this->request->getPost();
        foreach ($data as $key => $value) {
            $exists = $this->db()->table('settings')->where('key', $key)->get()->getRow();
            if ($exists) {
                $this->db()->table('settings')->where('key', $key)->update(['value' => $value]);
            } else {
                $this->db()->table('settings')->insert(['key' => $key, 'value' => $value]);
            }
        }
        return $this->success(['message' => 'Settings saved']);
    }

    // ── Categories ───────────────────────────────────────────
    public function getCategories()
    {
        if (!$this->checkToken()) return $this->error('Unauthorized', 401);
        $rows = $this->db()->table('categories')->orderBy('sort_order')->get()->getResultArray();
        return $this->success($rows);
    }

    public function createCategory()
    {
        if (!$this->checkToken()) return $this->error('Unauthorized', 401);
        $data = $this->request->getJSON(true) ?? $this->request->getPost();
        if (empty($data['slug'])) {
            $data['slug'] = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $data['name'] ?? ''));
        }
        $this->db()->table('categories')->insert($data);
        return $this->success(['id' => $this->db()->insertID()]);
    }

    public function updateCategory($id)
    {
        if (!$this->checkToken()) return $this->error('Unauthorized', 401);
        $data = $this->request->getJSON(true) ?? $this->request->getPost();
        $this->db()->table('categories')->where('id', $id)->update($data);
        return $this->success(['message' => 'Updated']);
    }

    public function deleteCategory($id)
    {
        if (!$this->checkToken()) return $this->error('Unauthorized', 401);
        $inUse = $this->db()->table('products')->where('category_id', $id)->countAllResults();
        if ($inUse > 0) return $this->error('Category has products — reassign them first', 400);
        $this->db()->table('categories')->where('id', $id)->delete();
        return $this->success(['message' => 'Deleted']);
    }

    // ── Products ─────────────────────────────────────────────
    public function getProducts()
    {
        if (!$this->checkToken()) return $this->error('Unauthorized', 401);
        $rows = $this->db()->table('products p')
            ->join('categories c', 'c.id = p.category_id')
            ->select('p.*, c.name as category_name')
            ->orderBy('p.sort_order')
            ->orderBy('p.created_at', 'DESC')
            ->get()->getResultArray();
        foreach ($rows as &$row) {
            $row['images']  = $row['images']  ? json_decode($row['images'],  true) : [];
            $row['details'] = $row['details'] ? json_decode($row['details'], true) : null;
        }
        return $this->success($rows);
    }

    public function createProduct()
    {
        if (!$this->checkToken()) return $this->error('Unauthorized', 401);
        $data = $this->request->getJSON(true) ?? $this->request->getPost();
        if (empty($data['slug'])) {
            $data['slug'] = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $data['name'] ?? ''));
        }
        if (isset($data['images']) && is_array($data['images'])) {
            $data['images'] = json_encode($data['images']);
        }
        if (isset($data['details']) && is_array($data['details'])) {
            $data['details'] = json_encode($data['details']);
        }
        if (isset($data['price']) && $data['price'] === '') $data['price'] = null;
        $this->db()->table('products')->insert($data);
        return $this->success(['id' => $this->db()->insertID()]);
    }

    public function updateProduct($id)
    {
        if (!$this->checkToken()) return $this->error('Unauthorized', 401);
        $data = $this->request->getJSON(true) ?? $this->request->getPost();
        if (isset($data['images']) && is_array($data['images'])) {
            $data['images'] = json_encode($data['images']);
        }
        if (isset($data['details']) && is_array($data['details'])) {
            $data['details'] = json_encode($data['details']);
        }
        if (isset($data['price']) && $data['price'] === '') $data['price'] = null;
        $this->db()->table('products')->where('id', $id)->update($data);
        return $this->success(['message' => 'Updated']);
    }

    public function deleteProduct($id)
    {
        if (!$this->checkToken()) return $this->error('Unauthorized', 401);
        $this->db()->table('products')->where('id', $id)->delete();
        return $this->success(['message' => 'Deleted']);
    }

    // ── Analytics ────────────────────────────────────────────
    public function getAnalytics()
    {
        if (!$this->checkToken()) return $this->error('Unauthorized', 401);

        $range = $this->request->getGet('range') ?? '7d';
        $days  = match($range) { '30d' => 30, '90d' => 90, default => 7 };
        $since = date('Y-m-d 00:00:00', strtotime("-{$days} days"));

        $db = $this->db();

        $visitRows = $db->query(
            "SELECT DATE(visited_at) as date, COUNT(*) as count
             FROM analytics_visits WHERE visited_at >= ?
             GROUP BY DATE(visited_at) ORDER BY date ASC",
            [$since]
        )->getResultArray();

        $clickRows = $db->query(
            "SELECT DATE(clicked_at) as date, type, COUNT(*) as count
             FROM analytics_clicks WHERE clicked_at >= ?
             GROUP BY DATE(clicked_at), type ORDER BY date ASC",
            [$since]
        )->getResultArray();

        $totals = [
            'visits'   => array_sum(array_column($visitRows, 'count')),
            'whatsapp' => 0, 'shopee' => 0, 'tiktok' => 0,
        ];
        foreach ($clickRows as $r) $totals[$r['type']] += (int)$r['count'];

        return $this->success([
            'visits'  => $visitRows,
            'clicks'  => $clickRows,
            'totals'  => $totals,
        ]);
    }

    // ── Upload ───────────────────────────────────────────────
    public function upload()
    {
        if (!$this->checkToken()) return $this->error('Unauthorized', 401);

        $file = $this->request->getFile('image');
        if (!$file || !$file->isValid()) return $this->error('No valid file uploaded');

        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array(strtolower($file->getExtension()), $allowed)) {
            return $this->error('Invalid file type');
        }

        $newName = $file->getRandomName();
        $file->move(FCPATH . 'uploads', $newName);

        return $this->success(['url' => base_url('uploads/' . $newName)]);
    }
}
