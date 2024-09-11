<?php

class WP_React_Settings_Rest_Route
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'create_rest_routes']);
    }

    public function create_rest_routes()
    {
        // Route for adding a user
        register_rest_route('doc/v1', '/add-staff', [
            'methods' => 'POST',
            'callback' => [$this, 'add_staff'],
            'permission_callback' => '__return_true'
        ]);

        // Route for fetching all users
        register_rest_route('doc/v1', '/users', [
            'methods' => 'GET',
            'callback' => [$this, 'get_all_users'],
            'permission_callback' => '__return_true'
        ]);

        // Route for fetching a specific user by ID
        register_rest_route('doc/v1', '/users/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_user_by_id'],
            'permission_callback' => '__return_true'
        ]);

        // Route for deleting a user
        register_rest_route('doc/v1', '/delete-staff/(?P<id>\d+)', [
            'methods' => 'DELETE',
            'callback' => [$this, 'delete_staff'],
            'permission_callback' => '__return_true'
        ]);

        // Route for updating a user
        register_rest_route('doc/v1', '/update-staff/(?P<id>\d+)', [
            'methods' => 'POST',
            'callback' => [$this, 'update_staff'],
            'permission_callback' => '__return_true'
        ]);
    }

    // Function to add a user
    public function add_staff($request)
    {
        $username = sanitize_text_field($request->get_param('username'));
        $email = sanitize_email($request->get_param('email'));
        $password = sanitize_text_field($request->get_param('password'));

        if (username_exists($username) || email_exists($email)) {
            return new WP_Error('user_exists', 'User already exists', array('status' => 400));
        }

        $user_id = wp_create_user($username, $password, $email);

        if (is_wp_error($user_id)) {
            return new WP_Error('user_creation_failed', $user_id->get_error_message(), array('status' => 500));
        }

        wp_update_user([
            'ID' => $user_id,
            'role' => 'subscriber'
        ]);

        return rest_ensure_response([
            'success' => true,
            'message' => 'User created successfully',
            'user_id' => $user_id
        ]);
    }

    // Function to get all users
    public function get_all_users()
    {
        $args = [
            'role__in' => ['subscriber', 'editor', 'administrator'],
            'orderby' => 'registered',
            'order' => 'DESC'
        ];

        $users = get_users($args);
        $user_data = [];

        foreach ($users as $user) {
            $user_data[] = [
                'id' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'role' => implode(', ', $user->roles),
                'registered' => $user->user_registered
            ];
        }

        return rest_ensure_response($user_data);
    }

    // Function to get a user by ID
    public function get_user_by_id($request)
    {
        $user_id = (int) $request->get_param('id');
        $user = get_userdata($user_id);

        if (!$user) {
            return new WP_Error('user_not_found', 'User not found', array('status' => 404));
        }

        $user_data = [
            'id' => $user->ID,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'role' => implode(', ', $user->roles),
            'registered' => $user->user_registered,
        ];

        return rest_ensure_response($user_data);
    }

    // Function to delete a user
    public function delete_staff($request)
    {
        $user_id = (int) $request->get_param('id');

        if (!get_userdata($user_id)) {
            return new WP_Error('user_not_found', 'User not found', array('status' => 404));
        }

        require_once(ABSPATH . 'wp-admin/includes/user.php');
        wp_delete_user($user_id);

        return rest_ensure_response([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }

    // Function to update a user
    public function update_staff($request)
    {
        $user_id = (int) $request->get_param('id');

        // Fetch the existing user data
        $existing_user = get_userdata($user_id);

        if (!$existing_user) {
            return new WP_Error('user_not_found', 'User not found', array('status' => 404));
        }

        // Get the current values for username, email, and display name
        $current_display_name = $existing_user->display_name;
        $current_email = $existing_user->user_email;

        // Get the incoming data from the request
        $new_display_name = sanitize_text_field($request->get_param('username')) ?: $current_display_name;
        $new_email = sanitize_email($request->get_param('email')) ?: $current_email;

        // Merge the existing and new data
        $userdata = [
            'ID' => $user_id,
            'display_name' => $new_display_name, // Update display name instead of username
            'user_email' => $new_email,
        ];

        // Update the user
        $updated = wp_update_user($userdata);

        if (is_wp_error($updated)) {
            return new WP_Error('user_update_failed', 'Failed to update user', array('status' => 500));
        }

        return rest_ensure_response([
            'success' => true,
            'message' => 'User updated successfully',
            'user_id' => $user_id
        ]);
    }
}

new WP_React_Settings_Rest_Route();
