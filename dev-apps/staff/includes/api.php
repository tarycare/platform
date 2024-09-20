<?php

class WP_React_Settings_Rest_Route
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'create_rest_routes']);
        if (defined('WP_ENV') && WP_ENV === 'development') {

            add_action('rest_api_init', [$this, 'add_cors_headers']); // Add this line
        }
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
            'methods' => 'PATCH',
            'callback' => [$this, 'update_staff'],
            'permission_callback' => function () {
                return current_user_can('create_users') || current_user_can('edit_users');
            }
        ]);

        // get api to get current site id 
        register_rest_route('staff/v1', '/site', [
            'methods' => 'GET',
            'callback' => [$this, 'get_site_id'],
            'permission_callback' => '__return_true'
        ]);
    }

    // Function to get current site id
    public function get_site_id()
    {
        return rest_ensure_response([
            'site_id' => get_current_blog_id()
        ]);
    }

    // Function to add a user
    public function add_staff($request)
    {
        // Get all JSON parameters
        $parameters = $request->get_json_params();
        error_log('Parameters: ' . print_r($parameters, true)); // Log the parameters

        // Handle the required fields (email)
        $email = sanitize_email($parameters['staff_email']);

        // Check for missing required fields
        if (empty($email)) {
            return new WP_Error('missing_fields', 'Missing email field', array('status' => 400));
        }

        // Get the current site ID in a multisite environment
        $site_id = is_multisite() ? get_current_blog_id() : 1; // Default to 1 if not multisite

        // Prepend the site ID to the email
        $email_with_prefix = $site_id . '_' . $email;

        // Check if the email with the prefix already exists before attempting to create the user
        if (email_exists($email_with_prefix)) {
            return new WP_Error('user_exists', 'User already exists with this email', array('status' => 400));
        }

        // Generate a username and password for the user
        $username = sanitize_text_field($parameters['staff_email']); // Placeholder or generated username
        $password = wp_generate_password(); // Generate a random password

        // Multisite-specific user creation
        if (is_multisite()) {
            $user_id = wpmu_create_user($username, $password, $email_with_prefix);
            if (!$user_id) {
                return new WP_Error('user_creation_failed', 'Failed to create user', array('status' => 500));
            }
            add_user_to_blog(get_current_blog_id(), $user_id, 'subscriber');
        } else {
            // Single-site user creation
            $user_id = wp_create_user($username, $password, $email_with_prefix);
            if (is_wp_error($user_id)) {
                return new WP_Error('user_creation_failed', $user_id->get_error_message(), array('status' => 500));
            }
        }

        // Set the user role (subscriber by default)
        wp_update_user([
            'ID' => $user_id,
            'role' => 'subscriber'
        ]);

        // Save additional custom fields as user meta
        foreach ($parameters as $key => $value) {
            $meta_key = sanitize_key($key);
            $meta_value = maybe_serialize($value); // Handle arrays or complex values



            update_user_meta($user_id, $meta_key, $meta_value);
        }

        return rest_ensure_response([
            'success' => true,
            'message' => 'User created successfully',
            'user_id' => $user_id,
            'data' => $parameters
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
            // Check if the user has roles and if roles exist
            $user_roles = !empty($user->roles) ? implode(', ', $user->roles) : 'No role assigned';

            // Get user meta and flatten the array values
            $meta_data = get_user_meta($user->ID);
            $flattened_meta = [];
            foreach ($meta_data as $key => $value) {
                $flattened_meta[$key] = is_array($value) && isset($value[0]) ? $value[0] : $value;
            }

            $user_data[] = [
                'id' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'role' => $user_roles,
                'registered' => $user->user_registered,
                'meta' => $flattened_meta
            ];
        }

        return rest_ensure_response($user_data);
    }


    // Recursive unserialize function
    function recursive_unserialize($data)
    {
        // Ensure we are working with serialized data only
        if (!is_serialized($data)) {
            return $data;
        }

        // Keep unserializing until it's no longer serialized
        $unserialized_data = maybe_unserialize($data);
        while (is_serialized($unserialized_data)) {
            $unserialized_data = maybe_unserialize($unserialized_data);
        }

        return $unserialized_data;
    }

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
            'registered' => $user->user_registered
        ];

        // Append custom fields to the user data
        $custom_fields = get_user_meta($user_id);
        foreach ($custom_fields as $key => $value) {
            // Only unserialize if the data is serialized
            if (is_serialized($value[0])) {
                $user_data[$key] = $this->recursive_unserialize($value[0]); // Use $this->recursive_unserialize()
            } else {
                $user_data[$key] = $value[0]; // Not serialized, just use the value
            }
        }

        // remove  wp_capabilities with site id
        $site_id = get_current_blog_id(); // Use the current site or pass the desired site ID
        $capabilities_key = "wp_{$site_id}_capabilities";
        $user_level_key = "wp_{$site_id}_user_level";

        unset($user_data[$capabilities_key]);
        unset($user_data[$user_level_key]);
        // remove  wp_capabilities
        unset($user_data['wp_capabilities']);
        unset($user_data['wp_user_level']);


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
        // Delete all meta keys related to the user
        $meta_keys = get_user_meta($user_id, '', '');
        foreach ($meta_keys as $key => $value) {
            delete_user_meta($user_id, $key);
        }



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
            error_log('User not found for ID: ' . $user_id);
            return new WP_Error('user_not_found', 'User not found', array('status' => 404));
        }

        // Prepare array for user fields update (non-meta fields)
        $userdata = ['ID' => $user_id];

        // Get the incoming data from the request
        $new_display_name = sanitize_text_field($request->get_param('username'));
        $new_email = sanitize_email($request->get_param('email'));
        // $new_role = sanitize_text_field($request->get_param('role'));

        // Log the incoming request data
        error_log('Incoming data: ' . print_r($request->get_json_params(), true));

        // Only update fields that are provided
        if (!empty($new_display_name)) {
            $userdata['display_name'] = $new_display_name;
        }
        if (!empty($new_email)) {
            $userdata['user_email'] = $new_email;
        }



        // Log the user data before updating
        error_log('User data to be updated: ' . print_r($userdata, true));

        // Update the user data
        $updated = wp_update_user($userdata);
        if (is_wp_error($updated)) {
            error_log('Failed to update user: ' . print_r($updated->get_error_message(), true));
            return new WP_Error('user_update_failed', 'Failed to update user', array('status' => 500));
        }

        error_log('User updated successfully: ID ' . $user_id);

        // Handle additional custom fields (meta data)
        $meta_fields = $request->get_json_params();
        foreach ($meta_fields as $key => $value) {
            // Skip predefined fields and critical meta fields
            if (in_array($key, ['username', 'email', 'id', 'registered'])) {
                continue;
            }

            // Skip updating meta if the value is empty
            if (empty($value) && $value !== '0') {
                error_log('Skipped updating empty meta field: ' . $key);
                continue;
            }

            // Sanitize and update user meta
            $meta_key = sanitize_key($key);
            $meta_value = maybe_serialize($value);
            update_user_meta($user_id, $meta_key, $meta_value);

            // Log each meta key-value update
            error_log('Meta field updated: ' . $meta_key . ' => ' . print_r($meta_value, true));
        }

        // Log the final response
        error_log('User and meta data updated successfully for user ID: ' . $user_id);

        return rest_ensure_response([
            'success' => true,
            'message' => 'User and meta data updated successfully',
            'user_id' => $user_id,
            'data' => $meta_fields // Return the updated meta data
        ]);
    }
}

new WP_React_Settings_Rest_Route();
