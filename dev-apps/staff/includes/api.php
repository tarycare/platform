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
            header('Access-Control-Allow-Origin: http://localhost:3000');
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
        // Route for fetching all users
        register_rest_route('staff/v1', '/managers', [
            'methods' => 'GET',
            'callback' => [$this, 'get_all_managers'],
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


    // Function to get current site id
    public function get_site_id()
    {
        return rest_ensure_response([
            'site_id' => get_current_blog_id()
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

    // Function to get all managers
    public function get_all_managers($parameters)
    {
        // Get the user ID from the parameters
        $exclude_user_id = isset($parameters['id']) ? intval($parameters['id']) : 0;

        // Test with the 'administrator' role instead of 'editor'
        $args = [
            'orderby' => 'registered',
            'order' => 'DESC'
        ];

        $users = get_users($args);

        // Log how many users were found
        error_log('Total Users Found: ' . count($users));

        $user_data = [];

        foreach ($users as $user) {
            // Skip the user with the specified ID
            if ($user->ID == $exclude_user_id) {
                continue;
            }

            // Get user meta for first name and last name
            $first_name = get_user_meta($user->ID, 'first_name', true);
            $last_name = get_user_meta($user->ID, 'last_name', true);

            // Create label in both English and Arabic
            $label_en = $first_name . ' ' . $last_name;
            $label_ar = $first_name . ' ' . $last_name;

            $user_data[] = [
                'value' => $user->ID,
                'label_en' => $label_en,
                'label_ar' => $label_ar
            ];
        }

        return rest_ensure_response($user_data);
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
            'user_email' => $user->user_email,
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
    // Function to handle base64 image upload
    private function upload_base64_image($base64_image, $email)
    {
        $upload_dir = wp_upload_dir();
        $decoded_image = base64_decode($base64_image);

        if (!$decoded_image) {
            return new WP_Error('image_decode_error', 'Failed to decode image', array('status' => 400));
        }

        $filename = sanitize_file_name(md5($email) . '.png');
        $file_path = $upload_dir['path'] . '/' . $filename;
        $file_url = $upload_dir['url'] . '/' . $filename;

        // Save image to the uploads directory
        file_put_contents($file_path, $decoded_image);

        // Ensure the file is recognized as a valid WordPress media attachment
        $filetype = wp_check_filetype($filename, null);

        if (!$filetype['type']) {
            return new WP_Error('invalid_filetype', 'Invalid file type', array('status' => 400));
        }

        $attachment = array(
            'post_mime_type' => $filetype['type'],
            'post_title'     => sanitize_file_name($filename),
            'post_content'   => '',
            'post_status'    => 'inherit'
        );

        $attach_id = wp_insert_attachment($attachment, $file_path);

        // Include image.php for handling media uploads
        require_once(ABSPATH . 'wp-admin/includes/image.php');

        // Generate attachment metadata
        $attach_data = wp_generate_attachment_metadata($attach_id, $file_path);
        wp_update_attachment_metadata($attach_id, $attach_data);

        return $file_url; // Return the file URL
    }

    // Add staff function
    public function add_staff($request)
    {
        $parameters = $request->get_json_params();
        error_log('Parameters: ' . print_r($parameters, true)); // Log the parameters

        $email = sanitize_email($parameters['email']);
        if (empty($email)) {
            return new WP_Error('missing_fields', 'Missing email field', array('status' => 400));
        }

        // Handle image upload
        $image_url = null; // Default to null if no image is uploaded
        if (!empty($parameters['image'])) {
            $image = $parameters['image'];
            $image_url = $this->upload_base64_image($image, $email);
            if (is_wp_error($image_url)) {
                return $image_url; // Return the error if image upload fails
            }
        }

        $site_id = is_multisite() ? get_current_blog_id() : 1;
        $email_with_prefix = $site_id . '_' . $email;
        $username_with_prefix = $site_id . '_' . $email;

        if (email_exists($email_with_prefix)) {
            return new WP_Error('user_exists', 'User already exists with this email', array('status' => 400));
        }

        $password = wp_generate_password();
        $user_id = wp_create_user($username_with_prefix, $password, $email_with_prefix);
        if (is_wp_error($user_id)) {
            return new WP_Error('user_creation_failed', $user_id->get_error_message(), array('status' => 500));
        }

        wp_update_user([
            'ID' => $user_id,
            'role' => 'subscriber'
        ]);

        foreach ($parameters as $key => $value) {
            update_user_meta($user_id, sanitize_key($key), maybe_serialize($value));
        }

        if ($image_url) {
            update_user_meta($user_id, 'profile_image', $image_url);
        }

        return rest_ensure_response([
            'success' => true,
            'message' => 'User created successfully',
            'user_id' => $user_id,
            'profile_image' => $image_url
        ], 201);
    }

    // Update staff function
    public function update_staff($request)
    {
        $user_id = (int) $request->get_param('id');
        $existing_user = get_userdata($user_id);

        if (!$existing_user) {
            return new WP_Error('user_not_found', 'User not found', array('status' => 404));
        }

        $parameters = $request->get_json_params();
        $new_email = sanitize_email($request->get_param('email'));
        $site_id = is_multisite() ? get_current_blog_id() : 1;
        $new_email_with_prefix = $site_id . '_' . $new_email;

        if (email_exists($new_email_with_prefix) && $new_email_with_prefix !== $existing_user->user_email) {
            return new WP_Error('user_exists', 'User already exists with this email', array('status' => 400));
        }

        wp_update_user([
            'ID' => $user_id,
            'user_email' => $new_email_with_prefix,
            'display_name' => $new_email_with_prefix,
            'user_nicename' => $new_email_with_prefix
        ]);

        // Handle image upload if provided
        if (!empty($parameters['image'])) {
            $image = $parameters['image'];
            $image_url = $this->upload_base64_image($image, $new_email);
            if (is_wp_error($image_url)) {
                return $image_url;
            }
            update_user_meta($user_id, 'profile_image', $image_url);
        }

        foreach ($parameters as $key => $value) {
            if (!in_array($key, ['user_login', 'user_email', 'id', 'registered', 'username'])) {
                update_user_meta($user_id, sanitize_key($key), maybe_serialize($value));
            }
        }

        return rest_ensure_response([
            'success' => true,
            'message' => 'User updated successfully',
            'user_id' => $user_id
        ]);
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
}

new WP_React_Settings_Rest_Route();
