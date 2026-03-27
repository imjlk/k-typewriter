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
	 * Register the block from metadata.
	 *
	 * @return void
	 */
	public static function register_blocks() {
		register_block_type(
			__DIR__ . '/../build',
			array(
				'render_callback' => array( __CLASS__, 'render_block' ),
			)
		);
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
		$settings         = self::sanitize_attributes( $attributes );
		$visible_fallback = self::get_visible_fallback_text( $settings );
		$seo_summary      = self::get_effective_seo_summary( $settings );
		$tag_name         = $settings['tagName'];
		$vertical_align   = 'flex-start';

		if ( 'middle' === $settings['verticalAlign'] ) {
			$vertical_align = 'center';
		} elseif ( 'bottom' === $settings['verticalAlign'] ) {
			$vertical_align = 'flex-end';
		}

		$text_style       = sprintf(
			'--k-typewriter-reserve-lines:%1$d;--k-typewriter-vertical-align:%2$s;',
			(int) $settings['reserveLines'],
			$vertical_align
		);
		$wrapper          = get_block_wrapper_attributes(
			array(
				'class' => 'k-typewriter-block',
			)
		);
		$context          = wp_json_encode(
			array(
				'items'               => $settings['items'],
				'displayText'         => $visible_fallback,
				'itemIndex'           => 0,
				'charIndex'           => 0,
				'isDeleting'          => false,
				'hasStarted'          => false,
				'pendingReentryDelay' => false,
				'fallbackText'        => $visible_fallback,
				'loop'                => $settings['loop'],
				'transitionMode'      => $settings['transitionMode'],
				'startFromEmpty'      => $settings['startFromEmpty'],
				'showCursor'          => $settings['showCursor'],
				'startOnView'         => $settings['startOnView'],
				'typeDelay'           => $settings['typeDelay'],
				'deleteDelay'         => $settings['deleteDelay'],
				'pauseDelay'          => $settings['pauseDelay'],
				'startDelay'          => $settings['startDelay'],
				'startDelayMode'      => $settings['startDelayMode'],
				'reducedMotion'       => false,
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
				<<?php echo esc_html( $tag_name ); ?>
					class="k-typewriter__text"
					style="<?php echo esc_attr( $text_style ); ?>"
					<?php if ( $seo_summary && $seo_summary !== $visible_fallback ) : ?>
						aria-label="<?php echo esc_attr( $seo_summary ); ?>"
					<?php endif; ?>
				>
					<span class="k-typewriter__line">
						<span class="k-typewriter__content" data-wp-text="context.displayText">
							<?php echo esc_html( $visible_fallback ); ?>
						</span>
						<span
							aria-hidden="true"
							class="k-typewriter__cursor"
							data-wp-bind--hidden="!context.showCursor"
						>
							|
						</span>
					</span>
				</<?php echo esc_html( $tag_name ); ?>>
			</div>
		</div>
		<?php

		return (string) ob_get_clean();
	}

	/**
	 * Return the translatable default sample messages.
	 *
	 * @return array<int,string>
	 */
	private static function get_default_items() {
		return array(
			__( '한 글자씩, 리듬 있게.', 'k-typewriter' ),
			__( 'Animate headlines in any language.', 'k-typewriter' ),
			__( 'Ship polished hero copy in minutes.', 'k-typewriter' ),
		);
	}

	/**
	 * Return the effective visible fallback.
	 *
	 * @param array<string,mixed> $settings Sanitized settings.
	 * @return string
	 */
	private static function get_visible_fallback_text( $settings ) {
		if ( 'custom' === $settings['fallbackMode'] && '' !== $settings['fallbackText'] ) {
			return $settings['fallbackText'];
		}

		return $settings['items'][0];
	}

	/**
	 * Return the effective SEO summary.
	 *
	 * @param array<string,mixed> $settings Sanitized settings.
	 * @return string
	 */
	private static function get_effective_seo_summary( $settings ) {
		if ( 'custom' === $settings['summaryMode'] && '' !== $settings['summaryText'] ) {
			return $settings['summaryText'];
		}

		$summary_list = self::format_locale_list( $settings['items'] );

		if ( '' === $summary_list ) {
			return '';
		}

		return sprintf(
			/* translators: %s: locale-aware list of animated messages. */
			__( 'Typewriter animation that sequentially types %s.', 'k-typewriter' ),
			$summary_list
		);
	}

	/**
	 * Format a locale-aware list summary.
	 *
	 * @param array<int,string> $items Messages to summarize.
	 * @return string
	 */
	private static function format_locale_list( $items ) {
		$items = array_values(
			array_filter(
				array_map(
					static function( $item ) {
						return trim( (string) $item );
					},
					$items
				)
			)
		);

		if ( empty( $items ) ) {
			return '';
		}

		if ( 1 === count( $items ) ) {
			return $items[0];
		}

		if ( function_exists( 'wp_sprintf_l' ) ) {
			return wp_sprintf_l( '%l', $items );
		}

		return implode( ', ', $items );
	}

	/**
	 * Sanitize and normalize block attributes.
	 *
	 * @param array $attributes Raw attributes.
	 * @return array<string,mixed>
	 */
	private static function sanitize_attributes( $attributes ) {
		$defaults = array(
			'items'              => self::get_default_items(),
			'typeDelay'          => 80,
			'transitionMode'     => 'backspace',
			'deleteDelay'        => 40,
			'pauseDelay'         => 1200,
			'startDelay'         => 0,
			'startDelayMode'     => 'first-start',
			'loop'               => true,
			'reserveLines'       => 1,
			'verticalAlign'      => 'top',
			'startFromEmpty'     => false,
			'showCursor'         => true,
			'startOnView'        => true,
			'fallbackMode'       => 'auto',
			'fallbackText'       => '',
			'summaryMode'        => 'auto',
			'summaryText'        => '',
			'tagName'            => 'p',
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
			$items = self::get_default_items();
		}

		$valid_tags        = array(
			'p',
			'div',
			'span',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'strong',
			'em',
			'small',
			'mark',
		);
		$valid_delay_modes = array(
			'first-start',
			'every-cycle',
			'every-reentry',
		);
		$valid_transition_modes = array(
			'backspace',
			'restart',
		);
		$valid_vertical_alignments = array(
			'top',
			'middle',
			'bottom',
		);
		$valid_content_modes = array(
			'auto',
			'custom',
		);
		$tag_name          = in_array( $attributes['tagName'], $valid_tags, true ) ? $attributes['tagName'] : $defaults['tagName'];
		$delay_mode        = in_array( $attributes['startDelayMode'], $valid_delay_modes, true ) ? $attributes['startDelayMode'] : $defaults['startDelayMode'];
		$transition_mode   = in_array( $attributes['transitionMode'], $valid_transition_modes, true ) ? $attributes['transitionMode'] : $defaults['transitionMode'];
		$fallback_text     = trim( wp_strip_all_tags( (string) $attributes['fallbackText'] ) );
		$summary_text      = trim(
			wp_strip_all_tags(
				(string) $attributes['summaryText']
			)
		);
		$fallback_mode     = in_array( $attributes['fallbackMode'], $valid_content_modes, true )
			? $attributes['fallbackMode']
			: $defaults['fallbackMode'];
		$summary_mode      = in_array( $attributes['summaryMode'], $valid_content_modes, true )
			? $attributes['summaryMode']
			: $defaults['summaryMode'];
		$vertical_align    = in_array( $attributes['verticalAlign'], $valid_vertical_alignments, true )
			? $attributes['verticalAlign']
			: $defaults['verticalAlign'];

		return array(
			'items'             => $items,
			'typeDelay'         => min( 300, max( 20, (int) $attributes['typeDelay'] ) ),
			'transitionMode'    => $transition_mode,
			'deleteDelay'       => min( 240, max( 10, (int) $attributes['deleteDelay'] ) ),
			'pauseDelay'        => min( 4000, max( 200, (int) $attributes['pauseDelay'] ) ),
			'startDelay'        => min( 5000, max( 0, (int) $attributes['startDelay'] ) ),
			'startDelayMode'    => $delay_mode,
			'loop'              => (bool) $attributes['loop'],
			'reserveLines'      => min( 6, max( 1, (int) $attributes['reserveLines'] ) ),
			'verticalAlign'     => $vertical_align,
			'startFromEmpty'    => (bool) $attributes['startFromEmpty'],
			'showCursor'        => (bool) $attributes['showCursor'],
			'startOnView'       => (bool) $attributes['startOnView'],
			'fallbackMode'      => $fallback_mode,
			'fallbackText'      => $fallback_text,
			'summaryMode'       => $summary_mode,
			'summaryText'       => $summary_text,
			'tagName'           => $tag_name,
		);
	}
}
