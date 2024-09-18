<?php

/**
 * Plugin Name: Staff 
 * Author: Husam Nasrallah
 * Author URI: https://github.com/tarycare
 * Version: 1.3.0
 * Description: Manage Staff Members
 * Text-Domain: staff
 * GitHub Plugin URI: tarycare/staff
 * GitHub Plugin URI: https://github.com/tarycare/staff
 */

if (! defined('ABSPATH')) : exit();
endif; // No direct access allowed.

/**
 * Define Plugins Contants
 */
define('PATH', trailingslashit(plugin_dir_path(__FILE__)));
define('URL', trailingslashit(plugins_url('/', __FILE__)));
/**
 * Loading Necessary Scripts
 */
// Plugin's main PHP file

// Enqueue and localize scripts
function load_scripts()
{
    $is_dev = defined('WP_ENV') && WP_ENV === 'development';

    if ($is_dev) {
        // Load from Webpack Dev Server during development
        wp_enqueue_script('wp-react', 'http://localhost:3000/plugins/staff/dist/staff.js', ['jquery', 'wp-element'], wp_rand(), true);
        wp_enqueue_style('wp-react-style', 'http://localhost:3000/plugins/staff/dist/style.css', [], wp_rand());
    } else {
        // Load the production bundle from the plugin directory
        wp_enqueue_script('wp-react', URL . 'plugins/staff/dist/bundle.js', ['jquery', 'wp-element'], wp_rand(), true);
        wp_enqueue_style('wp-react-style', URL . 'plugins/staff/dist/style.css', [], wp_rand());
    }

    // Localize script with handle 'wp-react' and variable 'appLocalizer'
    wp_localize_script('wp-react', 'appLocalizer', [
        'apiUrl' => home_url('/wp-json'),
        'nonce' => wp_create_nonce('wp_rest'),
    ]);
}
add_action('admin_enqueue_scripts', 'load_scripts');


require_once PATH . 'includes/admin.php';
require_once PATH . 'includes/api.php';
