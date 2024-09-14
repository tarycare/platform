<?php
class WPRK_Create_Admin_Page
{
    public function __construct()
    {
        add_action('admin_menu', [$this, 'create_admin_menu']);
    }

    public function create_admin_menu()
    {
        $capability = 'manage_options';
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

    public function menu_page_template()
    {
        echo '<div class="wrap">
    <div id="wp-react-app"></div>
</div>';
    }
}

new WPRK_Create_Admin_Page();
