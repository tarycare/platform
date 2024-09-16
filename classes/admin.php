<?php
class WPRK_Create_Admin_Page
{
    public function __construct()
    {
        // Hook into the 'init' action to ensure WordPress is fully loaded
        add_action('init', [$this, 'check_user_access']);
    }

    public function check_user_access()
    {
        // Check if the current user has admin capabilities
        $is_admin = current_user_can('administrator');

        // Get user meta data
        $user_meta = get_user_meta(get_current_user_id(), 'wprk_user_meta', true);

        // Check if $user_meta is an array before accessing it
        $staff_access = '';
        if (is_array($user_meta) && isset($user_meta['staff_access'])) {
            $staff_access = $user_meta['staff_access'];
        }

        // Add the appropriate admin menus based on user role
        if ($is_admin || $staff_access === 'admin') {
            add_action('admin_menu', [$this, 'create_admin_menu']);
        } else if ($staff_access === 'member') {
            add_action('admin_menu', [$this, 'create_member_menu']);
        }
    }

    public function create_admin_menu()
    {
        // Set a minimal capability
        $capability = 'read';
        $slug = 'staff';

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

        // Add a submenu page Admin 
        add_submenu_page(
            $slug, // Parent slug
            'Admin', // Page title
            'Admin', // Menu title
            $capability, // Capability
            'admin', // Menu slug
            [$this, 'menu_page_template'] // Callback function
        );
    }

    public function create_member_menu()
    {
        // Set a minimal capability
        $capability = 'read';
        $slug = 'staff';

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

    public function menu_page_template()
    {
        echo '<div class="wrap">
            <div id="wp-react-app"></div>
        </div>';
    }
}

new WPRK_Create_Admin_Page();
