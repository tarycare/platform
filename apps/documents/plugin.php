<?php
/*
Plugin Name: DO Spaces File Uploader API with Document Post Type
Description: Handle file uploads to DigitalOcean Spaces, create document post type with API support.
Version: 1.1
Author: Your Name
*/

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

require 'vendor/autoload.php'; // Include AWS SDK if using Composer

use Aws\S3\S3Client;

// Register Custom Post Type for Documents
function register_document_post_type()
{
    register_post_type('document', [
        'labels' => [
            'name' => 'Documents',
            'singular_name' => 'Document',
        ],
        'public' => true,
        'show_in_rest' => true,
        'supports' => ['title', 'editor', 'author'],
        'has_archive' => true,
        'rewrite' => ['slug' => 'documents'],
    ]);
}
add_action('init', 'register_document_post_type');

// Register Custom Taxonomies (Category and Tag) for Documents
function register_document_taxonomies()
{
    register_taxonomy('document_category', 'document', [
        'label' => 'Categories',
        'rewrite' => ['slug' => 'document-category'],
        'hierarchical' => true,
        'show_in_rest' => true,
    ]);

    register_taxonomy('document_tag', 'document', [
        'label' => 'Tags',
        'rewrite' => ['slug' => 'document-tag'],
        'hierarchical' => false,
        'show_in_rest' => true,
    ]);
}
add_action('init', 'register_document_taxonomies');

// Add custom fields (version, document date, expiry date) to REST API
function register_document_meta_fields()
{
    register_post_meta('document', 'version', [
        'show_in_rest' => true,
        'single' => true,
        'type' => 'string',
    ]);

    register_post_meta('document', 'document_date', [
        'show_in_rest' => true,
        'single' => true,
        'type' => 'string',
    ]);

    register_post_meta('document', 'expiry_date', [
        'show_in_rest' => true,
        'single' => true,
        'type' => 'string',
    ]);
}
add_action('init', 'register_document_meta_fields');

// Function to upload files to DO Spaces
function upload_file_to_do_spaces($file, $visibility)
{
    $s3 = new S3Client([
        'version' => 'latest',
        'region' => DO_SPACES_REGION,
        'endpoint' => 'https://sgp1.digitaloceanspaces.com',
        'credentials' => [
            'key' => DO_SPACES_KEY,
            'secret' => DO_SPACES_SECRET,
        ],
    ]);

    $file_path = $file['tmp_name'];
    $file_name = basename($file['name']);
    $acl = ($visibility === 'public') ? 'public-read' : 'private';

    try {
        $result = $s3->putObject([
            'Bucket' => DO_SPACES_BUCKET,
            'Key' => 'uploads/' . $file_name,
            'SourceFile' => $file_path,
            'ACL' => $acl,
        ]);

        return [
            'success' => true,
            'url' => $result['ObjectURL'],
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage(),
        ];
    }
}

// Register REST API route to handle document upload and post creation
add_action('rest_api_init', function () {
    register_rest_route('do-spaces/v1', '/upload-document', [
        'methods' => 'POST',
        'callback' => 'do_spaces_upload_and_create_document',
        'permission_callback' => function () {
            return is_user_logged_in(); // Ensure the user is logged in
        },
    ]);
});

// Handle the API request to upload file and create a document post
function do_spaces_upload_and_create_document(WP_REST_Request $request)
{
    $files = $request->get_file_params();
    $visibility = $request->get_param('visibility');
    $version = $request->get_param('version');
    $document_date = $request->get_param('document_date');
    $expiry_date = $request->get_param('expiry_date');
    $category = $request->get_param('category');
    $tags = $request->get_param('tags');

    $created_by = get_current_user_id();
    $created_date = date('Y-m-d H:i:s');
    $app_name = $request->get_param('app_name');
    $item_id = $request->get_param('item_id');
    $file_type = $request->get_param('file_type');

    if (isset($files['file'])) {
        $upload_result = upload_file_to_do_spaces($files['file'], $visibility);

        if ($upload_result['success']) {
            // Create document post
            $post_id = wp_insert_post([
                'post_title' => sanitize_text_field($files['file']['name']),
                'post_type' => 'document',
                'post_status' => 'publish',
                'meta_input' => [
                    'version' => sanitize_text_field($version),
                    'document_date' => sanitize_text_field($document_date),
                    'expiry_date' => sanitize_text_field($expiry_date),
                ],
            ]);

            if (is_wp_error($post_id)) {
                return new WP_REST_Response(['message' => 'Failed to create document post'], 500);
            }

            // Assign category and tags
            if (!empty($category)) {
                // Convert category string to array if necessary
                if (!is_array($category)) {
                    $category = explode(',', $category);
                }

                // Check if the category exists, if not create it
                foreach ($category as $cat) {
                    if (term_exists($cat, 'document_category')) {
                        wp_set_post_terms($post_id, $cat, 'document_category');
                    } else {
                        $new_category = wp_insert_term($cat, 'document_category');
                        if (!is_wp_error($new_category)) {
                            wp_set_post_terms($post_id, $new_category['term_id'], 'document_category');
                        } else {
                            error_log('Failed to create category: ' . $new_category->get_error_message());
                        }
                    }
                }
            }



            if (!empty($tags)) {
                // Convert tags string to array
                $tags = explode(',', $tags);
                wp_set_post_terms($post_id, $tags, 'document_tag');
            }

            // Add custom fields
            update_post_meta($post_id, 'visibility', $visibility);
            update_post_meta($post_id, 'created_by', $created_by);
            update_post_meta($post_id, 'created_date', $created_date);
            update_post_meta($post_id, 'app_name', $app_name);
            update_post_meta($post_id, 'item_id', $item_id);
            update_post_meta($post_id, 'file_type', $file_type);
            // url
            update_post_meta($post_id, 'url', $upload_result['url']);

            return new WP_REST_Response([
                'success' => true,
                'url' => $upload_result['url'],
                'post_id' => $post_id,
                'data' => $request->get_params(),
            ], 200);
        } else {
            return new WP_REST_Response($upload_result, 500);
        }
    }

    return new WP_REST_Response(['message' => 'No file uploaded'], 400);
}
