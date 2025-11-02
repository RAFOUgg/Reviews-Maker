/**
 * Modal Diagnostic Script
 * Run this in the browser console to check modal configuration
 */

(function modalDiagnostic() {
    console.log('=== MODAL DIAGNOSTIC ===');

    // Check DOM elements
    const accountModal = document.getElementById('accountModal');
    const overlay = document.getElementById('accountModalOverlay');
    const dialog = document.querySelector('.account-dialog');
    const floatingBtn = document.getElementById('floatingAuthBtn');

    console.log('1. DOM Elements:');
    console.log('   - accountModal:', accountModal ? '✓ Found' : '✗ Missing');
    console.log('   - accountModalOverlay:', overlay ? '✓ Found' : '✗ Missing');
    console.log('   - account-dialog:', dialog ? '✓ Found' : '✗ Missing');
    console.log('   - floatingAuthBtn:', floatingBtn ? '✓ Found' : '✗ Missing');

    if (accountModal) {
        const computedStyle = window.getComputedStyle(accountModal);
        console.log('\n2. Account Modal Styles:');
        console.log('   - display:', computedStyle.display);
        console.log('   - position:', computedStyle.position);
        console.log('   - z-index:', computedStyle.zIndex);
        console.log('   - classList:', Array.from(accountModal.classList).join(', ') || 'none');
    }

    if (overlay) {
        const computedStyle = window.getComputedStyle(overlay);
        console.log('\n3. Overlay Styles:');
        console.log('   - display:', computedStyle.display);
        console.log('   - z-index:', computedStyle.zIndex);
        console.log('   - classList:', Array.from(overlay.classList).join(', ') || 'none');
    }

    console.log('\n4. Test Opening Modal:');
    console.log('   Run: openAccountModal()');

    console.log('\n=== END DIAGNOSTIC ===');
})();
