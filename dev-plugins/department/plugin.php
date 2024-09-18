<?php

/**
 * Plugin Name: Departments 
 * Author: Husam Nasrallah
 * Author URI: https://github.com/tarycare
 * Version: 1.3.0
 * Description: Manage Departments Members
 * Text-Domain: Departments
 * GitHub Plugin URI: tarycare/staff
 * GitHub Plugin URI: https://github.com/tarycare/staff
 */

if (! defined('ABSPATH')) : exit();
endif; // No direct access allowed.
define('PATH_D', trailingslashit(plugin_dir_path(__FILE__)));
define('URL_D', trailingslashit(plugins_url('/', __FILE__)));


/**
 * Loading Necessary Scripts
 */
// Plugin's main PHP file

// Enqueue and localize scripts
function load_scripts2()
{
    $is_dev = defined('WP_ENV') && WP_ENV === 'development';

    if ($is_dev) {
        // Load from Webpack Dev Server during development
        wp_enqueue_script('wp-react', 'http://localhost:3000/plugins/department/dist/department.js', ['jquery', 'wp-element'], wp_rand(), true);
        wp_enqueue_style('wp-react-style', 'http://localhost:3000/plugins/department/dist/style.css', [], wp_rand());
    } else {
        // Load the production bundle from the plugin directory
        wp_enqueue_script('wp-react2', URL_D . 'dist/department.js', ['jquery', 'wp-element'], wp_rand(), true);
        wp_enqueue_style('wp-react2-style', URL_D . 'dist/style.css', [], wp_rand());
    }

    // Localize script with handle 'wp-react2' and variable 'appLocalizer'
    wp_localize_script('wp-react2', 'appLocalizer', [
        'apiUrl' => home_url('/wp-json'),
        'nonce' => wp_create_nonce('wp_rest'),
    ]);
}
add_action('admin_enqueue_scripts', 'load_scripts2');



require_once PATH_D . 'includes/admin.php';
require_once PATH_D . 'includes/api.php';
