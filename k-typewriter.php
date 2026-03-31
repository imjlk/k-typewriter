<?php
/**
 * Plugin Name:       K Typewriter
 * Plugin URI:        https://github.com/imjlk/k-typewriter
 * Description:       Add a configurable typewriter text block for hero headlines, notices, and multilingual messaging.
 * Version:           1.0.0
 * Requires at least: 6.6
 * Requires PHP:      8.0
 * Author:            imjlk
 * Author URI:        https://profiles.wordpress.org/imjlk/
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       k-typewriter
 *
 * @package KTypewriter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/includes/class-k-typewriter-plugin.php';

K_Typewriter_Plugin::boot();
