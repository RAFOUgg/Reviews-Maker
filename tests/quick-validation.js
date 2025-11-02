/**
 * Tests de validation rapide - Reviews-Maker v2.0
 * 
 * À exécuter dans la console du navigateur (F12)
 * URL: http://localhost:3000/?debug=1
 * 
 * @date 2025-11-02
 */

(async function runQuickTests() {
    console.log('🧪 Starting Quick Validation Tests...\n');

    const tests = [];
    let passed = 0;
    let failed = 0;

    // Helper
    function test(name, fn) {
        tests.push({ name, fn });
    }

    function assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    // ============================================================================
    // STORAGE TESTS
    // ============================================================================

    test('StorageManager: Basic get/set', () => {
        const storage = window.__RM_INTERNAL__?.storage;
        assert(storage, 'StorageManager not found');

        storage.set('test_key', 'test_value');
        const value = storage.get('test_key');
        assert(value === 'test_value', 'Get/set failed');

        storage.remove('test_key');
        assert(storage.get('test_key') === null, 'Remove failed');
    });

    test('StorageManager: JSON serialization', () => {
        const storage = window.__RM_INTERNAL__?.storage;
        const obj = { a: 1, b: 'test', c: [1, 2, 3] };

        storage.set('test_obj', obj);
        const retrieved = storage.get('test_obj');
        assert(JSON.stringify(retrieved) === JSON.stringify(obj), 'JSON serialization failed');

        storage.remove('test_obj');
    });

    test('StorageManager: TTL expiration', async () => {
        const storage = window.__RM_INTERNAL__?.storage;

        storage.setWithTTL('test_ttl', 'value', 1000); // 1s TTL
        assert(storage.getWithTTL('test_ttl') === 'value', 'TTL set failed');

        // Wait for expiry
        await new Promise(resolve => setTimeout(resolve, 1100));
        assert(storage.getWithTTL('test_ttl') === null, 'TTL expiry failed');
    });

    test('StorageManager: Keys listing', () => {
        const storage = window.__RM_INTERNAL__?.storage;

        storage.set('k1', '1');
        storage.set('k2', '2');

        const keys = storage.keys();
        assert(keys.includes('k1'), 'Keys not listed');
        assert(keys.includes('k2'), 'Keys not listed');

        storage.remove('k1');
        storage.remove('k2');
    });

    // ============================================================================
    // API TESTS
    // ============================================================================

    test('ReviewsAPI: Availability check', async () => {
        const api = window.__RM_INTERNAL__?.reviewsAPI;
        assert(api, 'ReviewsAPI not found');

        const available = await api.checkAvailability();
        console.log(`  ℹ️  API available: ${available}`);
        // Don't fail if API not available (peut être en mode frontend-only)
    });

    test('ReviewsAPI: List reviews', async () => {
        const api = window.__RM_INTERNAL__?.reviewsAPI;
        if (!api.enabled) {
            console.log('  ⚠️  Skipped (API not available)');
            return;
        }

        const reviews = await api.listReviews({ mode: 'all' });
        assert(Array.isArray(reviews), 'listReviews should return array');
        console.log(`  ℹ️  Found ${reviews.length} reviews`);
    });

    test('ReviewsAPI: Get me (if authenticated)', async () => {
        const api = window.__RM_INTERNAL__?.reviewsAPI;
        const storage = window.__RM_INTERNAL__?.storage;

        if (!api.enabled) {
            console.log('  ⚠️  Skipped (API not available)');
            return;
        }

        const token = storage.get('auth_token');
        if (!token) {
            console.log('  ⚠️  Skipped (not authenticated)');
            return;
        }

        const me = await api.getMe();
        console.log(`  ℹ️  User: ${me?.email || 'unknown'}`);
    });

    // ============================================================================
    // MODAL TESTS
    // ============================================================================

    test('ModalManager: Open/close modal', () => {
        const modalManager = window.__RM_INTERNAL__?.modalManager;
        assert(modalManager, 'ModalManager not found');

        // Create a test modal
        const testModal = document.createElement('div');
        testModal.id = 'testModal';
        testModal.style.display = 'none';
        document.body.appendChild(testModal);

        modalManager.open('testModal');
        assert(modalManager.isOpen('testModal'), 'Modal should be open');

        modalManager.close('testModal');
        assert(!modalManager.isOpen('testModal'), 'Modal should be closed');

        testModal.remove();
    });

    test('ModalManager: CloseAll', () => {
        const modalManager = window.__RM_INTERNAL__?.modalManager;

        // Create multiple modals
        const modal1 = document.createElement('div');
        modal1.id = 'modal1';
        const modal2 = document.createElement('div');
        modal2.id = 'modal2';

        document.body.appendChild(modal1);
        document.body.appendChild(modal2);

        modalManager.open('modal1');
        modalManager.open('modal2', { closeOthers: false });

        modalManager.closeAll();
        assert(!modalManager.isOpen('modal1'), 'Modal1 should be closed');
        assert(!modalManager.isOpen('modal2'), 'Modal2 should be closed');

        modal1.remove();
        modal2.remove();
    });

    // ============================================================================
    // USER DATA TESTS
    // ============================================================================

    test('UserDataManager: Get display name', async () => {
        const userDataManager = window.__RM_INTERNAL__?.userDataManager;
        const storage = window.__RM_INTERNAL__?.storage;

        assert(userDataManager, 'UserDataManager not found');

        const email = storage.get('auth_email');
        if (!email) {
            console.log('  ⚠️  Skipped (not authenticated)');
            return;
        }

        const displayName = await userDataManager.getDisplayName(email);
        console.log(`  ℹ️  Display name: ${displayName}`);
        assert(displayName, 'Display name should be defined');
    });

    test('UserDataManager: Get user stats', async () => {
        const userDataManager = window.__RM_INTERNAL__?.userDataManager;
        const storage = window.__RM_INTERNAL__?.storage;

        const email = storage.get('auth_email');
        if (!email) {
            console.log('  ⚠️  Skipped (not authenticated)');
            return;
        }

        const stats = await userDataManager.getUserStats(email);
        assert(stats, 'Stats should be defined');
        assert(typeof stats.total === 'number', 'Stats.total should be number');
        console.log(`  ℹ️  User has ${stats.total} reviews`);
    });

    // ============================================================================
    // COMPATIBILITY LAYER TESTS
    // ============================================================================

    test('Compat: Old localStorage access redirected', () => {
        const storage = window.__RM_INTERNAL__?.storage;

        // Set via new API
        storage.set('auth_token', 'test_token');

        // Check via compat helper
        assert(window.StorageHelpers.getAuthToken() === 'test_token', 'Compat helper failed');

        // Cleanup
        storage.remove('auth_token');
    });

    test('Compat: Old API functions available', () => {
        assert(typeof window.remoteListReviews === 'function', 'remoteListReviews not found');
        assert(typeof window.remoteSave === 'function', 'remoteSave not found');
        assert(typeof window.openAccountModal === 'function', 'openAccountModal not found');
        assert(typeof window.lockBodyScroll === 'function', 'lockBodyScroll not found');
    });

    test('Compat: Old UserDataManager available', () => {
        assert(window.UserDataManager, 'UserDataManager not exposed globally');
        assert(typeof window.UserDataManager.getDisplayName === 'function', 'getDisplayName not available');
    });

    // ============================================================================
    // RUN ALL TESTS
    // ============================================================================

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const t of tests) {
        try {
            console.log(`🧪 ${t.name}`);
            await t.fn();
            console.log(`  ✅ PASS\n`);
            passed++;
        } catch (error) {
            console.error(`  ❌ FAIL: ${error.message}\n`);
            failed++;
        }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📊 Results: ${passed}/${tests.length} passed, ${failed} failed\n`);

    if (failed === 0) {
        console.log('🎉 All tests passed!\n');
    } else {
        console.warn('⚠️  Some tests failed. Check errors above.\n');
    }

    return { passed, failed, total: tests.length };
})();
