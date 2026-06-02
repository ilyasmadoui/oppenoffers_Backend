// evaluationEmailTemplate.js

/**
 * Fonction pour générer le HTML de l'email de session d'évaluation
 * @param {Object} sessionData - Données de la session (dateSession, operationCount, ... )
 * @returns {string} - HTML prêt à être envoyé
 */
const generateEvaluationEmailHTML = (sessionData) => {
    const { dateSession, operationCount } = sessionData;

    return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Session d'évaluation</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.5; color: #333; }
                .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; }
                .header { background: #004aad; color: white; padding: 10px; border-radius: 6px 6px 0 0; text-align: center; }
                .content { padding: 15px; }
                .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
                .highlight { font-weight: bold; color: #004aad; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Nouvelle session d'évaluation</h2>
                </div>
                <div class="content">
                    <p>Bonjour,</p>
                    <p>Une nouvelle session d'évaluation a été créée à la date du : <span class="highlight">${new Date(dateSession).toLocaleString('fr-FR')}</span></p>
                    <p>Nombre d'opérations associées : <span class="highlight">${operationCount}</span></p>
                    <p>Merci de vérifier les opérations qui vous sont attribuées et de compléter leur évaluation.</p>
                </div>
                <div class="footer">
                    <p>Envoi automatique par le système d'administration.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

module.exports = { generateEvaluationEmailHTML };