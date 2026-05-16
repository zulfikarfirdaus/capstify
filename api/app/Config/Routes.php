<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */

// Public API routes
$routes->group('api', ['filter' => 'cors'], function ($routes) {
    $routes->options('(:any)', function () { return response()->setStatusCode(200); });

    $routes->get('hero',                    'PublicController::hero');
    $routes->get('categories',              'PublicController::categories');
    $routes->get('products',                'PublicController::products');
    $routes->get('products/(:num)',         'PublicController::product/$1');
    $routes->get('search',                  'PublicController::search');

    $routes->post('analytics/visit',        'AnalyticsController::visit');
    $routes->post('analytics/click',        'AnalyticsController::click');
});

// CMS Admin routes (protected by Bearer token)
$routes->group('api/admin', ['filter' => 'cors'], function ($routes) {
    $routes->options('(:any)', function () { return response()->setStatusCode(200); });

    $routes->post('login',                  'AdminController::login');
    $routes->post('logout',                 'AdminController::logout');

    $routes->get('settings',                'AdminController::getSettings');
    $routes->post('settings',               'AdminController::saveSettings');

    $routes->get('categories',              'AdminController::getCategories');
    $routes->post('categories',             'AdminController::createCategory');
    $routes->put('categories/(:num)',       'AdminController::updateCategory/$1');
    $routes->delete('categories/(:num)',    'AdminController::deleteCategory/$1');

    $routes->get('products',                'AdminController::getProducts');
    $routes->post('products',               'AdminController::createProduct');
    $routes->put('products/(:num)',         'AdminController::updateProduct/$1');
    $routes->delete('products/(:num)',      'AdminController::deleteProduct/$1');

    $routes->get('analytics',               'AdminController::getAnalytics');

    $routes->post('upload',                 'AdminController::upload');
});

