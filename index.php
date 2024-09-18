<?php

/**
 * Plugin Name: Tary Clinic
 * Description: A plugin to manage all the clinic's apps.
 * Version: 1.0
 * Author: Husam Nasrallah
 */

// Add menu to manage sub-plugins
add_action('admin_menu', 'tary_plugins_menu');
function tary_plugins_menu()
{
    add_menu_page(
        'Tary Clinic',
        'Tary Clinic',
        'manage_options',
        'tary_plugins',
        'tary_plugins_page', // Fixed the typo here
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

// Register settings for activation/deactivation of sub-plugins
add_action('admin_init', 'tary_plugins_settings');
function tary_plugins_settings()
{
    register_setting('tary_plugins_options', 'tary_plugins_staff');
    register_setting('tary_plugins_options', 'tary_plugins_department');

    add_settings_section(
        'tary_plugins_section',
        'Sub Plugins',
        null,
        'tary_plugins'
    );

    add_settings_field(
        'tary_plugins_staff',
        'Staff Plugin',
        'tary_plugins_staff_callback',
        'tary_plugins',
        'tary_plugins_section'
    );

    add_settings_field(
        'tary_plugins_department',
        'Department Plugin',
        'tary_plugins_department_callback',
        'tary_plugins',
        'tary_plugins_section'
    );
}

// Output for Staff Plugin checkbox
function tary_plugins_staff_callback()
{
    $option = get_option('tary_plugins_staff', 0);
    echo '<input type="checkbox" name="tary_plugins_staff" ' . checked(1, $option, false) . ' value="1" />';
}

// Output for Department Plugin checkbox
function tary_plugins_department_callback()
{
    $option = get_option('tary_plugins_department', 0);
    echo '<input type="checkbox" name="tary_plugins_department" ' . checked(1, $option, false) . ' value="1" />';
}

// Require sub-plugin files so they are loaded
if (get_option('tary_plugins_staff', 0)) {
    require_once plugin_dir_path(__FILE__) . 'dev-plugins/staff/plugin.php';
}

if (get_option('tary_plugins_department', 0)) {
    require_once plugin_dir_path(__FILE__) . 'dev-plugins/department/plugin.php';
}

// Hook into option updates to handle plugin activation and deactivation
add_action('update_option_tary_plugins_staff', 'tary_plugins_staff_activation', 10, 2);
add_action('update_option_tary_plugins_department', 'tary_plugins_department_activation', 10, 2);

// Activation/Deactivation for Staff Plugin
function tary_plugins_staff_activation($old_value, $new_value)
{
    $staff_plugin = plugin_basename(plugin_dir_path(__FILE__) . 'dev-plugins/staff/plugin.php');

    // Activate the staff plugin
    if ($new_value == 1 && !is_plugin_active($staff_plugin)) {
        activate_plugin($staff_plugin);
    }
    // Deactivate the staff plugin
    elseif ($new_value == 0 && is_plugin_active($staff_plugin)) {
        deactivate_plugins($staff_plugin);
    }
}

// Activation/Deactivation for Department Plugin
function tary_plugins_department_activation($old_value, $new_value)
{
    $department_plugin = plugin_basename(plugin_dir_path(__FILE__) . 'dev-plugins/department/plugin.php');

    // Activate the department plugin
    if ($new_value == 1 && !is_plugin_active($department_plugin)) {
        activate_plugin($department_plugin);
    }
    // Deactivate the department plugin
    elseif ($new_value == 0 && is_plugin_active($department_plugin)) {
        deactivate_plugins($department_plugin);
    }
}
