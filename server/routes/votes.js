/**
 * Routes de gestion des votes (likes/dislikes)
 * Gère les votes sur les reviews avec déduplication et comptabilisation
 */

import express from 'express';
import { getDatabase } from '../utils/database.js';
import { authMiddleware, requireAuth } from '../middleware/auth.js';
import { isValidId, isValidVote } from '../utils/validation.js';

const router = express.Router();

/**
 * GET /api/votes/:reviewId
 * Récupère les statistiques de votes pour une review
 */
router.get('/:reviewId', (req, res) => {
    try {
        const reviewId = parseInt(req.params.reviewId);

        if (!isValidId(reviewId)) {
            return res.status(400).json({
                error: 'invalid_id',
                message: 'ID de review invalide'
            });
        }

        const db = getDatabase();

        // Compter les votes
        db.get(
            `SELECT 
        SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END) as upvotes,
        SUM(CASE WHEN vote = -1 THEN 1 ELSE 0 END) as downvotes,
        COUNT(*) as total
       FROM review_likes 
       WHERE review_id = ?`,
            [reviewId],
            (err, stats) => {
                if (err) {
                    console.error('Erreur récupération votes:', err);
                    return res.status(500).json({
                        error: 'db_error',
                        message: 'Erreur lors de la récupération des votes'
                    });
                }

                res.json({
                    reviewId,
                    upvotes: stats?.upvotes || 0,
                    downvotes: stats?.downvotes || 0,
                    total: stats?.total || 0,
                    score: (stats?.upvotes || 0) - (stats?.downvotes || 0)
                });
            }
        );

    } catch (error) {
        console.error('Erreur GET votes:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Erreur lors de la récupération des votes'
        });
    }
});

/**
 * GET /api/votes/:reviewId/user
 * Récupère le vote de l'utilisateur connecté pour une review
 */
router.get('/:reviewId/user', authMiddleware, (req, res) => {
    try {
        const reviewId = parseInt(req.params.reviewId);

        if (!isValidId(reviewId)) {
            return res.status(400).json({
                error: 'invalid_id',
                message: 'ID de review invalide'
            });
        }

        if (!req.auth) {
            return res.json({ vote: null });
        }

        const db = getDatabase();

        db.get(
            'SELECT vote FROM review_likes WHERE review_id = ? AND user_id = ?',
            [reviewId, req.auth.ownerId],
            (err, row) => {
                if (err) {
                    console.error('Erreur récupération vote utilisateur:', err);
                    return res.status(500).json({
                        error: 'db_error',
                        message: 'Erreur lors de la récupération du vote'
                    });
                }

                res.json({
                    reviewId,
                    userId: req.auth.ownerId,
                    vote: row?.vote || null
                });
            }
        );

    } catch (error) {
        console.error('Erreur GET vote utilisateur:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Erreur lors de la récupération du vote'
        });
    }
});

/**
 * POST /api/votes/:reviewId
 * Crée ou met à jour un vote pour une review
 * Body: { vote: 1 | -1 }
 */
router.post('/:reviewId', requireAuth, (req, res) => {
    try {
        const reviewId = parseInt(req.params.reviewId);
        const { vote } = req.body;

        // Validation
        if (!isValidId(reviewId)) {
            return res.status(400).json({
                error: 'invalid_id',
                message: 'ID de review invalide'
            });
        }

        if (!isValidVote(vote)) {
            return res.status(400).json({
                error: 'invalid_vote',
                message: 'Vote invalide (1 pour like, -1 pour dislike)'
            });
        }

        const db = getDatabase();
        const userId = req.auth.ownerId;

        // Vérifier que la review existe
        db.get('SELECT id FROM reviews WHERE id = ?', [reviewId], (err, review) => {
            if (err) {
                console.error('Erreur vérification review:', err);
                return res.status(500).json({
                    error: 'db_error',
                    message: 'Erreur lors de la vérification de la review'
                });
            }

            if (!review) {
                return res.status(404).json({
                    error: 'review_not_found',
                    message: 'Review introuvable'
                });
            }

            // Vérifier si l'utilisateur a déjà voté
            db.get(
                'SELECT vote FROM review_likes WHERE review_id = ? AND user_id = ?',
                [reviewId, userId],
                (err, existingVote) => {
                    if (err) {
                        console.error('Erreur vérification vote existant:', err);
                        return res.status(500).json({
                            error: 'db_error',
                            message: 'Erreur lors de la vérification du vote'
                        });
                    }

                    // Si vote identique, ne rien faire
                    if (existingVote && existingVote.vote === vote) {
                        return res.json({
                            success: true,
                            message: 'Vote déjà enregistré',
                            vote
                        });
                    }

                    const now = new Date().toISOString();

                    // Insérer ou mettre à jour
                    if (existingVote) {
                        // UPDATE
                        db.run(
                            'UPDATE review_likes SET vote = ?, voted_at = ? WHERE review_id = ? AND user_id = ?',
                            [vote, now, reviewId, userId],
                            function (err) {
                                if (err) {
                                    console.error('Erreur mise à jour vote:', err);
                                    return res.status(500).json({
                                        error: 'db_error',
                                        message: 'Erreur lors de la mise à jour du vote'
                                    });
                                }

                                console.log(`Vote mis à jour: review ${reviewId}, user ${userId}, vote ${vote}`);

                                res.json({
                                    success: true,
                                    message: 'Vote mis à jour',
                                    vote,
                                    previousVote: existingVote.vote
                                });
                            }
                        );
                    } else {
                        // INSERT
                        db.run(
                            'INSERT INTO review_likes (review_id, user_id, vote, voted_at) VALUES (?, ?, ?, ?)',
                            [reviewId, userId, vote, now],
                            function (err) {
                                if (err) {
                                    console.error('Erreur insertion vote:', err);
                                    return res.status(500).json({
                                        error: 'db_error',
                                        message: 'Erreur lors de l\'enregistrement du vote'
                                    });
                                }

                                console.log(`Vote créé: review ${reviewId}, user ${userId}, vote ${vote}`);

                                res.status(201).json({
                                    success: true,
                                    message: 'Vote enregistré',
                                    vote
                                });
                            }
                        );
                    }
                }
            );
        });

    } catch (error) {
        console.error('Erreur POST vote:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Erreur lors de l\'enregistrement du vote'
        });
    }
});

/**
 * DELETE /api/votes/:reviewId
 * Supprime le vote de l'utilisateur pour une review
 */
router.delete('/:reviewId', requireAuth, (req, res) => {
    try {
        const reviewId = parseInt(req.params.reviewId);

        if (!isValidId(reviewId)) {
            return res.status(400).json({
                error: 'invalid_id',
                message: 'ID de review invalide'
            });
        }

        const db = getDatabase();
        const userId = req.auth.ownerId;

        db.run(
            'DELETE FROM review_likes WHERE review_id = ? AND user_id = ?',
            [reviewId, userId],
            function (err) {
                if (err) {
                    console.error('Erreur suppression vote:', err);
                    return res.status(500).json({
                        error: 'db_error',
                        message: 'Erreur lors de la suppression du vote'
                    });
                }

                if (this.changes === 0) {
                    return res.status(404).json({
                        error: 'vote_not_found',
                        message: 'Aucun vote à supprimer'
                    });
                }

                console.log(`Vote supprimé: review ${reviewId}, user ${userId}`);

                res.json({
                    success: true,
                    message: 'Vote supprimé'
                });
            }
        );

    } catch (error) {
        console.error('Erreur DELETE vote:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Erreur lors de la suppression du vote'
        });
    }
});

/**
 * GET /api/votes/user/all
 * Récupère tous les votes de l'utilisateur connecté
 */
router.get('/user/all', requireAuth, (req, res) => {
    try {
        const db = getDatabase();
        const userId = req.auth.ownerId;

        db.all(
            `SELECT 
        rl.review_id,
        rl.vote,
        rl.voted_at,
        r.holder_name,
        r.product_type
       FROM review_likes rl
       LEFT JOIN reviews r ON rl.review_id = r.id
       WHERE rl.user_id = ?
       ORDER BY rl.voted_at DESC`,
            [userId],
            (err, rows) => {
                if (err) {
                    console.error('Erreur récupération votes utilisateur:', err);
                    return res.status(500).json({
                        error: 'db_error',
                        message: 'Erreur lors de la récupération des votes'
                    });
                }

                const votes = rows.map(row => ({
                    reviewId: row.review_id,
                    vote: row.vote,
                    votedAt: row.voted_at,
                    review: row.holder_name ? {
                        holderName: row.holder_name,
                        productType: row.product_type
                    } : null
                }));

                res.json({
                    userId,
                    votes,
                    total: votes.length,
                    upvotes: votes.filter(v => v.vote === 1).length,
                    downvotes: votes.filter(v => v.vote === -1).length
                });
            }
        );

    } catch (error) {
        console.error('Erreur GET all votes:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Erreur lors de la récupération des votes'
        });
    }
});

export default router;
