<?php

/**
 * Plugin Name: Tary Clinic
 * Description: A plugin to manage all the clinic's apps.
 * Version: 1.0
 * Author: Husam Nasrallah
 */

// Define sub-plugins
$sub_plugins = [
    'staff' => [
        'label' => 'Staff Plugin',
        'dev_path' => 'dev-plugins/staff/plugin.php',
        'prod_path' => 'plugins/staff/plugin.php',
        'option_name' => 'tary_plugins_staff'
    ],
    'department' => [
        'label' => 'Department Plugin',
        'dev_path' => 'dev-plugins/department/plugin.php',
        'prod_path' => 'plugins/department/plugin.php',
        'option_name' => 'tary_plugins_department'
    ],
    // Add more sub-plugins here in the future
];

// Add menu to manage sub-plugins
add_action('admin_menu', 'tary_plugins_menu');

function tary_plugins_menu()
{
    add_menu_page(
        'Tary Clinic',
        'Tary Clinic',
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

// Load sub-plugins after all plugins are initialized
add_action('plugins_loaded', 'tary_plugins_load_subplugins');
function tary_plugins_load_subplugins()
{
    global $sub_plugins;

    foreach ($sub_plugins as $plugin) {
        if (get_option($plugin['option_name'], 0)) {
            $plugin_path = defined('WP_ENV') && WP_ENV === 'development'
                ? $plugin['dev_path']
                : $plugin['prod_path'];

            require_once plugin_dir_path(__FILE__) . $plugin_path;
        }
    }
}

// Handle plugin activation and deactivation
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
