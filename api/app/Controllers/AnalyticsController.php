<?php

namespace App\Controllers;

class AnalyticsController extends BaseApiController
{
    private function db() { return \Config\Database::connect(); }

    public function visit()
    {
        $data = $this->request->getJSON(true);
        $page = isset($data['page']) ? substr($data['page'], 0, 255) : '/';
        $productId = isset($data['product_id']) ? (int)$data['product_id'] : null;

        $this->db()->table('analytics_visits')->insert([
            'page'       => $page,
            'product_id' => $productId,
            'ip_hash'    => hash('sha256', $this->request->getIPAddress()),
            'visited_at' => date('Y-m-d H:i:s'),
        ]);
        return $this->success(['ok' => true]);
    }

    public function click()
    {
        $data = $this->request->getJSON(true);
        $allowed = ['whatsapp', 'shopee', 'tiktok'];
        $type = $data['type'] ?? '';

        if (!in_array($type, $allowed)) return $this->error('Invalid click type');

        $productId = isset($data['product_id']) ? (int)$data['product_id'] : 0;
        if (!$productId) return $this->error('product_id required');

        $this->db()->table('analytics_clicks')->insert([
            'product_id' => $productId,
            'type'       => $type,
            'ip_hash'    => hash('sha256', $this->request->getIPAddress()),
            'clicked_at' => date('Y-m-d H:i:s'),
        ]);
        return $this->success(['ok' => true]);
    }
}
