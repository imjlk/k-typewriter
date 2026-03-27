<?php
/**
 * Plugin runtime bootstrap.
 *
 * @package KTypewriter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class K_Typewriter_Plugin {
	const STORE_NAMESPACE = 'kTypewriter';

	/**
	 * Boot the plugin.
	 *
	 * @return void
	 */
	public static function boot() {
		add_action( 'init', array( __CLASS__, 'load_textdomain' ) );
		add_action( 'init', array( __CLASS__, 'register_blocks' ) );
	}

	/**
	 * Load translations.
	 *
	 * @return void
	 */
	public static function load_textdomain() {
		load_plugin_textdomain(
			'k-typewriter',
			false,
			dirname( plugin_basename( __DIR__ . '/../k-typewriter.php' ) ) . '/languages'
		);
	}

	/**
	 * Register the current and legacy block names.
	 *
	 * @return void
	 */
	public static function register_blocks() {
		$block = register_block_type(
			__DIR__ . '/../build',
			array(
				'render_callback' => array( __CLASS__, 'render_block' ),
			)
		);

		if ( $block instanceof WP_Block_Type ) {
			self::register_legacy_block( $block );
		}
	}

	/**
	 * Register the legacy block name to keep older content rendering.
	 *
	 * @param WP_Block_Type $block The primary block type.
	 * @return void
	 */
	private static function register_legacy_block( WP_Block_Type $block ) {
		$args = array(
			'api_version'          => $block->api_version,
			'title'                => __( 'K Typewriter (Legacy)', 'k-typewriter' ),
			'category'             => $block->category,
			'icon'                 => $block->icon,
			'attributes'           => $block->attributes,
			'supports'             => array_merge(
				is_array( $block->supports ) ? $block->supports : array(),
				array(
					'inserter' => false,
				)
			),
			'style_handles'        => $block->style_handles,
			'editor_style_handles' => $block->editor_style_handles,
			'editor_script_handles' => $block->editor_script_handles,
			'script_handles'       => $block->script_handles,
			'view_script_handles'  => $block->view_script_handles,
			'render_callback'      => array( __CLASS__, 'render_block' ),
		);

		if ( property_exists( $block, 'view_script_module_ids' ) ) {
			$args['view_script_module_ids'] = $block->view_script_module_ids;
		}

		register_block_type( 'create-block/k-typewriter', $args );
	}

	/**
	 * Render the block output.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Saved content.
	 * @param object $block      Block instance.
	 * @return string
	 */
	public static function render_block( $attributes, $content, $block ) {
		$settings   = self::sanitize_attributes( $attributes );
		$first_item = $settings['items'][0];
		$tag_name   = $settings['tagName'];
		$wrapper    = get_block_wrapper_attributes(
			array(
				'class' => 'k-typewriter-block',
			)
		);
		$context    = wp_json_encode(
			array(
				'items'         => $settings['items'],
				'displayText'   => $first_item,
				'itemIndex'     => 0,
				'charIndex'     => 0,
				'isDeleting'    => false,
				'loop'          => $settings['loop'],
				'showCursor'    => $settings['showCursor'],
				'startOnView'   => $settings['startOnView'],
				'typeDelay'     => $settings['typeDelay'],
				'deleteDelay'   => $settings['deleteDelay'],
				'pauseDelay'    => $settings['pauseDelay'],
				'reducedMotion' => false,
			),
			JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
		);

		if ( ! $context ) {
			return '';
		}

		ob_start();
		?>
		<div <?php echo $wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<div
				class="k-typewriter"
				data-wp-interactive="<?php echo esc_attr( self::STORE_NAMESPACE ); ?>"
				data-wp-context="<?php echo esc_attr( $context ); ?>"
				data-wp-init--typewriter="callbacks.init"
			>
				<<?php echo esc_html( $tag_name ); ?> class="k-typewriter__text" aria-atomic="true" aria-live="polite">
					<span class="k-typewriter__content" data-wp-text="context.displayText">
						<?php echo esc_html( $first_item ); ?>
					</span>
					<span
						aria-hidden="true"
						class="k-typewriter__cursor"
						data-wp-bind--hidden="!context.showCursor"
					>
						|
					</span>
				</<?php echo esc_html( $tag_name ); ?>>
			</div>
		</div>
		<?php

		return (string) ob_get_clean();
	}

	/**
	 * Sanitize and normalize block attributes.
	 *
	 * @param array $attributes Raw attributes.
	 * @return array<string,mixed>
	 */
	private static function sanitize_attributes( $attributes ) {
		$defaults = array(
			'items'       => array(
				__( '한 글자씩, 리듬 있게.', 'k-typewriter' ),
				__( 'Animate headlines in any language.', 'k-typewriter' ),
				__( 'Ship polished hero copy in minutes.', 'k-typewriter' ),
			),
			'typeDelay'   => 80,
			'deleteDelay' => 40,
			'pauseDelay'  => 1200,
			'loop'        => true,
			'showCursor'  => true,
			'startOnView' => true,
			'tagName'     => 'p',
		);

		$attributes = is_array( $attributes ) ? wp_parse_args( $attributes, $defaults ) : $defaults;
		$items      = array_values(
			array_filter(
				array_map(
					static function( $item ) {
						return trim( wp_strip_all_tags( (string) $item ) );
					},
					is_array( $attributes['items'] ) ? $attributes['items'] : $defaults['items']
				)
			)
		);

		if ( empty( $items ) ) {
			$items = $defaults['items'];
		}

		$valid_tags = array( 'p', 'h1', 'h2', 'div', 'span' );
		$tag_name   = in_array( $attributes['tagName'], $valid_tags, true ) ? $attributes['tagName'] : $defaults['tagName'];

		return array(
			'items'       => $items,
			'typeDelay'   => min( 300, max( 20, (int) $attributes['typeDelay'] ) ),
			'deleteDelay' => min( 240, max( 10, (int) $attributes['deleteDelay'] ) ),
			'pauseDelay'  => min( 4000, max( 200, (int) $attributes['pauseDelay'] ) ),
			'loop'        => (bool) $attributes['loop'],
			'showCursor'  => (bool) $attributes['showCursor'],
			'startOnView' => (bool) $attributes['startOnView'],
			'tagName'     => $tag_name,
		);
	}
}

