<?php
class WPRK_Create_Admin_Page
{
    public function __construct()
    {
        add_action('admin_init', 'allow_subscriber_access_plugins');

        // Hook into the 'init' action to ensure WordPress is fully loaded
        add_action('init', [$this, 'check_user_access']);
    }

    function allow_subscriber_access_plugins()
    {
        // Get the 'subscriber' role.
        $role = get_role('subscriber');

        // Add capability to manage plugins for a specific plugin (or a custom capability).
        if ($role) {
            // Example capability for a specific plugin
            $role->add_cap('staff');
        }
    }


    public function check_user_access()
    {
        // Check if the current user has admin capabilities
        $is_admin = current_user_can('administrator');

        // Get user meta data
        $user_meta = get_user_meta(get_current_user_id());
        error_log('user_meta: ' . print_r($user_meta, true));

        // Check if $user_meta is an array before accessing it
        $staff_access = '';
        if (is_array($user_meta) && isset($user_meta['staff_access'][0])) {
            $staff_access = $user_meta['staff_access'][0]; // Get the first value of the array
        }

        error_log('staff_access: ' . $staff_access);

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
        // Set a minimal capability, or use a custom capability check
        $capability = 'read'; // Ensure that 'read' is sufficient for members

        // Check if the current user has 'staff_access' set to 'member'
        $user_meta = get_user_meta(get_current_user_id(), 'wprk_user_meta', true);
        $staff_access = '';
        if (is_array($user_meta) && isset($user_meta['staff_access'])) {
            $staff_access = $user_meta['staff_access'];
        }

        if ($staff_access === 'member') {
            // Get the current user's locale
            $locale = determine_locale();
            $slug = 'staff';

            // Add a menu page for members
            if ($locale === 'ar' || $locale === 'ar_AR') {
                $menu_title = 'الأعضاء'; // Arabic for 'Members'
            } else {
                $menu_title = 'Members';
            }

            add_menu_page(
                $menu_title, // Page title
                $menu_title, // Menu title
                $capability, // Capability (ensure this is sufficient for members)
                $slug, // Menu slug
                [$this, 'menu_page_template'], // Callback function
                'dashicons-admin-users', // Icon
                3 // Position
            );
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
