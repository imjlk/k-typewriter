import {
	advanceTypewriterFrame,
	armReentryDelay,
	composeTypingUnits,
	createFallbackFrame,
	getNextStepDelay,
	getTypingUnits,
} from '../../src/typewriter-engine';

const baseOptions = {
	items: [ '안녕하세요, 세계', 'Animate without losing your fallback' ],
	fallbackText: '안녕하세요, 세계',
	loop: true,
	typeDelay: 20,
	transitionMode: 'backspace',
	deleteDelay: 20,
	pauseDelay: 200,
	startFromEmpty: false,
	startDelay: 300,
	startDelayMode: 'first-start',
};

describe( 'typewriter engine', () => {
	test( 'keeps Hangul typing units decomposed for live preview and frontend playback', () => {
		expect(
			getTypingUnits( '한글' )
				.slice( 0, 3 )
				.map( ( units, index, allUnits ) =>
					composeTypingUnits( allUnits.slice( 0, index + 1 ) )
				)
		).toEqual( [ 'ㅎ', '하', '한' ] );
	} );

	test( 'applies the start delay before the first animation step', () => {
		const frame = createFallbackFrame(
			baseOptions.items,
			baseOptions.fallbackText
		);

		expect( getNextStepDelay( frame, baseOptions ) ).toBe( 300 );
	} );

	test( 'applies the start delay at the beginning of each cycle when requested', () => {
		const cycleFrame = {
			displayText: '',
			itemIndex: 1,
			charIndex: 0,
			isDeleting: false,
			hasStarted: true,
			pendingReentryDelay: false,
		};

		expect(
			getNextStepDelay( cycleFrame, {
				...baseOptions,
				startDelayMode: 'every-cycle',
			} )
		).toBe( 300 );
	} );

	test( 'applies the start delay again after a re-entry', () => {
		const frame = armReentryDelay( {
			displayText: '안녕하세요, 세계',
			itemIndex: 0,
			charIndex: getTypingUnits( '안녕하세요, 세계' ).length,
			isDeleting: false,
			hasStarted: true,
			pendingReentryDelay: false,
		} );

		expect(
			getNextStepDelay( frame, {
				...baseOptions,
				startDelayMode: 'every-reentry',
			} )
		).toBe( 300 );
	} );

	test( 'switches from a custom static fallback to the actual first item on first start', () => {
		const frame = createFallbackFrame(
			baseOptions.items,
			'Static fallback copy'
		);

		expect(
			advanceTypewriterFrame( frame, {
				...baseOptions,
				fallbackText: 'Static fallback copy',
			} )
		).toEqual(
			expect.objectContaining( {
				displayText: '안녕하세요, 세계',
				hasStarted: true,
				pendingReentryDelay: false,
			} )
		);
	} );

	test( 'restarts the next message from empty when restart transition mode is enabled', () => {
		const frame = {
			displayText: '안녕하세요, 세계',
			itemIndex: 0,
			charIndex: getTypingUnits( '안녕하세요, 세계' ).length,
			isDeleting: false,
			hasStarted: true,
			pendingReentryDelay: false,
		};

		expect(
			advanceTypewriterFrame( frame, {
				...baseOptions,
				transitionMode: 'restart',
			} )
		).toEqual(
			expect.objectContaining( {
				displayText: '',
				itemIndex: 1,
				charIndex: 0,
				isDeleting: false,
			} )
		);
	} );

	test( 'can type the first message from an empty state when enabled', () => {
		const frame = createFallbackFrame(
			baseOptions.items,
			baseOptions.fallbackText
		);

		expect(
			advanceTypewriterFrame( frame, {
				...baseOptions,
				startFromEmpty: true,
			} )
		).toEqual(
			expect.objectContaining( {
				displayText: '',
				itemIndex: 0,
				charIndex: 0,
				isDeleting: false,
				hasStarted: true,
			} )
		);
	} );
} );
