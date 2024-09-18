<?php

/**
 * Plugin Name: Tary Platform
 * Description: A plugin to manage all the Tary's Platform.
 * Version: 1.0.3
 * Author: Husam Nasrallah
 * Text-Domain: platform
 * GitHub Plugin URI: tarycare/platform
 * GitHub Plugin URI: https://github.com/tarycare/platform
 */

// Define sub-plugins
$sub_plugins = [
    'staff' => [
        'label' => 'Staff Plugin',
        'dev_path' => 'dev-apps/staff/plugin.php',
        'prod_path' => 'apps/staff/plugin.php',
        'option_name' => 'tary_plugins_staff'
    ],
    'department' => [
        'label' => 'Department Plugin',
        'dev_path' => 'dev-apps/department/plugin.php',
        'prod_path' => 'apps/department/plugin.php',
        'option_name' => 'tary_plugins_department'
    ],
    'clinic' => [
        'label' => 'Clinic Plugin',
        'dev_path' => 'dev-apps/clinic/plugin.php',
        'prod_path' => 'apps/clinic/plugin.php',
        'option_name' => 'tary_plugins_clinic'
    ],
    'appointment' => [
        'label' => 'Appointment Plugin',
        'dev_path' => 'dev-apps/appointment/plugin.php',
        'prod_path' => 'apps/appointment/plugin.php',
        'option_name' => 'tary_plugins_appointment'
    ],
];

// Add menu to manage sub-plugins
add_action('admin_menu', 'tary_plugins_menu');

function tary_plugins_menu()
{
    add_menu_page(
        'Tary platform',
        'Tary platform',
        'manage_options',
        'tary_plugins',
        'tary_plugins_page',
        'dashicons-admin-generic',
        3
    );
}

// Display the settings page
function tary_plugins_page()
{
?>
    <div class="wrap">
        <h1>Tary Clinic Plugins</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('tary_plugins_options');
            do_settings_sections('tary_plugins');
            submit_button();
            ?>
        </form>
    </div>
<?php
}

// Register settings and sections dynamically
add_action('admin_init', 'tary_plugins_settings');
function tary_plugins_settings()
{
    global $sub_plugins;

    foreach ($sub_plugins as $plugin_key => $plugin) {
        register_setting('tary_plugins_options', $plugin['option_name']);
        add_settings_section(
            'tary_plugins_section',
            'Sub Plugins',
            null,
            'tary_plugins'
        );
        add_settings_field(
            $plugin['option_name'],
            $plugin['label'],
            function () use ($plugin) {
                $option = get_option($plugin['option_name'], 0);
                echo '<input type="checkbox" name="' . $plugin['option_name'] . '" ' . checked(1, $option, false) . ' value="1" />';
            },
            'tary_plugins',
            'tary_plugins_section'
        );
    }
}

// Set default sub-plugin activation state on main plugin activation
register_activation_hook(__FILE__, 'tary_plugins_activate');
function tary_plugins_activate()
{
    global $sub_plugins;

    foreach ($sub_plugins as $plugin_key => $plugin) {
        if (get_option($plugin['option_name']) === false) {
            update_option($plugin['option_name'], 1); // Set to active by default
        }
    }
}

// Load sub-plugins after all plugins are initialized
add_action('plugins_loaded', 'tary_plugins_load_subplugins');
function tary_plugins_load_subplugins()
{
    global $sub_plugins;

    foreach ($sub_plugins as $plugin) {
        if (get_option($plugin['option_name'], 1)) { // Default to active
            // Get the correct plugin path (production or development)
            $plugin_path = defined('WP_ENV') && WP_ENV === 'development'
                ? plugin_dir_path(__FILE__) . $plugin['dev_path']
                : plugin_dir_path(__FILE__) . $plugin['prod_path'];

            // Check if the file exists before requiring it
            if (file_exists($plugin_path)) {
                require_once $plugin_path;
            } else {
                error_log("Plugin file not found: " . $plugin_path);
            }
        }
    }
}

// Handle plugin activation and deactivation dynamically
foreach ($sub_plugins as $plugin_key => $plugin) {
    add_action('update_option_' . $plugin['option_name'], function ($old_value, $new_value) use ($plugin) {
        $plugin_path = defined('WP_ENV') && WP_ENV === 'development'
            ? $plugin['dev_path']
            : $plugin['prod_path'];

        $plugin_basename = plugin_basename(plugin_dir_path(__FILE__) . $plugin_path);

        // Activate or deactivate based on the option value
        if ($new_value == 1 && !is_plugin_active($plugin_basename)) {
            activate_plugin($plugin_basename);
        } elseif ($new_value == 0 && is_plugin_active($plugin_basename)) {
            deactivate_plugins($plugin_basename);
        }
    }, 10, 2);
}
