<?php

namespace App\Controllers;

class PublicController extends BaseApiController
{
    private function db() { return \Config\Database::connect(); }

    public function hero()
    {
        $rows = $this->db()->table('settings')->get()->getResultArray();
        $data = [];
        foreach ($rows as $r) $data[$r['key']] = $r['value'];
        return $this->success($data);
    }

    public function categories()
    {
        $rows = $this->db()->table('categories')->orderBy('sort_order')->get()->getResultArray();
        return $this->success($rows);
    }

    public function products()
    {
        $db = $this->db();
        $builder = $db->table('products p')
            ->join('categories c', 'c.id = p.category_id')
            ->select('p.*, c.name as category_name, c.slug as category_slug')
            ->orderBy('p.sort_order')
            ->orderBy('p.created_at', 'DESC');

        $category = $this->request->getGet('category');
        $featured = $this->request->getGet('featured');
        $newArrivals = $this->request->getGet('new');
        $limit = (int)($this->request->getGet('limit') ?? 0);

        if ($category) $builder->where('c.slug', $category);
        if ($featured)  $builder->where('p.featured', 1);
        if ($newArrivals) $builder->where('p.is_new_arrival', 1);
        if ($limit > 0) $builder->limit($limit);

        $rows = $builder->get()->getResultArray();
        foreach ($rows as &$row) {
            $row['images']  = $row['images']  ? json_decode($row['images'],  true) : [];
            $row['details'] = $row['details'] ? json_decode($row['details'], true) : null;
        }
        return $this->success($rows);
    }

    public function product($id)
    {
        $row = $this->db()->table('products p')
            ->join('categories c', 'c.id = p.category_id')
            ->select('p.*, c.name as category_name, c.slug as category_slug')
            ->where('p.id', $id)
            ->get()->getRowArray();

        if (!$row) return $this->error('Product not found', 404);
        $row['images']  = $row['images']  ? json_decode($row['images'],  true) : [];
        $row['details'] = $row['details'] ? json_decode($row['details'], true) : null;
        return $this->success($row);
    }

    public function search()
    {
        $q = $this->request->getGet('q');
        if (!$q || strlen(trim($q)) < 2) return $this->success([]);

        $rows = $this->db()->table('products p')
            ->join('categories c', 'c.id = p.category_id')
            ->select('p.*, c.name as category_name, c.slug as category_slug')
            ->groupStart()
                ->like('p.name', $q)
                ->orLike('p.description', $q)
            ->groupEnd()
            ->orderBy('p.sort_order')
            ->get()->getResultArray();

        foreach ($rows as &$row) {
            $row['images']  = $row['images']  ? json_decode($row['images'],  true) : [];
            $row['details'] = $row['details'] ? json_decode($row['details'], true) : null;
        }
        return $this->success($rows);
    }
}
