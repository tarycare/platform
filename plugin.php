<?php

/**
 * Plugin Name: WP React
 * Author: Husam nasrallah
 * Author URI: https://github.com/robicse11127
 * Version: 1.0.12
 * Description: WordPress React
 * Text-Domain: wp-react
 * GitHub Plugin URI: abusiraj84/wp-react
 * GitHub Plugin URI: https://github.com/abusiraj84/wp-react


 */

if (! defined('ABSPATH')) : exit();
endif; // No direct access allowed.

/**
 * Define Plugins Contants
 */
define('WPRK_PATH', trailingslashit(plugin_dir_path(__FILE__)));
define('WPRK_URL', trailingslashit(plugins_url('/', __FILE__)));

/**
 * Loading Necessary Scripts
 */
add_action('admin_enqueue_scripts', 'load_scripts');
function load_scripts()
{
    $is_dev = defined('WP_ENV') && WP_ENV === 'development';

    if ($is_dev) {
        // Load from Webpack Dev Server
        wp_enqueue_script('wp-react-', 'http://localhost:3000/dist/bundle.js', ['jquery', 'wp-element'], wp_rand(), true);
        wp_enqueue_style('wp-react-style', 'http://localhost:3000/dist/style.css', [], wp_rand());
    } else {
        // Load the production bundle from the plugin directory
        wp_enqueue_script('wp-react', WPRK_URL . 'dist/bundle.js', ['jquery', 'wp-element'], wp_rand(), true);
        wp_enqueue_style('wp-react-style', WPRK_URL . 'dist/style.css', [], wp_rand());
    }

    wp_localize_script('wp-react', 'appLocalizer', [
        'apiUrl' => home_url('/wp-json'),
        'nonce' => wp_create_nonce('wp_rest'),
    ]);
}


require_once WPRK_PATH . 'classes/class-create-admin-menu.php';
require_once WPRK_PATH . 'classes/class-create-settings-routes.php';
