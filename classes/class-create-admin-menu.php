<?php

/**
 * This file will create admin menu page.
 */

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

        add_menu_page(
            __('Staff', 'Staff'),
            __('Staff', 'Staff'),
            $capability,
            $slug,
            [$this, 'menu_page_template'],
            'dashicons-admin-users',
        );
    }

    public function menu_page_template()
    {
        echo '<div class="wrap"><div id="wp-react-app"></div></div>';
    }
}
new WPRK_Create_Admin_Page();
