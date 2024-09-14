<?php

class WP_React_Settings_Rest_Route
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'create_rest_routes']);
        add_action('rest_api_init', [$this, 'add_cors_headers']); // Add this line

        add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']); // Enqueue scripts
    }
    // Add this new function to handle CORS headers
    public function add_cors_headers()
    {
        // Remove the default CORS headers
        remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');

        // Add custom CORS headers
        add_filter('rest_pre_serve_request', function ($value) {
            // Allow requests from localhost:4000 during development
            header('Access-Control-Allow-Origin: http://localhost:4000');
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: Authorization, X-WP-Nonce, Content-Type, Accept, Origin, X-Requested-With');

            return $value;
        });
    }


    // Enqueue and localize the script with nonce
    public function enqueue_scripts()
    {
        wp_enqueue_script(
            'my-staff-script',  // Unique handle for the script
            get_template_directory_uri() . 'dist/bundle.js',  // URL to the script
            array('jquery'),  // Optional dependencies
            null,  // No version
            true   // Load in footer
        );

        // Localize script to pass nonce and REST API root URL
        wp_localize_script('my-staff-script', 'myApiSettings', array(
            'root' => esc_url_raw(rest_url()),  // REST API base URL
            'nonce' => wp_create_nonce('wp_rest')  // Security nonce
        ));
    }



    public function create_rest_routes()
    {


        // Route for adding a user
        register_rest_route('staff/v1', '/add', [
            'methods' => 'POST',
            'callback' => [$this, 'add_staff'],
            'permission_callback' => function () {
                if (defined('WP_ENV') && WP_ENV === 'development') {
                    return '__return_true';
                } else {
                    return current_user_can('create_users') || current_user_can('edit_users');
                }
            }

        ]);

        // Route for fetching all users
        register_rest_route('staff/v1', '/all', [
            'methods' => 'GET',
            'callback' => [$this, 'get_all_users'],
            'permission_callback' => '__return_true'
        ]);

        // Route for fetching a specific user by ID
        register_rest_route('staff/v1', '/users/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_user_by_id'],
            'permission_callback' => '__return_true'
        ]);

        // Route for deleting a user
        register_rest_route('staff/v1', '/delete/(?P<id>\d+)', [
            'methods' => 'DELETE',
            'callback' => [$this, 'delete_staff'],
            'permission_callback' => function () {
                return current_user_can('create_users') || current_user_can('edit_users');
            }
        ]);

        // Route for updating a user
        register_rest_route('staff/v1', '/update/(?P<id>\d+)', [
            'methods' => 'POST',
            'callback' => [$this, 'update_staff'],
            'permission_callback' => function () {
                return current_user_can('create_users') || current_user_can('edit_users');
            }
        ]);
    }

    // Function to add a user
    public function add_staff($request)
    {

        //     if (defined('WP_ENV') && WP_ENV !== 'development') {
        //    {
        //         if (!current_user_can('create_users')) {
        //             return new WP_Error('permission_denied', 'You do not have permission to add users', array('status' => 403));
        //         }
        //     }



        // Get all JSON parameters
        $parameters = $request->get_json_params();
        error_log('Parameters: ' . print_r($parameters, true)); // Log the parameters

        // Handle the required fields (username, email, and password)
        $username = sanitize_text_field($parameters['staff_v1_Email']); // Use a placeholder or generate a username
        $email = sanitize_email($parameters['staff_v1_Email']);
        $password = wp_generate_password(); // Generate a random password

        // Check for missing required fields
        if (empty($email)) {
            return new WP_Error('missing_fields', 'Missing email field', array('status' => 400));
        }

        // Check if the email already exists
        if (email_exists($email)) {
            return new WP_Error('user_exists', 'User already exists with this email', array('status' => 400));
        }

        // Create the user with the email and generated password
        $user_id = wp_create_user($username, $password, $email);

        if (is_wp_error($user_id)) {
            return new WP_Error('user_creation_failed', $user_id->get_error_message(), array('status' => 500));
        }

        // Set the user role (subscriber by default)
        wp_update_user([
            'ID' => $user_id,
            'role' => 'subscriber'
        ]);

        // Remove the used parameters (in this case, just email)
        unset($parameters['staff_v1_Email']);

        // Save additional custom fields as user meta
        foreach ($parameters as $key => $value) {
            $meta_key = sanitize_key($key);
            $meta_value = maybe_serialize($value); // Handle arrays or complex values
            update_user_meta($user_id, $meta_key, $meta_value);
        }

        return rest_ensure_response([
            'success' => true,
            'message' => 'User created successfully',
            'user_id' => $user_id
        ], 201);
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
