<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class Cors extends BaseConfig
{
    public array $default = [
        'allowedOrigins'         => ['https://darkslategray-grasshopper-522345.hostingersite.com', 'http://localhost:5175', 'http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'],
        'allowedOriginsPatterns' => ['https://[a-z0-9-]+\.trycloudflare\.com', 'https://[a-z0-9-]+\.hostingersite\.com'],
        'supportsCredentials'    => true,
        'allowedHeaders'         => ['Content-Type', 'Authorization', 'X-Requested-With'],
        'exposedHeaders'         => [],
        'allowedMethods'         => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'maxAge'                 => 7200,
    ];
}
