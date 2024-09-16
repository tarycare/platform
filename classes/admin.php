<?php
class WPRK_Create_Admin_Page
{
    public function __construct()
    {
        add_action('admin_menu', [$this, 'create_admin_menu']);
        add_action('admin_menu', [$this, 'filter_admin_menu_items'], 999); // High priority
    }

    public function create_admin_menu()
    {
        $capability = 'read'; // Set a minimal capability
        $slug = 'form-viewer';

        // Get the current user's locale
        $locale = determine_locale();

        // Set the menu title based on the user's language
        if ($locale === 'ar' || $locale === 'ar_AR') {
            $menu_title = 'الموظفين'; // Arabic for 'Staff'
        } else {
            $menu_title = 'Staff';
        }

        add_menu_page(
            $menu_title, // Page title
            $menu_title, // Menu title
            $capability, // Capability
            $slug, // Menu slug
            [$this, 'menu_page_template'], // Callback function
            'dashicons-admin-users', // Icon
            3 // Position
        );
    }

    public function filter_admin_menu_items()
    {
        // Get the current user
        $user = wp_get_current_user();

        // Check user meta
        $staff_access = get_user_meta($user->ID, 'staff_access', true);
        $department_access = get_user_meta($user->ID, 'department_access', true);

        // If neither meta key has the value 'admin', remove specific menu items
        if ($staff_access !== 'admin' && $department_access !== 'admin') {
            global $menu;

            foreach ($menu as $key => $item) {
                // $item[2] is the menu slug
                $slug = $item[2];

                // Get the plugin name before '_'
                $plugin_name = explode('_', $slug)[0];

                // Define the plugin names to show only to admins
                $plugins_to_restrict = ['pluginname']; // Replace with your plugin names

                if (in_array($plugin_name, $plugins_to_restrict)) {
                    unset($menu[$key]);
                }
            }
        }
    }

    public function menu_page_template()
    {
        echo '<div class="wrap">
            <div id="wp-react-app"></div>
        </div>';
    }
}

new WPRK_Create_Admin_Page();
