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
		add_action( 'init', array( __CLASS__, 'register_pattern_category' ) );
		add_action( 'init', array( __CLASS__, 'register_patterns' ) );
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
	 * Register the plugin pattern category.
	 *
	 * @return void
	 */
	public static function register_pattern_category() {
		if ( ! function_exists( 'register_block_pattern_category' ) ) {
			return;
		}

		register_block_pattern_category(
			'k-typewriter',
			array(
				'label'       => __( 'K Typewriter', 'k-typewriter' ),
				'description' => __( 'Ready-to-use patterns for K Typewriter.', 'k-typewriter' ),
			)
		);
	}

	/**
	 * Register bundled block patterns.
	 *
	 * @return void
	 */
	public static function register_patterns() {
		if ( ! function_exists( 'register_block_pattern' ) ) {
			return;
		}

		foreach ( glob( __DIR__ . '/../patterns/*.php' ) as $pattern_file ) {
			$pattern = require $pattern_file;

			if ( ! is_array( $pattern ) || empty( $pattern['slug'] ) ) {
				continue;
			}

			$slug = (string) $pattern['slug'];
			unset( $pattern['slug'] );
			register_block_pattern( $slug, $pattern );
		}
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
		$inline_width_ch  = self::get_approximate_inline_width_ch( $settings );
		$tag_name         = $settings['tagName'];
		$cursor_class     = 'transition' === $settings['cursorAnimationMode']
			? 'k-typewriter__cursor k-typewriter__cursor--transition'
			: 'k-typewriter__cursor k-typewriter__cursor--blink';
		$root_classes     = array( 'k-typewriter', 'is-paused' );
		$text_direction   = 'auto' === $settings['textDirection'] ? 'auto' : $settings['textDirection'];
		$vertical_align   = 'flex-start';

		if ( 'middle' === $settings['verticalAlign'] ) {
			$vertical_align = 'center';
		} elseif ( 'bottom' === $settings['verticalAlign'] ) {
			$vertical_align = 'flex-end';
		}

		$text_style_parts = array(
			sprintf( '--k-typewriter-reserve-lines:%d', (int) $settings['reserveLines'] ),
			sprintf( '--k-typewriter-vertical-align:%s', $vertical_align ),
			sprintf( '--k-typewriter-cursor-width:%.2Fem', (float) $settings['cursorWidth'] ),
			sprintf( '--k-typewriter-cursor-height-scale:%.3F', (float) $settings['cursorHeight'] / 0.86 ),
			sprintf( '--k-typewriter-cursor-offset-x:%.2Fem', (float) $settings['cursorOffsetX'] ),
			sprintf( '--k-typewriter-cursor-offset-y:%.2Fem', (float) $settings['cursorOffsetY'] ),
			sprintf( '--k-typewriter-cursor-blink-speed:%dms', (int) $settings['cursorBlinkSpeed'] ),
			sprintf( '--k-typewriter-cursor-transition-speed:%dms', (int) $settings['cursorTransitionSpeed'] ),
		);

		if ( $settings['inlineLayout'] && null !== $inline_width_ch ) {
			$text_style_parts[] = sprintf( '--k-typewriter-inline-width:%dch', $inline_width_ch );
			$root_classes[]     = 'has-inline-width';
		}

		$text_style       = implode( ';', $text_style_parts ) . ';';
		$wrapper          = get_block_wrapper_attributes(
			array(
				'class' => $settings['inlineLayout'] ? 'k-typewriter-block is-inline-layout' : 'k-typewriter-block',
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
				'inlineLayout'        => $settings['inlineLayout'],
				'inlineWidthMode'     => $settings['inlineWidthMode'],
				'cursorAnimationMode' => $settings['cursorAnimationMode'],
				'showCursor'          => $settings['showCursor'],
				'cursorVisible'       => $settings['showCursor'],
				'hideCursorWhenComplete' => $settings['hideCursorWhenComplete'],
				'isPlaying'           => false,
				'isPaused'            => true,
				'isComplete'          => false,
				'isHoverPaused'       => false,
				'hasInlineWidthReserve' => $settings['inlineLayout'] && 'auto' !== $settings['inlineWidthMode'],
				'useBlinkCursor'      => 'blink' === $settings['cursorAnimationMode'],
				'useTransitionCursor' => 'transition' === $settings['cursorAnimationMode'],
				'inlineSize'          => '',
				'reservedMinHeight'   => '',
				'reservedMinBlockSize' => '',
				'startOnView'         => $settings['startOnView'],
				'pauseOnHover'        => $settings['pauseOnHover'],
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
					class="<?php echo esc_attr( implode( ' ', $root_classes ) ); ?>"
					data-wp-interactive="<?php echo esc_attr( self::STORE_NAMESPACE ); ?>"
					data-wp-context="<?php echo esc_attr( $context ); ?>"
					data-wp-init--typewriter="callbacks.init"
					data-wp-class--is-playing="context.isPlaying"
					data-wp-class--is-paused="context.isPaused"
					data-wp-class--is-complete="context.isComplete"
					data-wp-class--is-hover-paused="context.isHoverPaused"
					data-wp-class--has-inline-width="context.hasInlineWidthReserve"
				>
				<<?php echo esc_html( $tag_name ); ?>
					class="k-typewriter__text"
					<?php if ( $text_direction ) : ?>
						dir="<?php echo esc_attr( $text_direction ); ?>"
					<?php endif; ?>
					style="<?php echo esc_attr( $text_style ); ?>"
					<?php if ( $seo_summary && $seo_summary !== $visible_fallback ) : ?>
						aria-label="<?php echo esc_attr( $seo_summary ); ?>"
					<?php endif; ?>
					data-wp-style--inline-size="context.inlineSize"
					data-wp-style--min-height="context.reservedMinHeight"
					data-wp-style--min-block-size="context.reservedMinBlockSize"
				>
					<span class="k-typewriter__line">
						<span class="k-typewriter__content" data-wp-text="context.displayText">
							<?php echo esc_html( $visible_fallback ); ?>
						</span>
						<span
							aria-hidden="true"
							class="<?php echo esc_attr( $cursor_class ); ?>"
							data-wp-bind--hidden="!context.cursorVisible"
							data-wp-class--k-typewriter__cursor--blink="context.useBlinkCursor"
							data-wp-class--k-typewriter__cursor--transition="context.useTransitionCursor"
						></span>
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
	 * Return the approximate inline width in ch units for SSR fallback.
	 *
	 * @param array<string,mixed> $settings Sanitized settings.
	 * @return int|null
	 */
	private static function get_approximate_inline_width_ch( $settings ) {
		if ( 'auto' === $settings['inlineWidthMode'] ) {
			return null;
		}

		if ( 'characters' === $settings['inlineWidthMode'] ) {
			return min( 9999, max( 1, (int) $settings['inlineWidthCh'] ) );
		}

		$messages = array_values(
			array_unique(
				array_filter(
					array_merge(
						$settings['items'],
						array( self::get_visible_fallback_text( $settings ) )
					)
				)
			)
		);
		$longest  = 24;

		foreach ( $messages as $message ) {
			if ( function_exists( 'mb_strlen' ) ) {
				$longest = max( $longest, (int) mb_strlen( $message ) );
			} else {
				$longest = max( $longest, strlen( $message ) );
			}
		}

		return min( 9999, max( 1, $longest ) );
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
			'inlineLayout'       => false,
			'inlineWidthMode'    => 'auto',
			'inlineWidthCh'      => 24,
			'textDirection'      => 'auto',
			'startFromEmpty'     => false,
			'showCursor'         => true,
			'cursorAnimationMode' => 'blink',
			'cursorWidth'        => 0.08,
			'cursorHeight'       => 0.86,
			'cursorOffsetX'      => 0,
			'cursorOffsetY'      => 0,
			'cursorBlinkSpeed'   => 1000,
			'cursorTransitionSpeed' => 900,
			'hideCursorWhenComplete' => false,
			'startOnView'        => true,
			'pauseOnHover'       => false,
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
		$valid_text_directions = array(
			'auto',
			'ltr',
			'rtl',
		);
		$valid_inline_width_modes = array(
			'auto',
			'characters',
			'measure',
		);
		$valid_cursor_animation_modes = array(
			'blink',
			'transition',
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
		$text_direction    = in_array( $attributes['textDirection'], $valid_text_directions, true )
			? $attributes['textDirection']
			: $defaults['textDirection'];
		$inline_width_mode = in_array( $attributes['inlineWidthMode'], $valid_inline_width_modes, true )
			? $attributes['inlineWidthMode']
			: $defaults['inlineWidthMode'];
		$cursor_animation_mode = in_array( $attributes['cursorAnimationMode'], $valid_cursor_animation_modes, true )
			? $attributes['cursorAnimationMode']
			: $defaults['cursorAnimationMode'];

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
			'inlineLayout'      => (bool) $attributes['inlineLayout'],
			'inlineWidthMode'   => $inline_width_mode,
			'inlineWidthCh'     => min( 9999, max( 1, (int) $attributes['inlineWidthCh'] ) ),
			'textDirection'     => $text_direction,
			'startFromEmpty'    => (bool) $attributes['startFromEmpty'],
			'showCursor'        => (bool) $attributes['showCursor'],
			'cursorAnimationMode' => $cursor_animation_mode,
			'cursorWidth'       => min( 0.24, max( 0.04, (float) $attributes['cursorWidth'] ) ),
			'cursorHeight'      => min( 1.2, max( 0.6, (float) $attributes['cursorHeight'] ) ),
			'cursorOffsetX'     => min( 0.3, max( -0.3, (float) $attributes['cursorOffsetX'] ) ),
			'cursorOffsetY'     => min( 0.3, max( -0.3, (float) $attributes['cursorOffsetY'] ) ),
			'cursorBlinkSpeed'  => min( 2000, max( 200, (int) $attributes['cursorBlinkSpeed'] ) ),
			'cursorTransitionSpeed' => min( 2000, max( 200, (int) $attributes['cursorTransitionSpeed'] ) ),
			'hideCursorWhenComplete' => (bool) $attributes['hideCursorWhenComplete'],
			'startOnView'       => (bool) $attributes['startOnView'],
			'pauseOnHover'      => (bool) $attributes['pauseOnHover'],
			'fallbackMode'      => $fallback_mode,
			'fallbackText'      => $fallback_text,
			'summaryMode'       => $summary_mode,
			'summaryText'       => $summary_text,
			'tagName'           => $tag_name,
		);
	}
}
